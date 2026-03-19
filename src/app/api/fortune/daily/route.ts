// 오늘의 운세 API — Redis 캐싱 + OpenAI 생성
// mode 1: zodiac (띠 기반)
// mode 2: birthdate (생년월일 → 사주 기반 개인화)
import OpenAI from 'openai'
import { z } from 'zod'
import { redis, getTodayKST, secondsUntilMidnightKST } from '@/lib/cache/redis'
import { isValidZodiac, getZodiacByYear } from '@/lib/fortune/zodiac'
import { calculateSaju } from '@/lib/saju'

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
  personalized?: boolean
}

// ────────────────────────────────────────────────────────────────────────────
// AI 운세 생성
// ────────────────────────────────────────────────────────────────────────────

async function generateFortune(
  zodiac: string,
  date: string,
  sajuContext?: string,
): Promise<DailyFortune> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('AI_KEY_MISSING')

  const gatewayUrl = process.env.CF_AI_GATEWAY_URL
  const openai = new OpenAI({
    apiKey,
    ...(gatewayUrl ? { baseURL: gatewayUrl } : {}),
  })

  // 날짜를 seed로 사용해 색상 후보 순서를 섞어 다양성 유도
  const colorHint = [
    '산호색', '민트색', '라벤더색', '황토색', '청록색', '버건디색', '올리브색', '살구색',
    '하늘색', '자주색', '연두색', '진홍색', '카키색', '아이보리색', '코발트색', '금색',
    '은색', '베이지색', '에메랄드색', '로즈골드색', '인디고색', '연보라색', '주황색', '청자색',
  ].sort(() => (parseInt(date.replace(/-/g, '')) % 7) - 3).slice(0, 8).join(', ')

  const scoreGuide = `점수 규칙: 4개 항목(overall/love/money/health)이 서로 달라야 하고, 가장 높은 것과 낮은 것의 차이가 반드시 20 이상이어야 합니다. 범위 40~95.`

  const prompt = sajuContext
    ? `오늘(${date}) 아래 사주 정보를 가진 ${zodiac}띠 사람의 오늘의 운세를 JSON으로 작성해주세요.

사주 정보:
${sajuContext}

각 운세는 2~3문장으로, 위 사주 특성(출생연도 간지, 일간 기질, 오행 분포)을 반영한 개인화된 내용으로 작성하세요.
같은 뱀띠라도 辛巳년생과 癸巳년생은 다른 운세가 나와야 합니다.
긍정적이되 구체적이고 실용적인 조언을 포함하세요.
${scoreGuide}
행운 색상은 다음 중 하나를 선택하되 매번 다르게: ${colorHint}
행운 번호는 1~99 사이 정수.

{"overall":"전체운","love":"사랑운","money":"재물운","health":"건강운","score":{"overall":78,"love":55,"money":88,"health":63},"luckyColor":"산호색","luckyNumber":37}

반드시 위 JSON 형식만 응답하고 다른 텍스트는 포함하지 마세요.`
    : `오늘(${date}) ${zodiac}띠 운세를 아래 JSON 형식으로 작성해주세요.
각 운세는 2~3문장, 자연스러운 한국어로 긍정적이되 구체적으로 서술하세요.
${scoreGuide}
행운 색상은 다음 중 하나를 선택하되 매번 다르게: ${colorHint}
행운 번호는 1~99 사이 정수.

{"overall":"전체운","love":"사랑운","money":"재물운","health":"건강운","score":{"overall":72,"love":91,"money":58,"health":45},"luckyColor":"청록색","luckyNumber":23}

반드시 위 JSON 형식만 응답하고 다른 텍스트나 마크다운 코드 블록은 포함하지 마세요.`

  const message = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.choices[0]?.message?.content?.trim() ?? ''
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
    personalized: !!sajuContext,
  }
}

// ────────────────────────────────────────────────────────────────────────────
// 라우트 핸들러
// ────────────────────────────────────────────────────────────────────────────

const querySchema = z.object({
  zodiac: z.string().min(1).optional(),
  year: z.coerce.number().int().min(1900).max(2020).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  day: z.coerce.number().int().min(1).max(31).optional(),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const parsed = querySchema.safeParse({
    zodiac: searchParams.get('zodiac') ?? undefined,
    year: searchParams.get('year') ?? undefined,
    month: searchParams.get('month') ?? undefined,
    day: searchParams.get('day') ?? undefined,
  })

  if (!parsed.success) {
    return Response.json({ error: 'INVALID_INPUT' }, { status: 400 })
  }

  const { zodiac, year, month, day } = parsed.data
  const date = getTodayKST()

  let resolvedZodiac: string
  let cacheKey: string
  let sajuContext: string | undefined

  if (year && month && day) {
    // 생년월일 모드
    resolvedZodiac = getZodiacByYear(year)
    cacheKey = `fortune:${date}:birth:${year}-${month}-${day}`

    try {
      const saju = calculateSaju({ year, month, day, gender: 'male' })
      const elemStr = Object.entries(saju.elementBalance)
        .filter(([, v]) => v > 0)
        .map(([k, v]) => `${k} ${v}개`)
        .join(', ')
      const yp = saju.fourPillars.year
      sajuContext = `출생연도: ${year}년 (${yp.stem}${yp.branch} / ${yp.stemKorean}${yp.branchKorean}년생)
일간(日干): ${saju.dayMaster.stemKorean}(${saju.dayMaster.stem}) — ${saju.dayMaster.element} ${saju.dayMaster.yinYang}
오행 분포: ${elemStr}
일주(日柱): ${saju.fourPillars.day.stem}${saju.fourPillars.day.branch}(${saju.fourPillars.day.stemKorean}${saju.fourPillars.day.branchKorean})`
    } catch (err) {
      console.warn('사주 계산 실패, zodiac만으로 진행', err)
    }
  } else if (zodiac && isValidZodiac(zodiac)) {
    resolvedZodiac = zodiac
    cacheKey = `fortune:${date}:${zodiac}`
  } else {
    return Response.json({ error: 'INVALID_INPUT' }, { status: 400 })
  }

  // ── Redis 캐시 확인 ────────────────────────────────────────────────────
  if (redis) {
    try {
      const cached = await redis.get<DailyFortune>(cacheKey)
      if (cached) return Response.json({ data: cached, cached: true })
    } catch (err) {
      console.warn('Redis 캐시 조회 실패', err)
    }
  }

  // ── AI 운세 생성 ────────────────────────────────────────────────────────
  let fortune: DailyFortune
  try {
    fortune = await generateFortune(resolvedZodiac, date, sajuContext)
  } catch (err) {
    const raw = err instanceof Error ? err.message : 'UNKNOWN_ERROR'
    let code: string
    if (raw === 'AI_KEY_MISSING') code = 'AI_KEY_MISSING'
    else if (raw === 'AI_PARSE_ERROR') code = 'AI_PARSE_ERROR'
    else if (raw.includes('401') || raw.includes('auth')) code = 'AI_AUTH_ERROR'
    else if (raw.includes('429') || raw.includes('rate')) code = 'AI_RATE_LIMIT'
    else code = 'AI_ERROR'
    return Response.json({ error: code }, { status: 503 })
  }

  // ── Redis 캐시 저장 ────────────────────────────────────────────────────
  if (redis) {
    try {
      await redis.set(cacheKey, fortune, { ex: secondsUntilMidnightKST() })
    } catch (err) {
      console.warn('Redis 캐시 저장 실패', err)
    }
  }

  return Response.json({ data: fortune, cached: false })
}
