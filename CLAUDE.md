# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Saju** — AI 기반 사주/운세 모바일 웹 서비스 (한국어 사용자 대상)

기획 문서: `PLANNING.md` 및 `docs/` 디렉토리 참조

## Tech Stack (계획)

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand + TanStack Query
- **DB**: PostgreSQL via Supabase (Prisma ORM)
- **Cache**: Upstash Redis
- **Auth**: NextAuth.js v5
- **AI**: Anthropic Claude API
- **Payment**: Toss Payments (Phase 2)
- **Deploy**: Vercel

## Repository

- GitHub: https://github.com/JOOCHANN/Saju
- Branch: `main`

## Development Commands (개발 시작 후 업데이트 예정)

```bash
pnpm install          # 의존성 설치
pnpm dev              # 개발 서버 (localhost:3000)
pnpm build            # 프로덕션 빌드
pnpm test             # 테스트 실행 (Vitest)
pnpm db:migrate       # DB 마이그레이션 (npx prisma migrate dev)
pnpm db:generate      # Prisma 클라이언트 생성
```

## Key Conventions

- 모든 API 입력은 Zod로 검증
- 민감 데이터 (생년월일 등)는 AES-256-GCM 암호화 후 저장
- API 응답 형식: `{ data, error, meta }` 통일
- 컴포넌트: 서버 컴포넌트 기본, 인터랙션 필요 시만 `"use client"`
- 에러 처리: 공통 에러 코드 문자열 사용 (`src/types/api.ts`)

## Notes

- `.claude/` is excluded from git via `.gitignore`
- 기획 단계 완료, 개발 단계 진입 시 이 파일 업데이트 필요
