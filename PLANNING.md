# Saju 서비스 기획서 (Master Planning Document)

> 이 문서는 Saju 프로젝트의 최상위 기획 문서 + 개발 진행 현황 기록입니다.
> **새 세션 시작 시 → "개발 단계별 진행 현황" 섹션을 먼저 확인하세요.**
> 세부 기획은 `docs/` 디렉토리의 각 문서를 참조하세요.

## 서비스 한줄 정의

> **AI 기반 사주/운세 모바일 웹 서비스** — 누구나 쉽게 접근 가능한 무료 콘텐츠로 시작해,
> 개인화된 AI 사주 분석으로 연결되는 한국어 사주 플랫폼

---

## 문서 구조

| 문서 | 내용 |
|------|------|
| [01-product-vision.md](docs/01-product-vision.md) | 서비스 비전, 목표, MVP 범위 |
| [02-user-personas.md](docs/02-user-personas.md) | 사용자 페르소나 및 핵심 니즈 |
| [03-user-flows.md](docs/03-user-flows.md) | 사용자 흐름도 및 핵심 여정 |
| [04-features.md](docs/04-features.md) | 기능 명세 (Phase별) |
| [05-tech-stack.md](docs/05-tech-stack.md) | 기술 스택 선택 및 근거 |
| [06-architecture.md](docs/06-architecture.md) | 시스템 아키텍처 설계 |
| [07-database-schema.md](docs/07-database-schema.md) | 데이터베이스 스키마 설계 |
| [08-api-design.md](docs/08-api-design.md) | API 엔드포인트 설계 |
| [09-security-privacy.md](docs/09-security-privacy.md) | 보안 및 개인정보 처리 설계 |
| [10-roadmap.md](docs/10-roadmap.md) | 개발 로드맵 및 우선순위 |
| [11-cloudflare-setup.md](docs/11-cloudflare-setup.md) | Cloudflare Pages 배포 설정 가이드 |

---

## 폴더 구조 (Step 1 완료 기준)

```
Saju/
├── PLANNING.md                    # 이 문서 (최상위 기획서 + 개발 진행 현황)
├── CLAUDE.md                      # Claude Code 지침
├── docs/                          # 기획/설계 문서
│   ├── 01-product-vision.md
│   ├── 02-user-personas.md
│   ├── 03-user-flows.md
│   ├── 04-features.md
│   ├── 05-tech-stack.md
│   ├── 06-architecture.md
│   ├── 07-database-schema.md
│   ├── 08-api-design.md
│   ├── 09-security-privacy.md
│   ├── 10-roadmap.md
│   ├── 11-cloudflare-setup.md
│   └── src-guide.md
├── src/
│   ├── app/
│   │   ├── layout.tsx             # 루트 레이아웃 (한국어 메타데이터)
│   │   ├── page.tsx               # 홈 (임시 placeholder)
│   │   └── globals.css            # Tailwind + shadcn/ui CSS 변수
│   └── lib/
│       └── utils.ts               # cn() 유틸리티
├── public/
├── package.json
├── next.config.ts
├── open-next.config.ts            # OpenNext Cloudflare 어댑터 설정
├── wrangler.toml                  # Cloudflare Workers 배포 설정
├── tailwind.config.ts
├── tsconfig.json
├── .prettierrc
├── .env.example                   # 환경 변수 템플릿
└── .dev.vars.example              # Cloudflare 로컬 개발 시크릿 템플릿
```

---

## 개발 단계별 진행 현황

> 새 세션을 시작할 때 이 섹션을 먼저 확인하세요.
> 완료 단계부터 이어서 작업합니다.

### 진행 현황 요약

| 단계 | 내용 | 상태 |
|------|------|------|
| Step 1 | 프로젝트 초기화 | ✅ 완료 |
| Step 2 | 기본 레이아웃 (하단 탭바, 헤더, 홈 뼈대) | ✅ 완료 |
| Step 3 | DB 설정 (Supabase + Drizzle 스키마 + 마이그레이션) | ✅ 완료 |
| Step 4 | 인증 (NextAuth.js v5 — Google/Kakao OAuth + 이메일) | ✅ 완료 |
| Step 5 | 사주 계산 엔진 (순수 TypeScript 간지/사주/오행) | ⬜ 미완료 |
| Step 6 | AI 연동 (Claude API + SSE 스트리밍 + 결과 UI) | ⬜ 미완료 |
| Step 7 | 오늘의 운세 (12간지 UI + Redis 캐싱 + 운세 카드) | ⬜ 미완료 |
| Step 8 | 마이페이지 / 보관함 (분석 저장·조회, 계정 설정) | ⬜ 미완료 |

---

### Step 1 — 프로젝트 초기화 ✅

**완료 내용:**
- Next.js 15.3.9 수동 초기화 (`create-next-app` 대문자 이슈로 수동 설정)
- 설정 파일: `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `.prettierrc`
- Cloudflare 배포 설정: `wrangler.toml`, `open-next.config.ts` (`@opennextjs/cloudflare` 사용)
- 소스 파일: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `src/lib/utils.ts`
- 환경 변수 템플릿: `.env.example`, `.dev.vars.example`
- `pnpm install` 완료, `next build` 빌드 테스트 통과
- GitHub `origin/main` 브랜치에 푸시 완료

**주요 기술 결정:**
- Prisma → **Drizzle ORM** (Cloudflare Edge Runtime 비호환 이슈)
- `@cloudflare/next-on-pages` → **`@opennextjs/cloudflare`** (공식 권장 어댑터로 교체)
- ISR 미지원 → Redis 캐싱으로 대체 예정
- `next@15.3.9` (CVE-2025-66478 보안 패치 버전)

---

### Step 2 — 기본 레이아웃 ✅

**완료 내용:**
- `src/components/layout/BottomTabBar.tsx` — 고정 하단 네비게이션 (홈/운세/사주/보관함/마이), 라우트별 활성 상태
- `src/components/layout/Header.tsx` — 상단 헤더, 페이지별 동적 타이틀 (client component)
- `src/app/layout.tsx` — 루트 레이아웃에 Header + BottomTabBar 포함
- `src/app/page.tsx` — 홈 화면 (날짜 인사, 운세 CTA 카드, 서비스 그리드 2×2, AI 사주 배너)
- `src/app/fortune/page.tsx`, `saju/page.tsx`, `storage/page.tsx`, `mypage/page.tsx` — 탭별 플레이스홀더 페이지

**주요 기술 결정:**
- `@opennextjs/cloudflare` v1.7+의 새 API로 `open-next.config.ts` 마이그레이션 (`defineCloudflareConfig` 사용)
- 루트 레이아웃에 크롬 포함 (향후 Step 4 auth 추가 시 route group으로 재구성 예정)
- `@eslint/eslintrc`, `eslint-plugin-react-hooks` devDependency 추가

---

### Step 3 — DB 설정 ✅

**완료 내용:**
- `drizzle.config.ts` — drizzle-kit 설정 (`DATABASE_URL_UNPOOLED` 마이그레이션용)
- `src/lib/db/schema.ts` — 전체 Drizzle 스키마 정의
  - Auth.js 호환 테이블: `users`, `accounts`, `sessions`, `verification_tokens`
  - 앱 테이블: `user_profiles`, `readings`, `daily_fortunes`, `payments`
  - Enums: `gender`, `reading_type`, `payment_status`
- `src/lib/db/index.ts` — Drizzle 클라이언트 (postgres driver, `prepare: false`)
- `src/lib/crypto.ts` — AES-256-GCM 암호화 (Web Crypto API, Edge 완전 호환)
- `.env.example` / `.dev.vars.example` — `DATABASE_URL`, `DATABASE_URL_UNPOOLED` 추가
- `postgres` npm 패키지 설치

**실제 DB 마이그레이션 방법 (Supabase 프로젝트 생성 후):**
```bash
# .env.local 에 DATABASE_URL_UNPOOLED 설정 후:
pnpm db:generate   # 마이그레이션 파일 생성
pnpm db:migrate    # Supabase에 스키마 적용
```

**주요 기술 결정:**
- `postgres` 드라이버 + `prepare: false` → Supabase pgBouncer Transaction 모드 호환
- `crypto.subtle` (Web Crypto API) → Cloudflare Workers Edge Runtime 완전 호환
- Auth.js Drizzle 어댑터 호환 스키마 미리 정의 (Step 4 auth에서 바로 사용)

---

### Step 4 — 인증 ✅

**완료 내용:**
- `src/auth.ts` — NextAuth v5 설정 (JWT 전략, Kakao/Google/Resend 프로바이더, DrizzleAdapter)
- `src/app/api/auth/[...nextauth]/route.ts` — Auth 핸들러 (runtime: nodejs, dynamic: force-dynamic)
- `src/middleware.ts` — `/storage` 등 보호 라우트 → 미로그인 시 `/login` 리다이렉트
- `src/app/login/page.tsx` — 로그인 UI (카카오 노란 버튼 최상단, Google, 이메일 매직링크)
- `src/components/auth/EmailLoginForm.tsx` — 이메일 매직링크 폼 (client component)
- `src/components/layout/ShellWrapper.tsx` — `/login` 등 auth 페이지에서 탭바/헤더 숨김
- `src/types/auth.d.ts` — session.user.id 타입 확장
- `src/app/mypage/page.tsx` — 로그인 상태 반영 (프로필, 로그아웃 버튼)
- CLAUDE.md 업데이트 — runtime 규칙 명확화

**주요 기술 결정:**
- JWT 전략: Edge Runtime에서 DB 없이 세션 검증 가능
- Auth API 라우트: `runtime = 'nodejs'` (postgres가 Node.js TCP 필요), `dynamic = 'force-dynamic'`
- DB 초기화: 빈 URL로 초기화 후 실제 쿼리 시 연결 (빌드 타임 오류 방지)
- `ShellWrapper`: `/login`, `/signup` 경로에서 네비게이션 UI 숨김

**실제 OAuth 연동 방법 (배포 전):**
- Kakao Developers: 앱 생성 → REST API 키 → `AUTH_KAKAO_ID/SECRET`
- Google Cloud Console: OAuth 2.0 클라이언트 → `AUTH_GOOGLE_ID/SECRET`
- `.dev.vars`에 모든 키 추가 후 `pnpm dev`

---

### Step 5 — 사주 계산 엔진 ⬜

**작업 예정:**
- 순수 TypeScript 사주 엔진 (`src/lib/saju/`)
- 간지(干支), 사주팔자, 오행(五行), 십신(十神) 계산 로직
- 서버/클라이언트 모두 사용 가능한 Edge 호환 모듈

---

### Step 6 — AI 연동 ⬜

**작업 예정:**
- Anthropic Claude API 연동 (`src/lib/ai/`)
- SSE 스트리밍 응답 처리
- 사주 분석 결과 UI 컴포넌트

---

### Step 7 — 오늘의 운세 ⬜

**작업 예정:**
- 12간지 띠별 운세 UI
- Upstash Redis 캐싱 (일별 갱신)
- 운세 카드 컴포넌트

---

### Step 8 — 마이페이지 / 보관함 ⬜

**작업 예정:**
- 분석 결과 저장 및 조회
- 계정 설정 페이지
- 사주 보관함 목록 UI

---

## 개발 Phase 요약

### Phase 1 — MVP (핵심 루프 검증)
- 오늘의 무료 운세 (로그인 불필요)
- 사주 기본 분석 (생년월일 입력 → AI 분석)
- 회원가입 / 로그인
- 사용자 정보 저장 (사주 보관함)

### Phase 2 — 수익화
- 궁합 분석
- 대운 분석
- 결제 연동 (Toss Payments)
- 프리미엄 결과 페이지

### Phase 3 — 확장
- 택일
- 연도별 운세
- AI 채팅 상담
- 구독 모델
