# Saju 서비스 기획서 (Master Planning Document)

> 이 문서는 Saju 프로젝트의 최상위 기획 문서입니다.
> 세부 내용은 `docs/` 디렉토리의 각 문서를 참조하세요.

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

## 폴더 구조 (개발 시작 전 기준)

```
Saju/
├── PLANNING.md                    # 이 문서 (최상위 기획서)
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
│   └── 10-roadmap.md
├── src/                           # 소스 코드 (개발 시 생성)
│   ├── app/                       # Next.js App Router
│   ├── components/                # React 컴포넌트
│   ├── lib/                       # 핵심 비즈니스 로직
│   ├── hooks/                     # React Hooks
│   ├── stores/                    # 상태 관리 (Zustand)
│   ├── types/                     # TypeScript 타입 정의
│   └── utils/                     # 유틸리티 함수
├── prisma/                        # DB 스키마 (Prisma ORM)
│   └── schema.prisma
└── public/                        # 정적 파일
    └── images/
```

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
