// Upstash Redis 클라이언트 — HTTP REST API 기반, Edge Runtime 호환
import { Redis } from '@upstash/redis'

// UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN 미설정 시 null 반환
function createRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

export const redis = createRedisClient()

// ── 헬퍼 ──────────────────────────────────────────────────────────────────

/** KST 기준 오늘 날짜 문자열 (YYYY-MM-DD) */
export function getTodayKST(): string {
  const now = new Date()
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  return kst.toISOString().split('T')[0]
}

/** KST 자정까지 남은 초 (Redis TTL 용) */
export function secondsUntilMidnightKST(): number {
  const now = new Date()
  const kstHours = (now.getUTCHours() + 9) % 24
  const elapsed = kstHours * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds()
  return Math.max(60, 24 * 3600 - elapsed) // 최소 60초
}
