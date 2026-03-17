import {
  boolean,
  index,
  integer,
  json,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import type { AdapterAccountType } from 'next-auth/adapters'

// ─────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────

export const genderEnum = pgEnum('gender', ['MALE', 'FEMALE'])

export const readingTypeEnum = pgEnum('reading_type', [
  'SAJU_BASIC',
  'COMPATIBILITY',
  'DAEUN',
  'ANNUAL',
  'TAEGIL',
])

export const paymentStatusEnum = pgEnum('payment_status', [
  'PENDING',
  'COMPLETED',
  'FAILED',
  'REFUNDED',
])

// ─────────────────────────────────────────────────────────────
// Auth.js (NextAuth v5) 필수 테이블
// @auth/drizzle-adapter 호환 스키마
// ─────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
})

export const accounts = pgTable(
  'accounts',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => [primaryKey({ columns: [account.provider, account.providerAccountId] })],
)

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
)

// ─────────────────────────────────────────────────────────────
// 사용자 프로필 (사주 기본 정보)
// birthDate, birthHour 는 AES-256-GCM 암호화 후 저장
// ─────────────────────────────────────────────────────────────

export const userProfiles = pgTable('user_profiles', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  // 암호화된 생년월일 (YYYY-MM-DD → AES-256-GCM → base64)
  birthDate: text('birth_date').notNull(),
  // 암호화된 출생 시간 (0-23, null=모름 → AES-256-GCM → base64)
  birthHour: text('birth_hour'),
  gender: genderEnum('gender').notNull(),
  isLunar: boolean('is_lunar').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
})

// ─────────────────────────────────────────────────────────────
// 사주 분석 결과 (Reading)
// inputData: 암호화된 입력값 JSON
// resultData: AI 분석 결과 JSON
// ─────────────────────────────────────────────────────────────

export const readings = pgTable(
  'readings',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
    type: readingTypeEnum('type').notNull(),
    inputData: json('input_data').notNull(), // 암호화된 입력값
    resultData: json('result_data').notNull(), // AI 분석 결과
    isPublic: boolean('is_public').notNull().default(false),
    shareToken: text('share_token').unique(), // 공유 링크 토큰
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (reading) => [
    index('idx_readings_user_id').on(reading.userId),
    index('idx_readings_created_at').on(reading.createdAt),
  ],
)

// ─────────────────────────────────────────────────────────────
// 오늘의 운세 캐시
// Redis를 primary 캐시로 사용하되 DB에도 저장 (내역 관리용)
// ─────────────────────────────────────────────────────────────

export const dailyFortunes = pgTable(
  'daily_fortunes',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    date: text('date').notNull(), // YYYY-MM-DD
    zodiac: text('zodiac').notNull(), // rat | ox | tiger | rabbit | dragon | snake | horse | goat | monkey | rooster | dog | pig
    content: json('content').notNull(), // 운세 내용 JSON
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (fortune) => [uniqueIndex('idx_daily_fortune_date_zodiac').on(fortune.date, fortune.zodiac)],
)

// ─────────────────────────────────────────────────────────────
// 결제 (Phase 2)
// ─────────────────────────────────────────────────────────────

export const payments = pgTable('payments', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  readingId: text('reading_id')
    .notNull()
    .unique()
    .references(() => readings.id),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  amount: integer('amount').notNull(), // 결제 금액 (원)
  currency: text('currency').notNull().default('KRW'),
  status: paymentStatusEnum('status').notNull(),
  provider: text('provider').notNull().default('toss'),
  providerPayId: text('provider_pay_id').unique(), // Toss 결제 ID
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
})
