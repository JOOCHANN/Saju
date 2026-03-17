import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Cloudflare Workers (Edge) 환경에서 Supabase PostgreSQL 연결
// - Transaction pooler URL (port 6543) 사용: serverless 환경에 최적화
// - prepare: false — pgBouncer Transaction 모드에서 prepared statements 미지원
function createDb() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL 환경 변수가 설정되지 않았습니다.')
  }

  const client = postgres(connectionString, {
    prepare: false, // pgBouncer Transaction 모드 필수 설정
    max: 1, // Serverless 환경: 연결 최소화
  })

  return drizzle(client, { schema })
}

// 싱글턴 패턴 (모듈 캐싱 활용)
export const db = createDb()
export type Db = typeof db
