# 06. 시스템 아키텍처

## 디렉토리 구조 (전체)

```
Saju/
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── layout.tsx                 # 루트 레이아웃
│   │   ├── page.tsx                   # 홈 (/)
│   │   │
│   │   ├── (auth)/                    # 인증 관련 라우트 그룹
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (main)/                    # 주요 서비스 라우트 그룹
│   │   │   ├── layout.tsx             # 하단 탭바 포함 레이아웃
│   │   │   ├── daily/
│   │   │   │   └── page.tsx           # 오늘의 운세
│   │   │   ├── saju/
│   │   │   │   ├── page.tsx           # 사주 분석 입력
│   │   │   │   └── result/
│   │   │   │       └── page.tsx       # 사주 분석 결과
│   │   │   ├── compatibility/         # (Phase 2) 궁합
│   │   │   │   └── page.tsx
│   │   │   ├── fortune/               # (Phase 2) 대운/연도별
│   │   │   │   └── page.tsx
│   │   │   └── mypage/
│   │   │       ├── page.tsx           # 마이페이지
│   │   │       └── readings/
│   │   │           └── page.tsx       # 보관함
│   │   │
│   │   ├── api/                       # API Route Handlers
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts       # NextAuth 핸들러
│   │   │   ├── saju/
│   │   │   │   ├── analyze/
│   │   │   │   │   └── route.ts       # POST: 사주 분석 요청
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts       # GET: 저장된 분석 조회
│   │   │   ├── daily/
│   │   │   │   └── route.ts           # GET: 오늘의 운세
│   │   │   ├── user/
│   │   │   │   └── profile/
│   │   │   │       └── route.ts       # GET/PUT: 사용자 프로필
│   │   │   └── payment/               # (Phase 2)
│   │   │       ├── confirm/
│   │   │       │   └── route.ts
│   │   │       └── webhook/
│   │   │           └── route.ts
│   │   │
│   │   ├── privacy/
│   │   │   └── page.tsx               # 개인정보 처리방침
│   │   └── terms/
│   │       └── page.tsx               # 이용약관
│   │
│   ├── components/
│   │   ├── ui/                        # shadcn/ui 기반 공통 컴포넌트
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── BottomTabBar.tsx       # 하단 탭 내비게이션
│   │   │   ├── Header.tsx
│   │   │   └── PageContainer.tsx
│   │   ├── saju/
│   │   │   ├── BirthInputForm.tsx     # 생년월일 입력 폼
│   │   │   ├── FourPillarsTable.tsx   # 사주 원국 표
│   │   │   ├── OhaengChart.tsx        # 오행 분포 차트
│   │   │   └── ReadingResult.tsx      # 분석 결과 표시
│   │   ├── daily/
│   │   │   ├── ZodiacSelector.tsx     # 띠 선택
│   │   │   └── FortuneCard.tsx        # 운세 카드
│   │   └── auth/
│   │       ├── LoginForm.tsx
│   │       └── SocialLoginButtons.tsx
│   │
│   ├── lib/
│   │   ├── saju-engine/               # 사주 계산 핵심 로직
│   │   │   ├── solar-to-lunar.ts
│   │   │   ├── ganzhi.ts
│   │   │   ├── four-pillars.ts
│   │   │   ├── ten-gods.ts
│   │   │   ├── ohaeng.ts
│   │   │   └── index.ts
│   │   ├── ai/
│   │   │   ├── claude.ts              # Claude API 클라이언트
│   │   │   └── prompts/
│   │   │       ├── saju-analysis.ts   # 사주 분석 프롬프트
│   │   │       └── daily-fortune.ts   # 일일 운세 프롬프트
│   │   ├── db/
│   │   │   └── prisma.ts              # Prisma 클라이언트 싱글톤
│   │   ├── auth/
│   │   │   └── options.ts             # NextAuth 설정
│   │   ├── cache/
│   │   │   └── redis.ts               # Upstash Redis 클라이언트
│   │   └── payment/                   # (Phase 2)
│   │       └── toss.ts
│   │
│   ├── hooks/
│   │   ├── useSajuAnalysis.ts
│   │   ├── useDailyFortune.ts
│   │   └── useAuth.ts
│   │
│   ├── stores/
│   │   ├── authStore.ts               # 인증 상태 (Zustand)
│   │   └── sajuStore.ts               # 사주 입력 임시 상태
│   │
│   ├── types/
│   │   ├── saju.ts                    # 사주 관련 타입
│   │   ├── user.ts                    # 사용자 타입
│   │   └── api.ts                     # API 응답 타입
│   │
│   └── utils/
│       ├── date.ts                    # 날짜 유틸리티
│       ├── format.ts                  # 텍스트 포맷팅
│       └── constants.ts               # 앱 상수
│
├── prisma/
│   └── schema.prisma                  # DB 스키마
│
├── public/
│   ├── images/
│   │   ├── zodiac/                    # 12띠 이미지
│   │   └── icons/
│   └── favicon.ico
│
├── .env.local                         # 환경 변수 (git 제외)
├── .env.example                       # 환경 변수 예시
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── prisma/schema.prisma
└── package.json
```

---

## 렌더링 전략

| 페이지 | 전략 | 이유 |
|--------|------|------|
| 홈 (`/`) | SSG | 정적 컨텐츠, SEO |
| 오늘의 운세 (`/daily`) | ISR (revalidate: 86400) | 하루 1회 갱신, SEO |
| 사주 분석 입력 (`/saju`) | CSR | 폼 인터랙션 |
| 사주 분석 결과 (`/saju/result`) | SSR | 개인화 데이터 |
| 마이페이지 (`/mypage`) | SSR | 로그인 필요, 개인화 |
| 약관/방침 | SSG | 정적 문서 |

---

## API 데이터 흐름

### 사주 분석 흐름
```
클라이언트 폼 제출
    │
    ▼ POST /api/saju/analyze
[Route Handler]
    │
    ├── 1. Zod 유효성 검사
    ├── 2. Rate Limit 체크 (Redis)
    ├── 3. 사주 계산 엔진 실행 (서버 사이드)
    ├── 4. Claude API 호출 (스트리밍)
    ├── 5. DB 저장 (로그인 시)
    └── 6. 결과 스트림 반환
```

### 오늘의 운세 흐름
```
클라이언트 요청
    │
    ▼ GET /api/daily?zodiac=rat&date=2026-03-17
[Route Handler]
    │
    ├── 1. Redis 캐시 확인
    │   ├── HIT → 캐시 반환
    │   └── MISS → Claude API 호출 → Redis 저장 → 반환
    └── 2. 클라이언트로 반환
```
