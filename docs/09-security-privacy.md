# 09. 보안 & 개인정보 처리 설계

## 법적 근거
- **개인정보 보호법** (한국) — 개인정보 수집/이용/보관/파기
- **정보통신망법** — 서비스 제공자 의무
- 생년월일/출생시간은 **개인정보**에 해당 → 명시적 동의 필요

---

## 수집하는 개인정보

| 데이터 | 수집 목적 | 보존 기간 | 암호화 |
|--------|----------|----------|--------|
| 이메일 | 계정 식별, 인증 | 탈퇴 후 30일 | ✅ (bcrypt/TLS) |
| 생년월일 | 사주 분석 서비스 제공 | 탈퇴 후 30일 | ✅ AES-256-GCM |
| 출생 시간 | 사주 분석 서비스 제공 | 탈퇴 후 30일 | ✅ AES-256-GCM |
| 성별 | 사주 분석 서비스 제공 | 탈퇴 후 30일 | ✅ AES-256-GCM |
| 소셜 OAuth 토큰 | 로그인 | 세션 종료 시 | ✅ |
| 결제 정보 | 서비스 결제 | 5년 (법적) | Toss 측 보관 |

> **최소 수집 원칙**: 서비스 제공에 꼭 필요한 정보만 수집

---

## 암호화 설계

### 저장 데이터 암호화 (at-rest)
```
생년월일/출생시간/성별 → AES-256-GCM 암호화 → PostgreSQL 저장

암호화 키: ENCRYPTION_KEY 환경변수 (32바이트 hex)
           Vercel 환경 변수로 관리 (소스코드에 미포함)

구현 위치: src/lib/crypto.ts
적용 대상: User.birthDate, Reading.inputData
```

### 전송 데이터 암호화 (in-transit)
```
모든 통신: HTTPS/TLS 1.3 (Vercel 기본 제공)
API 키: 서버 사이드에서만 사용 (NEXT_PUBLIC_ 접두사 사용 금지)
```

---

## 인증 보안

### JWT 전략
```
Access Token:  15분 만료 (메모리에만 저장, localStorage X)
Refresh Token: 7일 만료 (HttpOnly Cookie)
Rotation:      Refresh 시 새 Refresh Token 발급 (이전 토큰 무효화)
```

### 세션 보안
```javascript
// next.config.ts
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline'...",
  },
]
```

### 비밀번호 (이메일 가입)
```
bcrypt rounds: 12
최소 요구사항: 8자 이상, 영문+숫자 혼합
```

---

## API 보안

### Rate Limiting (Upstash Redis)
```
비로그인 사주 분석: 3회/일/IP
로그인 사주 분석:   10회/일/사용자
오늘의 운세:        60회/시간/IP (캐시 우선이라 실제로는 적음)
회원가입:           5회/시간/IP
```

### 입력값 검증
```typescript
// Zod 스키마로 모든 API 입력 검증
const analyzeSajuSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthHour: z.number().min(0).max(23).nullable(),
  gender: z.enum(['MALE', 'FEMALE']),
  isLunar: z.boolean(),
})
```

### SQL Injection 방지
```
Prisma ORM 사용 → 파라미터화된 쿼리 자동 적용
Raw 쿼리 사용 시: Prisma.$queryRaw`...` 태그드 템플릿 사용
```

---

## CSRF 방지
```
NextAuth.js 내장 CSRF 보호 활용
상태 변경 API: POST/PUT/DELETE 메서드 + CSRF 토큰 검증
```

---

## 사용자 권리 보장 (개인정보 보호법)

| 권리 | 구현 방법 |
|------|----------|
| **열람권** | 마이페이지 → 내 정보 확인 |
| **정정권** | 마이페이지 → 내 정보 수정 |
| **삭제권** | 마이페이지 → 계정 탈퇴 → 30일 후 완전 삭제 |
| **이동권** | 마이페이지 → 내 데이터 내보내기 (JSON) |
| **처리정지권** | 이메일로 처리 정지 요청 접수 |

---

## 비로그인 사용자 처리
```
비로그인 사주 분석 결과:
  - 서버 세션에 임시 저장 (24시간)
  - DB에 userId=null로 저장
  - 24시간 후 자동 배치 삭제
  - IP 주소 저장 금지 (Rate Limit만 Redis에 임시 저장)
```

---

## AI 프롬프트 보안

Claude API 호출 시:
```
- 생년월일 등 원본 데이터를 프롬프트에 직접 포함
  (Anthropic 서버로 전송됨 → Anthropic 데이터 처리 정책 고지 필요)
- 프롬프트 인젝션 방지: 사용자 입력을 시스템 프롬프트와 분리
- 사용자 이름 등 식별 정보는 프롬프트에서 제외
```

> **사용자 고지 필요**: "AI 분석을 위해 생년월일 정보가 Anthropic 서버에서 처리됩니다."

---

## 개인정보 처리방침 필수 포함 항목
1. 수집하는 개인정보 항목
2. 수집 목적
3. 보존 기간
4. 제3자 제공 (Anthropic API, Toss Payments)
5. 수탁업체 목록
6. 사용자 권리 및 행사 방법
7. 개인정보 보호책임자 정보
8. 고지 의무 (처리방침 변경 시 7일 전 고지)
