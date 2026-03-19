// 오늘의 운세 API — Redis 캐싱 + Claude AI 생성
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { redis, getTodayKST, secondsUntilMidnightKST } from '@/lib/cache/redis'
import { isValidZodiac } from '@/lib/fortune/zodiac'

export const dynamic = 'force-dynamic'

// ────────────────────────────────────────────────────────────────────────────
// 타입
// ────────────────────────────────────────────────────────────────────────────

export interface DailyFortune {
  zodiac: string
  date: string
  overall: string
  love: string
  money: string
  health: string
  score: { overall: number; love: number; money: number; health: number }
  luckyColor: string
  luckyNumber: number
}

// ────────────────────────────────────────────────────────────────────────────
// AI 운세 생성
// ────────────────────────────────────────────────────────────────────────────

async function generateFortune(zodiac: string, date: string): Promise<DailyFortune> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('AI_KEY_MISSING')

  const anthropic = new Anthropic({ apiKey })

  const prompt = `오늘(${date}) ${zodiac}띠 운세를 아래 JSON 형식으로 작성해주세요.
각 운세는 2~3문장, 자연스러운 한국어로 작성하고 긍정적이되 구체적으로 서술하세요.
점수는 1~5 사이 정수, 행운 색상은 한국어 색상명, 행운 번호는 1~99 사이 정수로 설정하세요.

{
  "overall": "전체운 내용",
  "love": "사랑운 내용",
  "money": "재물운 내용",
  "health": "건강운 내용",
  "score": { "overall": 정수, "love": 정수, "money": 정수, "health": 정수 },
  "luckyColor": "색상명",
  "luckyNumber": 정수
}

반드시 위 JSON 형식만 응답하고 다른 텍스트나 마크다운 코드 블록은 포함하지 마세요.`

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text.trim() : ''

  // JSON 추출 (```json ... ``` 블록 또는 순수 JSON)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('AI_PARSE_ERROR')

  const parsed = JSON.parse(jsonMatch[0]) as Omit<DailyFortune, 'zodiac' | 'date'>

  return {
    zodiac,
    date,
    overall: String(parsed.overall ?? ''),
    love: String(parsed.love ?? ''),
    money: String(parsed.money ?? ''),
    health: String(parsed.health ?? ''),
    score: {
      overall: Number(parsed.score?.overall ?? 3),
      love: Number(parsed.score?.love ?? 3),
      money: Number(parsed.score?.money ?? 3),
      health: Number(parsed.score?.health ?? 3),
    },
    luckyColor: String(parsed.luckyColor ?? '파란색'),
    luckyNumber: Number(parsed.luckyNumber ?? 7),
  }
}

// ────────────────────────────────────────────────────────────────────────────
// 라우트 핸들러
// ────────────────────────────────────────────────────────────────────────────

const querySchema = z.object({
  zodiac: z.string().min(1),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const parsed = querySchema.safeParse({ zodiac: searchParams.get('zodiac') })

  if (!parsed.success || !isValidZodiac(parsed.data.zodiac)) {
    return Response.json({ error: 'INVALID_ZODIAC' }, { status: 400 })
  }

  const { zodiac } = parsed.data
  const date = getTodayKST()
  const cacheKey = `fortune:${date}:${zodiac}`

  // ── Redis 캐시 확인 ────────────────────────────────────────────────────
  if (redis) {
    try {
      const cached = await redis.get<DailyFortune>(cacheKey)
      if (cached) {
        return Response.json({ data: cached, cached: true })
      }
    } catch {
      // Redis 오류 시 캐시 없이 진행
    }
  }

  // ── AI 운세 생성 ────────────────────────────────────────────────────────
  let fortune: DailyFortune
  try {
    fortune = await generateFortune(zodiac, date)
  } catch (err) {
    const raw = err instanceof Error ? err.message : 'UNKNOWN_ERROR'
    // 사용자에게 노출할 에러 코드 정규화
    let code: string
    if (raw === 'AI_KEY_MISSING') code = 'AI_KEY_MISSING'
    else if (raw === 'AI_PARSE_ERROR') code = 'AI_PARSE_ERROR'
    else if (raw.includes('401') || raw.includes('auth')) code = 'AI_AUTH_ERROR'
    else if (raw.includes('429') || raw.includes('rate')) code = 'AI_RATE_LIMIT'
    else if (raw.includes('529') || raw.includes('overload')) code = 'AI_OVERLOADED'
    else code = 'AI_ERROR'
    return Response.json({ error: code }, { status: 503 })
  }

  // ── Redis 캐시 저장 ────────────────────────────────────────────────────
  if (redis) {
    try {
      await redis.set(cacheKey, fortune, { ex: secondsUntilMidnightKST() })
    } catch {
      // 저장 실패는 무시 (운세는 이미 생성됨)
    }
  }

  return Response.json({ data: fortune, cached: false })
}
