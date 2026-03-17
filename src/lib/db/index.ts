import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Cloudflare Workers (Edge) 환경에서 Supabase PostgreSQL 연결
// - Transaction pooler URL (port 6543) 사용: serverless 환경에 최적화
// - prepare: false — pgBouncer Transaction 모드에서 prepared statements 미지원
// DATABASE_URL이 없으면 빈 문자열로 초기화 (실제 쿼리 전까지 연결하지 않음)
// 런타임에 쿼리 시 DATABASE_URL이 없으면 postgres가 연결 에러를 발생시킴
const connectionString = process.env.DATABASE_URL ?? ''

const client = postgres(connectionString, {
  prepare: false, // pgBouncer Transaction 모드 필수 설정
  max: 1, // Serverless 환경: 연결 최소화
})

export const db = drizzle(client, { schema })
export type Db = typeof db
