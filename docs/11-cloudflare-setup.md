# 11. Cloudflare Pages 배포 설정

## 개요

Next.js 앱을 Cloudflare Pages에 배포하려면 `@cloudflare/next-on-pages` 어댑터가 필요합니다.
이 어댑터가 Next.js 빌드 결과물을 Cloudflare Workers 형식으로 변환합니다.

---

## 필요한 패키지

```bash
pnpm add -D @cloudflare/next-on-pages wrangler
```

---

## 프로젝트 루트 설정 파일들

### `wrangler.toml`
```toml
name = "saju"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]

pages_build_output_dir = ".vercel/output/static"

[vars]
NEXT_PUBLIC_APP_URL = "https://saju.pages.dev"  # 실제 도메인으로 변경
```

### `next.config.ts`
```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Cloudflare Pages 필수 설정
  output: 'standalone',  // 또는 'export' (정적 only 시)

  images: {
    // Cloudflare Pages는 Next.js Image Optimization 미지원
    // 외부 이미지 최적화 서비스 사용 또는 unoptimized
    unoptimized: true,
  },

  // 실험적 기능 (Edge Runtime)
  experimental: {
    runtime: 'edge',
  },
}

export default nextConfig
```

### `package.json` 빌드 스크립트 추가
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "build:cf": "npx @cloudflare/next-on-pages",
    "preview": "npx wrangler pages dev",
    "deploy": "npx wrangler pages deploy"
  }
}
```

---

## API Routes — Edge Runtime 설정

**모든 API Route 파일에 아래 줄 추가 필수:**

```typescript
// src/app/api/saju/analyze/route.ts
export const runtime = 'edge'  // ← 이 줄 없으면 Cloudflare에서 동작 안 함

export async function POST(request: Request) {
  // ...
}
```

> 페이지 컴포넌트는 자동으로 Edge로 변환되므로 별도 설정 불필요.
> API Route만 명시적으로 선언 필요.

---

## Cloudflare Pages 대시보드 설정

### 1. Pages 프로젝트 생성
1. [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages → Create a project
2. GitHub 연결 → `JOOCHANN/Saju` 저장소 선택
3. 빌드 설정:
   ```
   Framework preset: Next.js
   Build command:    npx @cloudflare/next-on-pages
   Build output dir: .vercel/output/static
   Node.js version:  20.x
   ```

### 2. 환경 변수 등록
Settings → Environment Variables → Add variable:

```
NEXT_PUBLIC_SUPABASE_URL        = https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY   = eyJ...
SUPABASE_SERVICE_ROLE_KEY       = eyJ...  (암호화 처리)
AUTH_SECRET                     = (랜덤 문자열)
AUTH_KAKAO_ID                   = ...
AUTH_KAKAO_SECRET               = ...  (암호화 처리)
AUTH_GOOGLE_ID                  = ...
AUTH_GOOGLE_SECRET              = ...  (암호화 처리)
ANTHROPIC_API_KEY               = sk-...  (암호화 처리)
UPSTASH_REDIS_REST_URL          = https://...
UPSTASH_REDIS_REST_TOKEN        = ...  (암호화 처리)
ENCRYPTION_KEY                  = (32바이트 hex)  (암호화 처리)
RESEND_API_KEY                  = re_...  (암호화 처리)
```

> **암호화 처리**: 시크릿 값은 "Encrypt" 토글 켜서 등록

### 3. 커스텀 도메인 연결 (선택)
Pages → Custom domains → Set up a custom domain
- `saju.yourdomain.com` 형식으로 연결
- Cloudflare DNS에 자동으로 CNAME 레코드 추가

---

## 로컬 개발 방법

### 일반 Next.js 개발 서버 (권장)
```bash
pnpm dev
# localhost:3000
```

### Cloudflare Workers 시뮬레이션 (배포 전 확인용)
```bash
pnpm build:cf && pnpm preview
# localhost:8788
```

> 로컬 개발은 `pnpm dev`로 충분. Cloudflare 시뮬레이션은 배포 전 최종 확인 시에만 사용.

---

## 배포 흐름

```
git push origin main
    ↓
Cloudflare Pages 자동 감지
    ↓
빌드: npx @cloudflare/next-on-pages
    ↓
전 세계 Cloudflare CDN 배포
    ↓
프리뷰 URL 자동 생성 (PR 시)
또는 프로덕션 도메인으로 즉시 반영
```

---

## 주의사항 및 제약

| 항목 | 내용 |
|------|------|
| **Node.js API** | `fs`, `path` 등 Node.js 전용 모듈 사용 불가 (Edge Runtime) |
| **응답 크기** | Workers 응답 최대 25MB |
| **CPU 시간** | Workers 요청당 최대 50ms (무료) / 30초 (유료) |
| **Next.js Image** | 기본 이미지 최적화 미지원 → `unoptimized: true` |
| **Incremental Static Regeneration** | ISR 미지원 → `revalidate`는 캐시 헤더로 대체 |
| **next/headers cookies()** | Edge에서 동작하나 일부 NextAuth 패턴 주의 필요 |

---

## Drizzle + Supabase (Edge 호환) 설정

```typescript
// src/lib/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Edge Runtime에서는 Supabase HTTP API 사용
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Drizzle은 마이그레이션/스키마 관리용
// 실제 쿼리는 supabase 클라이언트 또는
// drizzle-orm/neon-http (HTTP 드라이버) 사용
```

> **권장**: Edge에서의 DB 접근은 `@supabase/supabase-js`로 통일.
> Drizzle은 마이그레이션 및 타입 생성 용도로 활용.
