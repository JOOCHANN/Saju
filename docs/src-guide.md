# src/ 폴더 개발 가이드

개발 시 각 폴더에서 무엇을 만들어야 하는지 정리한 가이드입니다.

---

## `src/app/` — 페이지 & API

Next.js 14 App Router 기반. **파일 = 라우트**.

### 만들어야 할 파일들

```
app/
├── layout.tsx              # 전체 앱 레이아웃, 폰트, Provider 설정
├── page.tsx                # 홈 화면 (서비스 소개, CTA)
├── globals.css             # Tailwind 기본 스타일
│
├── (auth)/
│   ├── login/page.tsx      # 로그인 폼 + 소셜 로그인 버튼
│   └── register/page.tsx   # 이메일 회원가입 폼
│
├── (main)/
│   ├── layout.tsx          # 하단 탭바 레이아웃
│   ├── daily/page.tsx      # 오늘의 운세: 띠 선택 → 결과 표시
│   ├── saju/
│   │   ├── page.tsx        # 사주 분석 입력 폼
│   │   └── result/page.tsx # AI 분석 결과 표시 (SSE 스트리밍)
│   └── mypage/
│       ├── page.tsx        # 마이페이지 대시보드
│       └── readings/page.tsx # 저장된 사주 목록
│
└── api/
    ├── auth/[...nextauth]/route.ts  # NextAuth 핸들러 (건드리지 않음)
    ├── saju/
    │   ├── analyze/route.ts         # POST: 사주 분석 (SSE 스트리밍 응답)
    │   └── [id]/route.ts            # GET/DELETE: 분석 결과 조회/삭제
    ├── daily/route.ts               # GET: 오늘의 운세 (캐시 우선)
    └── user/
        ├── profile/route.ts         # GET/PUT: 사용자 프로필
        └── readings/route.ts        # GET: 분석 목록
```

**핵심 패턴:**
- 서버 컴포넌트 기본 사용 (async/await 직접)
- 클라이언트 인터랙션 필요한 부분만 `"use client"`
- API Route에서 모든 입력은 Zod로 검증

---

## `src/components/` — React 컴포넌트

### 만들어야 할 컴포넌트

```
components/
├── ui/                     # shadcn/ui (npx shadcn@latest add ... 로 자동 생성)
│   └── button, card, input, dialog, select, tabs, ...
│
├── layout/
│   ├── BottomTabBar.tsx    # 하단 고정 탭 (홈/운세/사주/보관함/마이)
│   ├── Header.tsx          # 상단 헤더 (로고, 로그인 버튼)
│   └── PageContainer.tsx   # 최대 너비 + 패딩 컨테이너
│
├── saju/
│   ├── BirthInputForm.tsx  # 생년월일/시간/성별 입력 폼
│   │                       # 양력/음력 토글, 날짜 피커, 시간 선택
│   ├── FourPillarsTable.tsx # 사주 원국 2×4 표 (천간/지지)
│   ├── OhaengChart.tsx     # 오행 분포 막대 차트 (목화토금수)
│   └── ReadingResult.tsx   # AI 해석 텍스트 (스트리밍 타이핑 효과)
│
├── daily/
│   ├── ZodiacSelector.tsx  # 12띠 그리드 선택 UI
│   └── FortuneCard.tsx     # 운세 카드 (점수 별 + 한줄 요약)
│
└── auth/
    ├── LoginForm.tsx       # 이메일/비밀번호 입력
    └── SocialLoginButtons.tsx # 카카오/구글 버튼
```

**원칙:**
- `components/ui/`는 shadcn 자동 생성, 직접 수정 최소화
- 비즈니스 로직은 컴포넌트에 넣지 않고 hooks/lib으로 분리

---

## `src/lib/` — 핵심 비즈니스 로직

서버/클라이언트 모두에서 사용 가능한 순수 로직.

### `saju-engine/` — 사주 계산 (핵심!)

```typescript
// four-pillars.ts: 사주 원국 계산
export function calculateFourPillars(
  birthDate: Date,
  birthHour: number | null,
  isLunar: boolean
): FourPillars

// ohaeng.ts: 오행 분포 계산
export function calculateOhaeng(pillars: FourPillars): OhaengDistribution

// ganzhi.ts: 60간지 변환
export function getGanzhi(year: number): { cheongan: string; jiji: string }
```

### `ai/` — Claude API 연동

```typescript
// claude.ts: Claude 클라이언트
export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// prompts/saju-analysis.ts: 사주 해석 프롬프트 빌더
export function buildSajuAnalysisPrompt(pillars: FourPillars, gender: Gender): string

// 프롬프트 작성 원칙:
// - 시스템: 사주 전문가 역할, 한국어 응답
// - 사용자 입력을 시스템 프롬프트와 분리 (보안)
// - JSON 구조로 응답 요청 (파싱 용이)
```

### `db/prisma.ts` — DB 클라이언트 싱글톤

```typescript
// 개발 환경 핫 리로드 시 중복 생성 방지
const globalForPrisma = globalThis as { prisma?: PrismaClient }
export const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### `cache/redis.ts` — Redis 캐시

```typescript
// Upstash Redis (HTTP 기반, Serverless 최적)
import { Redis } from '@upstash/redis'
export const redis = Redis.fromEnv()

// 사용 예시
await redis.set(`daily:${zodiac}:${date}`, JSON.stringify(data), { ex: 86400 })
const cached = await redis.get(`daily:${zodiac}:${date}`)
```

### `crypto.ts` — 개인정보 암호화

```typescript
// AES-256-GCM으로 민감 데이터 암호화/복호화
export function encrypt(plaintext: string): string
export function decrypt(ciphertext: string): string
```

---

## `src/hooks/` — React Hooks

```typescript
// useSajuAnalysis.ts
// SSE 스트리밍을 React 상태로 관리
export function useSajuAnalysis() {
  // POST /api/saju/analyze → SSE 스트리밍
  // 반환: { analyze, pillars, ohaeng, analysisText, isLoading, error }
}

// useDailyFortune.ts
// 오늘의 운세 데이터 조회
export function useDailyFortune(zodiac: Zodiac) {
  // TanStack Query로 GET /api/daily 캐싱
}

// useAuth.ts
// NextAuth 세션 래퍼
export function useAuth() {
  // session, isLoading, isAuthenticated 반환
}
```

---

## `src/stores/` — Zustand 상태 관리

```typescript
// sajuStore.ts: 사주 입력 임시 상태 (폼 → 결과 페이지 이동 시 유지)
interface SajuStore {
  birthDate: string | null
  birthHour: number | null
  gender: Gender | null
  isLunar: boolean
  setInput: (input: Partial<SajuInput>) => void
  reset: () => void
}

// authStore.ts: UI용 인증 상태 (NextAuth 보조)
// 주로 useSession()으로 충분, 추가 UI 상태만 저장
```

---

## `src/types/` — TypeScript 타입 정의

```typescript
// saju.ts
type Cheongan = '갑' | '을' | '병' | '정' | '무' | '기' | '경' | '신' | '임' | '계'
type Jiji = '자' | '축' | '인' | '묘' | '진' | '사' | '오' | '미' | '신' | '유' | '술' | '해'
type Zodiac = 'rat' | 'ox' | 'tiger' | 'rabbit' | 'dragon' | 'snake' |
              'horse' | 'goat' | 'monkey' | 'rooster' | 'dog' | 'pig'

interface GanzhiPillar {
  cheongan: Cheongan
  jiji: Jiji
}

interface FourPillars {
  year: GanzhiPillar
  month: GanzhiPillar
  day: GanzhiPillar
  hour: GanzhiPillar | null
}

interface OhaengDistribution {
  wood: number   // 목(木)
  fire: number   // 화(火)
  earth: number  // 토(土)
  metal: number  // 금(金)
  water: number  // 수(水)
}

// user.ts
type Gender = 'MALE' | 'FEMALE'

// api.ts
interface ApiResponse<T> {
  data: T
  meta?: { requestId: string; timestamp: string }
}

interface ApiError {
  error: { code: string; message: string }
}
```

---

## `src/utils/` — 유틸리티

```typescript
// date.ts
export function formatKoreanDate(date: Date): string  // "2026년 3월 17일"
export function getZodiacFromYear(year: number): Zodiac
export function getTodayString(): string  // "YYYY-MM-DD"

// format.ts
export function truncateText(text: string, maxLength: number): string

// constants.ts
export const ZODIAC_LABELS: Record<Zodiac, string> = {
  rat: '쥐띠', ox: '소띠', ...
}
export const CHEONGAN_OHAENG: Record<Cheongan, OhaengElement> = { ... }
export const JIJI_OHAENG: Record<Jiji, OhaengElement> = { ... }
```

---

## `src/lib/db/` — DB 스키마 (Drizzle ORM)

→ [07-database-schema.md](07-database-schema.md) 참조

```
src/lib/db/
  ├── schema.ts      # Drizzle 테이블/enum 정의
  ├── index.ts       # Supabase HTTP 드라이버로 Drizzle 클라이언트 생성
  └── migrations/    # 자동 생성된 마이그레이션 파일
```

스키마 변경 시:
```bash
pnpm drizzle-kit generate   # 마이그레이션 파일 생성
pnpm drizzle-kit migrate    # Supabase DB에 적용
pnpm drizzle-kit studio     # DB GUI (로컬 확인용)
```
