# 07. 데이터베이스 스키마 (Database Schema)

## ERD 개요

```
User ──────────── Reading (1:N)
  │                   │
  └── UserProfile      └── 사주 분석 결과

Reading ──────── Payment (1:1, Phase 2)

DailyFortune (독립 테이블, 캐시 용도)
```

---

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────
// 사용자 (NextAuth 호환)
// ─────────────────────────────────
model User {
  id            String    @id @default(cuid())
  email         String?   @unique
  emailVerified DateTime?
  name          String?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts    Account[]
  sessions    Session[]
  profile     UserProfile?
  readings    Reading[]

  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

// ─────────────────────────────────
// 사용자 프로필 (사주 기본 정보)
// ─────────────────────────────────
model UserProfile {
  id        String   @id @default(cuid())
  userId    String   @unique
  birthDate DateTime // 생년월일 (암호화 저장)
  birthHour Int?     // 출생 시간 (0-23, null=모름)
  gender    Gender
  isLunar   Boolean  @default(false) // 음력 여부
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_profiles")
}

enum Gender {
  MALE
  FEMALE
}

// ─────────────────────────────────
// 사주 분석 결과 (Reading)
// ─────────────────────────────────
model Reading {
  id          String      @id @default(cuid())
  userId      String?     // null = 비로그인 임시 저장
  type        ReadingType
  inputData   Json        // 입력값 (암호화)
  resultData  Json        // AI 분석 결과
  isPublic    Boolean     @default(false)
  shareToken  String?     @unique // 공유 링크 토큰
  createdAt   DateTime    @default(now())

  user    User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  payment Payment?

  @@index([userId])
  @@map("readings")
}

enum ReadingType {
  SAJU_BASIC      // 사주 기본 분석
  COMPATIBILITY   // 궁합 (Phase 2)
  DAEUN           // 대운 (Phase 2)
  ANNUAL          // 연도별 운세 (Phase 2)
  택일            // 택일 (Phase 3)
}

// ─────────────────────────────────
// 결제 (Phase 2)
// ─────────────────────────────────
model Payment {
  id            String        @id @default(cuid())
  readingId     String        @unique
  userId        String
  amount        Int           // 결제 금액 (원)
  currency      String        @default("KRW")
  status        PaymentStatus
  provider      String        // "toss"
  providerPayId String?       @unique // Toss 결제 ID
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  reading Reading @relation(fields: [readingId], references: [id])

  @@map("payments")
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}

// ─────────────────────────────────
// 오늘의 운세 캐시 (DB 레벨 캐시)
// ─────────────────────────────────
// 주: Redis를 primary 캐시로 사용하되,
//     DB에도 저장하여 내역 관리
model DailyFortune {
  id         String   @id @default(cuid())
  date       String   // YYYY-MM-DD
  zodiac     String   // 띠 (rat, ox, tiger, ...)
  content    Json     // 운세 내용
  createdAt  DateTime @default(now())

  @@unique([date, zodiac])
  @@map("daily_fortunes")
}
```

---

## 민감 데이터 처리

생년월일, 출생시간 등 개인정보는 `inputData` / `birthDate` 컬럼에 **AES-256-GCM** 암호화 후 저장.

```typescript
// src/lib/crypto.ts 예시
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex') // 32 bytes

export function encrypt(text: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGORITHM, KEY, iv)
  // ...
}
```

---

## 인덱스 전략

```sql
-- 자주 조회되는 패턴에 인덱스 추가
CREATE INDEX idx_readings_user_id ON readings(user_id);
CREATE INDEX idx_readings_created_at ON readings(created_at DESC);
CREATE INDEX idx_daily_fortune_date_zodiac ON daily_fortunes(date, zodiac);
```

---

## 데이터 보존 정책

| 데이터 | 보존 기간 | 삭제 방식 |
|--------|----------|----------|
| 사용자 계정 | 탈퇴 후 30일 | 소프트 딜리트 → 하드 딜리트 |
| 사주 분석 결과 | 계정 연동 시 영구 / 비로그인 시 24시간 | 배치 삭제 |
| 오늘의 운세 | 90일 | 배치 삭제 |
| 결제 내역 | 5년 (법적 의무) | 보존 |
