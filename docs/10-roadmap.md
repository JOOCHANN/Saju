# 10. 개발 로드맵 (Roadmap)

## Phase 1 — MVP (목표: 핵심 루프 검증)

### 스프린트 1: 프로젝트 셋업 & 기반 구조
- [ ] Next.js 14 프로젝트 초기화 (TypeScript, Tailwind, pnpm)
- [ ] shadcn/ui 설치 및 기본 컴포넌트 설정
- [ ] Supabase 프로젝트 생성 + Prisma 연동
- [ ] NextAuth.js v5 설정 (Google OAuth 먼저)
- [ ] 기본 레이아웃 (하단 탭바, 헤더)
- [ ] 환경 변수 설정 (`.env.example` 작성)
- [ ] Vercel 배포 연결 (GitHub Actions CI)

### 스프린트 2: 사주 계산 엔진
- [ ] 음력/양력 변환 모듈
- [ ] 간지(干支) 계산 로직
- [ ] 사주 원국(四柱) 계산
- [ ] 오행(五行) 분포 계산
- [ ] 단위 테스트 작성 (Vitest)

### 스프린트 3: 사주 분석 기능
- [ ] 생년월일 입력 폼 UI (BirthInputForm)
- [ ] 사주 원국 표 컴포넌트 (FourPillarsTable)
- [ ] Claude API 연동 + 사주 분석 프롬프트
- [ ] SSE 스트리밍 응답 구현
- [ ] 결과 페이지 UI (오행 차트, AI 해석 텍스트)
- [ ] Rate Limiting (Upstash Redis)

### 스프린트 4: 인증 & 보관함
- [ ] 카카오 OAuth 추가
- [ ] 이메일 회원가입 + Resend 이메일 인증
- [ ] 마이페이지 (저장된 분석 목록)
- [ ] 분석 결과 DB 저장/조회
- [ ] 개인정보 암호화 적용

### 스프린트 5: 오늘의 운세 & 마무리
- [ ] 12띠 선택 UI
- [ ] 오늘의 운세 API + Claude 프롬프트
- [ ] Redis 캐싱 적용
- [ ] ISR 렌더링 설정
- [ ] 공유 기능 (카카오톡 공유, 링크 복사)
- [ ] OG 이미지 자동 생성
- [ ] 개인정보 처리방침 / 이용약관 페이지
- [ ] 모바일 반응형 최종 점검

---

## Phase 2 — 수익화

### 스프린트 6: 결제 연동
- [ ] Toss Payments 연동
- [ ] 결제 플로우 UI (결제 모달)
- [ ] Webhook 처리
- [ ] 구매 내역 페이지

### 스프린트 7: 궁합 분석
- [ ] 궁합 입력 UI (2인 정보 입력)
- [ ] 궁합 계산 로직
- [ ] Claude 궁합 분석 프롬프트
- [ ] 결과 페이지 (궁합 점수 + AI 해석)

### 스프린트 8: 대운 & 연도별 운세
- [ ] 대운 계산 로직
- [ ] 대운 시각화 컴포넌트 (타임라인)
- [ ] 연도별 운세 (세운 계산)
- [ ] Claude 프롬프트 최적화

---

## Phase 3 — 확장

- 택일 서비스
- AI 채팅 상담 (멀티턴 Claude 대화)
- 구독 모델 (월정액)
- 이메일 마케팅 (오늘의 운세 구독)
- PWA 지원 (홈 화면 추가)

---

## 기술 부채 방지 체크리스트

개발 진행 중 지속적으로 확인:

- [ ] Zod 스키마로 모든 API 입력 검증
- [ ] 민감 데이터 암호화 확인
- [ ] API Rate Limiting 적용 확인
- [ ] 에러 처리 일관성 (공통 에러 응답 구조)
- [ ] 접근성 (aria 레이블, 키보드 네비게이션)
- [ ] Lighthouse 점수: Performance 90+, SEO 90+
- [ ] 모바일 320px~428px 뷰포트 테스트

---

## 개발 시작 전 즉시 필요한 것들

1. **Anthropic API Key** — Claude API 사용 (console.anthropic.com)
2. **Supabase 프로젝트** — 무료 플랜으로 시작 (supabase.com)
3. **Upstash Redis** — 무료 플랜으로 시작 (upstash.com)
4. **카카오 개발자** — OAuth 앱 등록 (developers.kakao.com)
5. **구글 클라우드** — OAuth 클라이언트 (console.cloud.google.com)
6. **Vercel 계정** — GitHub 연결 (vercel.com)
7. **Resend 계정** — 이메일 발송 (resend.com) — 무료 3000건/월

> Phase 2 시작 전:
> - **Toss Payments** — 사업자 등록 필요 (비즈니스 계정)
