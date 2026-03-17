# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Saju** — AI 기반 사주/운세 모바일 웹 서비스 (한국어 사용자 대상)

기획 문서: `PLANNING.md` 및 `docs/` 디렉토리 참조

## Tech Stack (실제 구현)

- **Framework**: Next.js 15.3.9 (App Router, TypeScript)
- **Styling**: Tailwind CSS v3 + shadcn/ui (CSS 변수 기반)
- **State**: Zustand + TanStack Query
- **DB**: PostgreSQL via Supabase + Drizzle ORM (`postgres` 드라이버)
- **Cache**: Upstash Redis (HTTP 기반, Edge 호환)
- **Auth**: NextAuth.js v5 (beta.30) + @auth/drizzle-adapter
- **AI**: Anthropic Claude API (`@anthropic-ai/sdk`)
- **Payment**: Toss Payments (Phase 2)
- **Deploy**: Cloudflare Pages (`@opennextjs/cloudflare` 어댑터)
- **Email**: Resend

## Repository

- GitHub: https://github.com/JOOCHANN/Saju
- Branch: `main`

## Development Commands

```bash
pnpm install          # 의존성 설치
pnpm dev              # 개발 서버 (localhost:3000)
pnpm build            # Next.js 프로덕션 빌드
pnpm build:cf         # Cloudflare Workers 빌드 (opennextjs)
pnpm preview          # Cloudflare 로컬 미리보기 (wrangler)
pnpm db:generate      # Drizzle 마이그레이션 파일 생성
pnpm db:migrate       # Supabase에 스키마 적용
pnpm db:studio        # Drizzle Studio (DB GUI)
```

## Key Conventions

### API Route Runtime
- **기본**: `export const runtime = 'nodejs'` — DB(postgres) 사용 라우트
- **Edge 가능**: `export const runtime = 'edge'` — fetch만 사용하는 라우트 (순수 AI 스트리밍 등)
- `postgres` 드라이버는 Node.js TCP 모듈이 필요하므로 Edge Runtime 빌드에서 사용 불가
- Cloudflare 배포 시 `nodejs_compat` 플래그로 TCP 지원됨

### 공통
- 모든 API 입력은 Zod로 검증
- 민감 데이터 (생년월일 등)는 `src/lib/crypto.ts` (AES-256-GCM)로 암호화 후 저장
- API 응답 형식: `{ data, error, meta }` 통일
- 컴포넌트: 서버 컴포넌트 기본, 인터랙션 필요 시만 `"use client"`
- 에러 처리: 공통 에러 코드 문자열 사용 (`src/types/api.ts`)

## Notes

- `.claude/` is excluded from git via `.gitignore`
- `.dev.vars` 파일에 로컬 개발용 시크릿 보관 (절대 커밋 금지)
- 개발 진행 상황: `PLANNING.md` 참조
