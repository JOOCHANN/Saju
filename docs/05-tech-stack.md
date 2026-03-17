# 05. 기술 스택 (Tech Stack)

## 선택 원칙
- **모노레포 + 풀스택**: Next.js 하나로 프론트엔드 + API 서버 통합 (초기 팀 규모에 최적)
- **관리 부담 최소화**: 인프라 운영보다 서비스 개발에 집중
- **Cloudflare Pages 배포**: 전 세계 CDN, 무료 티어, Workers Edge Runtime 활용
- **확장 가능성**: 트래픽 증가 시 분리 가능한 구조

> ⚠️ **Cloudflare Edge Runtime 제약**
> Cloudflare Pages는 Next.js API Routes를 **Cloudflare Workers(Edge Runtime)** 로 실행합니다.
> Node.js 런타임이 아니기 때문에 아래 두 가지를 변경합니다:
> 1. ORM: `Prisma` → `Drizzle ORM` (Edge 호환)
> 2. 모든 API Route에 `export const runtime = 'edge'` 선언 필요

---

## 프론트엔드

| 항목 | 기술 | 이유 |
|------|------|------|
| **프레임워크** | Next.js 14 (App Router) | SSR/SSG/ISR 모두 지원, SEO에 유리, Cloudflare Pages 배포 지원 |
| **언어** | TypeScript | 타입 안전성, 협업/유지보수 |
| **스타일링** | Tailwind CSS | 모바일 우선 반응형 개발 속도, 유틸리티 클래스 |
| **상태 관리** | Zustand | 가볍고 간단, Redux 대비 보일러플레이트 없음 |
| **서버 상태** | TanStack Query (React Query) | API 캐싱, 로딩/에러 상태 관리 |
| **폼 관리** | React Hook Form + Zod | 유효성 검사 타입 안전하게 |
| **UI 컴포넌트** | shadcn/ui | headless + Tailwind 기반, 커스터마이징 용이 |
| **애니메이션** | Framer Motion | 결과 페이지 등장 애니메이션 |
| **아이콘** | Lucide React | shadcn/ui와 궁합 |

---

## 백엔드 (Next.js API Routes → Cloudflare Workers)

| 항목 | 기술 | 이유 |
|------|------|------|
| **API** | Next.js Route Handlers | 별도 서버 불필요, 초기 개발 속도 |
| **ORM** | **Drizzle ORM** | ~~Prisma~~ → Edge Runtime 완전 호환, 경량, 타입 안전 |
| **DB 드라이버** | `@supabase/supabase-js` (HTTP) | Edge에서 Supabase PostgreSQL 접근 (WebSocket 불필요) |
| **인증** | NextAuth.js v5 (Auth.js) | Edge Runtime 지원, 소셜 로그인 통합 |
| **유효성 검사** | Zod | 클라이언트/서버 공통 스키마 재사용 |
| **AI** | Anthropic SDK (Claude) | Edge 호환, 사주 해석/운세 생성 |
| **이메일** | Resend | Edge 호환 HTTP API, 이메일 인증/발송 |

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
| **호스팅** | **Cloudflare Pages** | 전 세계 CDN, 무료 티어 넉넉, Workers Edge 실행 |
| **배포 도구** | `@cloudflare/next-on-pages` | Next.js → Cloudflare Pages 변환 어댑터 |
| **로컬 개발** | `wrangler` CLI | Cloudflare 로컬 개발/시뮬레이션 |
| **CDN / 이미지** | Cloudflare Images + `@vercel/og` | OG 이미지 생성 (Edge 호환) |
| **모니터링** | Sentry | 에러 트래킹 |
| **분석** | Posthog | 사용자 행동 분석 (Cloudflare와 무관) |

### Cloudflare Pages 배포 흐름
```
GitHub push → Cloudflare Pages 자동 빌드
    → npx @cloudflare/next-on-pages
    → Cloudflare CDN 전 세계 배포
```

---

## 개발 도구

| 항목 | 기술 |
|------|------|
| **패키지 매니저** | pnpm |
| **린터** | ESLint + Prettier |
| **테스트** | Vitest (unit) + Playwright (E2E) |
| **버전 관리** | Git + GitHub |
| **CI/CD** | Cloudflare Pages 자동 배포 (GitHub 연결) |
| **Cloudflare CLI** | `wrangler` (로컬 개발/환경변수 관리) |

---

## 아키텍처 다이어그램

```
[클라이언트 (브라우저/모바일)]
         │
         │ HTTPS
         ▼
[Cloudflare Global CDN]
         │
         ▼
[Cloudflare Pages + Workers (Edge Runtime)]
    ├── /app/*          (React 페이지 — SSG/Edge SSR)
    └── /api/*          (Route Handlers — Workers로 실행)
              │
              ├── [Supabase PostgreSQL]     (영구 데이터 — HTTP 접근)
              ├── [Upstash Redis]            (캐시 / 레이트리밋 — HTTP)
              ├── [Anthropic Claude API]     (AI 해석 — HTTP)
              ├── [Toss Payments API]        (결제 — Phase 2)
              └── [Resend API]               (이메일 — HTTP)
```

> 모든 외부 서비스가 **HTTP 기반 API**이므로 Edge Runtime에서 완전 동작

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

로컬: `.env.local` / 프로덕션: Cloudflare Pages Dashboard → Settings → Environment Variables

```env
# 앱
NEXT_PUBLIC_APP_URL=

# 데이터베이스 (Supabase)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # 서버 사이드 전용 (절대 NEXT_PUBLIC_ 붙이지 말 것)

# 인증 (NextAuth.js)
AUTH_SECRET=                   # NextAuth v5는 AUTH_SECRET 사용
AUTH_KAKAO_ID=
AUTH_KAKAO_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# AI
ANTHROPIC_API_KEY=

# 캐시
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# 암호화 (개인정보)
ENCRYPTION_KEY=                # 32바이트 hex (openssl rand -hex 32 로 생성)

# 결제 (Phase 2)
TOSS_CLIENT_KEY=
TOSS_SECRET_KEY=

# 이메일
RESEND_API_KEY=

# 모니터링
SENTRY_DSN=
```

### Cloudflare 환경 변수 설정 방법
```bash
# wrangler로 시크릿 등록 (프로덕션)
wrangler pages secret put ANTHROPIC_API_KEY
wrangler pages secret put SUPABASE_SERVICE_ROLE_KEY
# ... 기타 시크릿
```
