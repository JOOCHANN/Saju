// 오늘의 운세 API — Redis 캐싱 + OpenAI 생성
// mode 1: zodiac (띠 기반)
// mode 2: birthdate (생년월일 → 사주 기반 개인화)
import OpenAI from 'openai'
import { z } from 'zod'
import { redis, getTodayKST, secondsUntilMidnightKST } from '@/lib/cache/redis'
import { isValidZodiac, getZodiacByYear, ZODIACS } from '@/lib/fortune/zodiac'
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
  lottoSets: number[][]   // 5세트 × 6개 (정렬됨)
  personalized?: boolean
}

// ────────────────────────────────────────────────────────────────────────────
// 시드 기반 결정론적 난수 (같은 날 같은 사람 → 동일 결과 / 다른 사람 → 다른 결과)
// ────────────────────────────────────────────────────────────────────────────

const LUCKY_COLORS = [
  '산호색', '민트색', '라벤더색', '황토색', '청록색', '버건디색', '올리브색', '살구색',
  '하늘색', '자주색', '연두색', '진홍색', '카키색', '아이보리색', '코발트색', '금색',
  '은색', '베이지색', '에메랄드색', '로즈골드색', '인디고색', '연보라색', '주황색', '장미색',
  '복숭아색', '하늘색', '밤색', '청포도색',
]

function lcg(seed: number) {
  // 선형 합동 생성기 — 0~1 사이 float 반환
  let s = seed >>> 0
  return () => {
    s = ((Math.imul(1664525, s) + 1013904223) >>> 0)
    return s / 4294967296
  }
}

function makeSeed(dateStr: string, extra: number): number {
  // 날짜(YYYYMMDD) * 소수 + extra → 고유 시드
  const d = parseInt(dateStr.replace(/-/g, ''), 10)
  return (d * 31337 + extra * 7919) >>> 0
}

function computeFortuneNumbers(seed: number) {
  const rng = lcg(seed)

  // 색상 선택
  const luckyColor = LUCKY_COLORS[Math.floor(rng() * LUCKY_COLORS.length)]

  // 행운 번호
  const luckyNumber = Math.floor(rng() * 99) + 1

  // 점수: 0~100, 4개 항목이 서로 다르고 최대-최소 차이 ≥ 25 보장
  let scores: number[]
  let attempts = 0
  do {
    scores = [
      Math.floor(rng() * 101),
      Math.floor(rng() * 101),
      Math.floor(rng() * 101),
      Math.floor(rng() * 101),
    ]
    attempts++
  } while (Math.max(...scores) - Math.min(...scores) < 25 && attempts < 30)

  // 로또 번호 5세트 (1~45 중 6개, 오름차순)
  const lottoSets: number[][] = []
  for (let s = 0; s < 5; s++) {
    // Fisher-Yates 셔플로 1~45 배열에서 6개 뽑기
    const pool = Array.from({ length: 45 }, (_, i) => i + 1)
    for (let i = 44; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]]
    }
    lottoSets.push(pool.slice(0, 6).sort((a, b) => a - b))
  }

  return {
    score: {
      overall: scores[0],
      love: scores[1],
      money: scores[2],
      health: scores[3],
    },
    luckyColor,
    luckyNumber,
    lottoSets,
  }
}

// ────────────────────────────────────────────────────────────────────────────
// AI 운세 텍스트 생성 (점수·색·번호는 서버에서 직접 계산 후 전달)
// ────────────────────────────────────────────────────────────────────────────

async function generateFortuneText(
  zodiac: string,
  date: string,
  numbers: ReturnType<typeof computeFortuneNumbers>,
  sajuContext?: string,
): Promise<Pick<DailyFortune, 'overall' | 'love' | 'money' | 'health'>> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('AI_KEY_MISSING')

  const gatewayUrl = process.env.CF_AI_GATEWAY_URL
  const openai = new OpenAI({
    apiKey,
    ...(gatewayUrl ? { baseURL: gatewayUrl } : {}),
  })

  const { score } = numbers
  const scoreDesc = (s: number) => s >= 80 ? '매우 좋음' : s >= 60 ? '좋음' : s >= 40 ? '보통' : s >= 20 ? '주의 필요' : '어려운 날'

  const scoreContext = `오늘 점수: 전체운 ${score.overall}(${scoreDesc(score.overall)}), 사랑운 ${score.love}(${scoreDesc(score.love)}), 재물운 ${score.money}(${scoreDesc(score.money)}), 건강운 ${score.health}(${scoreDesc(score.health)})`

  const prompt = sajuContext
    ? `오늘(${date}) 아래 사주를 가진 ${zodiac}띠 사람의 운세 문장을 JSON으로 작성해주세요.

사주 정보:
${sajuContext}

${scoreContext}
위 점수에 맞게 각 운세 2~3문장을 작성하세요. 점수가 낮은 항목은 주의사항 위주로, 높은 항목은 긍정적으로 서술하세요.
사주 특성(출생연도 간지, 일간 기질, 오행 분포)을 반영한 개인화된 내용으로 작성하세요.

{"overall":"전체운 2~3문장","love":"사랑운 2~3문장","money":"재물운 2~3문장","health":"건강운 2~3문장"}

반드시 위 JSON 형식만 응답하고 다른 텍스트는 포함하지 마세요.`
    : `오늘(${date}) ${zodiac}띠 운세 문장을 JSON으로 작성해주세요.

${scoreContext}
위 점수에 맞게 각 운세 2~3문장을 자연스러운 한국어로 작성하세요. 점수가 낮은 항목은 주의사항 위주로, 높은 항목은 긍정적으로 서술하세요.

{"overall":"전체운 2~3문장","love":"사랑운 2~3문장","money":"재물운 2~3문장","health":"건강운 2~3문장"}

반드시 위 JSON 형식만 응답하고 다른 텍스트나 마크다운 코드 블록은 포함하지 마세요.`

  const message = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.choices[0]?.message?.content?.trim() ?? ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('AI_PARSE_ERROR')

  const parsed = JSON.parse(jsonMatch[0]) as Record<string, string>
  return {
    overall: String(parsed.overall ?? ''),
    love: String(parsed.love ?? ''),
    money: String(parsed.money ?? ''),
    health: String(parsed.health ?? ''),
  }
}

// ────────────────────────────────────────────────────────────────────────────
// 라우트 핸들러
// ────────────────────────────────────────────────────────────────────────────

const querySchema = z.object({
  zodiac: z.string().min(1).optional(),
  year: z.coerce.number().int().min(1900).max(2030).optional(),
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
  let seed: number

  if (year) {
    // 연도(+월+일) 모드
    resolvedZodiac = getZodiacByYear(year)

    if (month && day) {
      // 생년월일 완전 입력 — 사주 기반 개인화
      cacheKey = `fortune:v2:${date}:birth:${year}-${month}-${day}`
      seed = makeSeed(date, year * 10000 + month * 100 + day)

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
    } else {
      // 연도만 입력 — 띠 기반 (연도로 시드 차별화)
      cacheKey = `fortune:v2:${date}:birth:${year}`
      seed = makeSeed(date, year)
    }
  } else if (zodiac && isValidZodiac(zodiac)) {
    resolvedZodiac = zodiac
    cacheKey = `fortune:v2:${date}:${zodiac}`
    // 띠 모드 — 시드: 날짜 + 띠 인덱스
    const zodiacIdx = ZODIACS.findIndex((z) => z.name === zodiac)
    seed = makeSeed(date, zodiacIdx + 1)
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

  // ── 점수·색상·번호 서버에서 계산 ────────────────────────────────────────
  const numbers = computeFortuneNumbers(seed)

  // ── AI 텍스트 생성 ──────────────────────────────────────────────────────
  let textContent: Pick<DailyFortune, 'overall' | 'love' | 'money' | 'health'>
  try {
    textContent = await generateFortuneText(resolvedZodiac, date, numbers, sajuContext)
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

  const fortune: DailyFortune = {
    zodiac: resolvedZodiac,
    date,
    ...textContent,
    ...numbers,
    personalized: !!sajuContext,
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
