import { defineConfig } from 'drizzle-kit'

// drizzle-kit은 마이그레이션 실행용 (로컬에서만 실행)
// DATABASE_URL_UNPOOLED: Supabase 직접 연결 URL (port 5432)
// .env.local 파일에 설정 후 실행: pnpm db:generate / pnpm db:migrate

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!,
  },
})
