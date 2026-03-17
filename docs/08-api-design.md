# 08. API 설계 (API Design)

## 기본 원칙
- RESTful 설계 (Next.js Route Handlers)
- 모든 응답: `{ data, error, meta }` 통일 구조
- 인증: Bearer JWT (NextAuth session token)
- 에러: HTTP 상태 코드 + 에러 코드 문자열

---

## 공통 응답 형식

```typescript
// 성공
{
  "data": { ... },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2026-03-17T10:00:00Z"
  }
}

// 에러
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "로그인이 필요합니다."
  }
}
```

---

## 에러 코드 목록

| 코드 | HTTP | 설명 |
|------|------|------|
| `UNAUTHORIZED` | 401 | 로그인 필요 |
| `FORBIDDEN` | 403 | 권한 없음 |
| `NOT_FOUND` | 404 | 리소스 없음 |
| `VALIDATION_ERROR` | 400 | 입력값 오류 |
| `RATE_LIMIT` | 429 | 요청 횟수 초과 |
| `AI_ERROR` | 500 | AI 분석 실패 |
| `PAYMENT_REQUIRED` | 402 | 결제 필요 |

---

## API 엔드포인트

### 인증 (NextAuth 자동 생성)

```
POST /api/auth/signin
POST /api/auth/signout
GET  /api/auth/session
POST /api/auth/callback/kakao
POST /api/auth/callback/google
```

---

### 사주 분석

#### `POST /api/saju/analyze`
사주 분석 요청 (AI 스트리밍 응답)

**인증:** 선택 (비로그인 시 결과 미저장)

**Request Body:**
```json
{
  "birthDate": "1995-03-17",
  "birthHour": 14,
  "gender": "FEMALE",
  "isLunar": false
}
```

**Response:** `text/event-stream` (Server-Sent Events)
```
data: {"type":"pillars","data":{"year":{"cheongan":"을","jiji":"해"},...}}

data: {"type":"ohaeng","data":{"wood":3,"fire":1,"earth":2,"metal":1,"water":1}}

data: {"type":"analysis","chunk":"당신의 사주는..."}
data: {"type":"analysis","chunk":"성격적으로..."}

data: {"type":"done","readingId":"reading_abc123"}
```

**Rate Limit:** 비로그인 3회/일, 로그인 10회/일

---

#### `GET /api/saju/[id]`
저장된 사주 분석 결과 조회

**인증:** 필요 (본인 것만 조회 가능)

**Response:**
```json
{
  "data": {
    "id": "reading_abc123",
    "type": "SAJU_BASIC",
    "pillars": { ... },
    "ohaeng": { ... },
    "analysis": "...",
    "createdAt": "2026-03-17T10:00:00Z"
  }
}
```

---

### 오늘의 운세

#### `GET /api/daily?zodiac=rat`
오늘의 운세 조회

**인증:** 불필요

**Query Params:**
- `zodiac`: `rat|ox|tiger|rabbit|dragon|snake|horse|goat|monkey|rooster|dog|pig`
- `date`: `YYYY-MM-DD` (기본값: 오늘)

**Response:**
```json
{
  "data": {
    "date": "2026-03-17",
    "zodiac": "rat",
    "overall": { "score": 4, "summary": "오늘은 새로운 시작에 좋은 날..." },
    "love": { "score": 3, "summary": "..." },
    "work": { "score": 5, "summary": "..." },
    "money": { "score": 3, "summary": "..." },
    "luckyColor": "파란색",
    "luckyNumber": 7,
    "advice": "오늘의 한마디..."
  }
}
```

**캐싱:** `Cache-Control: public, max-age=3600, s-maxage=86400`

---

### 사용자 프로필

#### `GET /api/user/profile`
**인증:** 필요

**Response:**
```json
{
  "data": {
    "id": "profile_abc",
    "birthDate": "1995-03-17",
    "birthHour": 14,
    "gender": "FEMALE",
    "isLunar": false
  }
}
```

#### `PUT /api/user/profile`
**인증:** 필요

**Request Body:** (GET과 동일 구조)

---

#### `GET /api/user/readings`
저장된 사주 분석 목록

**인증:** 필요

**Query Params:**
- `page`: 페이지 번호 (기본 1)
- `limit`: 페이지 크기 (기본 10)

**Response:**
```json
{
  "data": [
    {
      "id": "reading_abc123",
      "type": "SAJU_BASIC",
      "summary": "을해년생 여성 기본 사주",
      "createdAt": "2026-03-17T10:00:00Z"
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 10
  }
}
```

---

#### `DELETE /api/user/readings/[id]`
사주 분석 삭제

**인증:** 필요 (본인 것만)

---

### 결제 (Phase 2)

#### `POST /api/payment/confirm`
Toss Payments 결제 확인

**Request Body:**
```json
{
  "paymentKey": "...",
  "orderId": "...",
  "amount": 3900
}
```

#### `POST /api/payment/webhook`
Toss Payments Webhook 수신 (서버 간 통신)

---

## 보안 헤더

모든 API 응답에 포함:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```
