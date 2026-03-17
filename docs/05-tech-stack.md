# 05. 기술 스택 (Tech Stack)

## 선택 원칙
- **모노레포 + 풀스택**: Next.js 하나로 프론트엔드 + API 서버 통합 (초기 팀 규모에 최적)
- **관리 부담 최소화**: 인프라 운영보다 서비스 개발에 집중
- **확장 가능성**: 트래픽 증가 시 분리 가능한 구조

---

## 프론트엔드

| 항목 | 기술 | 이유 |
|------|------|------|
| **프레임워크** | Next.js 14 (App Router) | SSR/SSG/ISR 모두 지원, SEO에 유리, Vercel 배포 최적 |
| **언어** | TypeScript | 타입 안전성, 협업/유지보수 |
| **스타일링** | Tailwind CSS | 모바일 우선 반응형 개발 속도, 유틸리티 클래스 |
| **상태 관리** | Zustand | 가볍고 간단, Redux 대비 보일러플레이트 없음 |
| **서버 상태** | TanStack Query (React Query) | API 캐싱, 로딩/에러 상태 관리 |
| **폼 관리** | React Hook Form + Zod | 유효성 검사 타입 안전하게 |
| **UI 컴포넌트** | shadcn/ui | headless + Tailwind 기반, 커스터마이징 용이 |
| **애니메이션** | Framer Motion | 결과 페이지 등장 애니메이션 |
| **아이콘** | Lucide React | shadcn/ui와 궁합 |

---

## 백엔드 (Next.js API Routes)

| 항목 | 기술 | 이유 |
|------|------|------|
| **API** | Next.js Route Handlers | 별도 서버 불필요, 초기 개발 속도 |
| **ORM** | Prisma | 타입 안전한 DB 접근, 마이그레이션 관리 용이 |
| **인증** | NextAuth.js v5 (Auth.js) | 소셜 로그인 통합 간편 |
| **유효성 검사** | Zod | 클라이언트/서버 공통 스키마 재사용 |
| **AI** | Anthropic SDK (Claude) | 사주 해석, 운세 생성 |
| **이메일** | Resend | 이메일 인증, 마케팅 발송 |

---

## 데이터베이스 & 캐시

| 항목 | 기술 | 이유 |
|------|------|------|
| **메인 DB** | PostgreSQL (via Supabase) | 관계형 데이터, 무료 티어, Auth/Storage 통합 |
| **캐시** | Upstash Redis | Serverless Redis, 일일 운세 캐싱, 레이트 리밋 |

> **Supabase 선택 이유**: PostgreSQL + 인증 + 스토리지 + 실시간 기능을 한 번에 제공.
> 초기에 별도 인프라 설정 없이 빠르게 시작 가능.

---

## 결제

| 항목 | 기술 | 이유 |
|------|------|------|
| **결제 게이트웨이** | Toss Payments | 한국 표준, 카드/카카오페이 통합, 개발자 경험 우수 |

---

## 인프라 & 배포

| 항목 | 기술 | 이유 |
|------|------|------|
| **호스팅** | Vercel | Next.js 최적화, 자동 배포, Edge 지원 |
| **CDN / 이미지** | Vercel OG + Cloudinary | OG 이미지 자동 생성, 이미지 최적화 |
| **모니터링** | Sentry | 에러 트래킹 |
| **분석** | Vercel Analytics + Posthog | 사용자 행동 분석 |

---

## 개발 도구

| 항목 | 기술 |
|------|------|
| **패키지 매니저** | pnpm |
| **린터** | ESLint + Prettier |
| **테스트** | Vitest (unit) + Playwright (E2E) |
| **버전 관리** | Git + GitHub |
| **CI/CD** | GitHub Actions |

---

## 아키텍처 다이어그램

```
[클라이언트 (브라우저/모바일)]
         │
         │ HTTPS
         ▼
[Vercel Edge Network]
         │
         ▼
[Next.js App (Vercel)]
    ├── /app/*          (React 페이지 — SSR/SSG)
    └── /api/*          (Route Handlers — API)
              │
              ├── [Supabase PostgreSQL]  (영구 데이터)
              ├── [Upstash Redis]        (캐시 / 세션)
              ├── [Anthropic Claude API] (AI 해석)
              ├── [Toss Payments API]    (결제)
              └── [Resend API]           (이메일)
```

---

## 사주 계산 엔진

사주(四柱) 계산은 순수 TypeScript로 직접 구현:

```
src/lib/saju-engine/
  ├── solar-to-lunar.ts    # 양력 → 음력 변환
  ├── ganzhi.ts            # 간지(干支) 계산
  ├── four-pillars.ts      # 사주 원국 계산
  ├── ten-gods.ts          # 십신(十神) 계산
  ├── ohaeng.ts            # 오행(五行) 분석
  └── index.ts             # 통합 인터페이스
```

> 참고: `lunar-javascript` 또는 `korean-lunar-calendar` npm 패키지를 음력 변환에 활용 가능

---

## 환경 변수 목록

```env
# 앱
NEXT_PUBLIC_APP_URL=

# 데이터베이스
DATABASE_URL=              # Supabase PostgreSQL

# 인증 (NextAuth.js)
NEXTAUTH_URL=
NEXTAUTH_SECRET=
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# AI
ANTHROPIC_API_KEY=

# 캐시
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# 결제 (Phase 2)
TOSS_CLIENT_KEY=
TOSS_SECRET_KEY=

# 이메일
RESEND_API_KEY=

# 모니터링
SENTRY_DSN=
```
