// 19금 사주 API — 성인 관계·연애·매력 운세 (Redis 캐싱 + OpenAI JSON)
import OpenAI from 'openai'
import { z } from 'zod'
import { redis, getTodayKST, secondsUntilMidnightKST } from '@/lib/cache/redis'
import { calculateSaju } from '@/lib/saju'

export const dynamic = 'force-dynamic'

// ────────────────────────────────────────────────────────────────────────────
// 타입
// ────────────────────────────────────────────────────────────────────────────

export interface AdultFortune {
  date: string
  energySummary: string      // 🔥 오늘의 관계 에너지 한 줄
  attractiveness: string     // 💋 매력 & 끌림 분석
  psychFlow: string          // 🧠 관계 심리 흐름
  actionGuide: {             // 🎯 행동 가이드
    contact: string
    timing: string
    avoid: string
  }
  warning: string            // ⚠️ 주의 포인트
  timeFlow: {                // ⏰ 시간대별 관계 흐름
    morning: string
    afternoon: string
    night: string
  }
  score: number              // 📊 성인 관계 운 점수 (1~100)
  personalized: boolean
}

// ────────────────────────────────────────────────────────────────────────────
// 시드 기반 결정론적 난수
// ────────────────────────────────────────────────────────────────────────────

function lcg(seed: number) {
  let s = seed >>> 0
  return () => {
    s = ((Math.imul(1664525, s) + 1013904223) >>> 0)
    return s / 4294967296
  }
}

function makeSeed(dateStr: string, extra: number): number {
  const d = parseInt(dateStr.replace(/-/g, ''), 10)
  return (d * 31337 + extra * 7919) >>> 0
}

function computeScore(seed: number): number {
  const rng = lcg(seed)
  // 40점 이상 확률 84%
  return Math.floor(Math.max(rng(), rng()) * 100) + 1
}

// ────────────────────────────────────────────────────────────────────────────
// AI 운세 텍스트 생성
// ────────────────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  single: '솔로',
  crush: '썸',
  dating: '연애 중',
}

async function generateAdultFortune(
  date: string,
  year: number,
  gender: string,
  status: string,
  score: number,
  sajuContext?: string,
): Promise<Omit<AdultFortune, 'date' | 'score' | 'personalized'>> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('AI_KEY_MISSING')

  const gatewayUrl = process.env.CF_AI_GATEWAY_URL
  const openai = new OpenAI({
    apiKey,
    ...(gatewayUrl ? { baseURL: gatewayUrl } : {}),
  })

  const genderKo = gender === 'male' ? '남성' : '여성'
  const statusKo = STATUS_LABEL[status] ?? '알 수 없음'
  const scoreDesc = score >= 80 ? '매우 강함' : score >= 60 ? '좋음' : score >= 40 ? '보통' : '약함'
  const sajuLine = sajuContext ? `\n사주 정보:\n${sajuContext}\n` : ''

  const prompt = `오늘(${date}) ${year}년생 ${genderKo}(현재 상태: ${statusKo})의 관계·연애·매력 운세를 아래 JSON 형식으로 작성해주세요.${sajuLine}
오늘의 관계 운 점수: ${score}점 (${scoreDesc})

작성 원칙:
- 관계, 감정, 매력, 타이밍, 끌림 중심으로 서술
- 직설적이되 품위 있게 (저급한 표현, 신체 묘사 절대 금지)
- "유혹", "끌림", "긴장감", "거리감", "감정 흐름" 같은 단어 적극 활용
- 현재 상태(${statusKo})를 반드시 반영한 맞춤 내용
- 읽는 사람이 "나 얘기 맞는데?" 느낌 들게 구체적으로
- 낮은 점수는 솔직하게, 높은 점수는 기회를 강조
${sajuContext ? '- 사주 특성을 반영해 개인화된 관계 흐름 분석' : ''}

반드시 아래 JSON만 응답 (마크다운/코드블록 금지):
{
  "energySummary": "오늘의 관계 에너지 한 줄 요약 (25자 이내, 구체적 상황/감정 포함)",
  "attractiveness": "오늘 내가 발산하는 매력과 상대에게 보이는 방식, 끌림이 발생하는 흐름 (3~4문장)",
  "psychFlow": "상대와의 거리감 변화, 밀당·감정 흐름·주도권 분석 (3~4문장)",
  "actionGuide": {
    "contact": "연락해야 하는지 기다려야 하는지 구체적 조언 (2문장)",
    "timing": "만남에 좋은 타이밍과 장소 분위기 (2문장)",
    "avoid": "오늘 피해야 할 행동이나 말 (2문장)"
  },
  "warning": "관계가 틀어질 수 있는 요소, 감정 오버·집착·오해 주의사항 (2~3문장)",
  "timeFlow": {
    "morning": "오전(06~12시) 관계 에너지 + 추천 행동 (2문장)",
    "afternoon": "오후(12~18시) 관계 에너지 + 추천 행동 (2문장)",
    "night": "저녁(18~24시) 관계 에너지 + 추천 행동 (2문장)"
  }
}`

  const message = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.choices[0]?.message?.content?.trim() ?? ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('AI_PARSE_ERROR')

  const p = JSON.parse(jsonMatch[0]) as Record<string, unknown>
  const ag = (p.actionGuide ?? {}) as Record<string, unknown>
  const tf = (p.timeFlow ?? {}) as Record<string, unknown>

  return {
    energySummary: String(p.energySummary ?? ''),
    attractiveness: String(p.attractiveness ?? ''),
    psychFlow: String(p.psychFlow ?? ''),
    actionGuide: {
      contact: String(ag.contact ?? ''),
      timing: String(ag.timing ?? ''),
      avoid: String(ag.avoid ?? ''),
    },
    warning: String(p.warning ?? ''),
    timeFlow: {
      morning: String(tf.morning ?? ''),
      afternoon: String(tf.afternoon ?? ''),
      night: String(tf.night ?? ''),
    },
  }
}

// ────────────────────────────────────────────────────────────────────────────
// 라우트 핸들러
// ────────────────────────────────────────────────────────────────────────────

const querySchema = z.object({
  year: z.coerce.number().int().min(1930).max(2008),
  month: z.coerce.number().int().min(1).max(12).optional(),
  day: z.coerce.number().int().min(1).max(31).optional(),
  gender: z.enum(['male', 'female']),
  status: z.enum(['single', 'crush', 'dating']),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const parsed = querySchema.safeParse({
    year: searchParams.get('year') ?? undefined,
    month: searchParams.get('month') ?? undefined,
    day: searchParams.get('day') ?? undefined,
    gender: searchParams.get('gender') ?? undefined,
    status: searchParams.get('status') ?? undefined,
  })

  if (!parsed.success) {
    return Response.json({ error: 'INVALID_INPUT' }, { status: 400 })
  }

  const { year, month, day, gender, status } = parsed.data
  const date = getTodayKST()

  // 캐시 키 (날짜 + 생년월일 + 성별 + 상태)
  const birthKey = month && day ? `${year}-${month}-${day}` : month ? `${year}-${month}` : `${year}`
  const cacheKey = `fortune-adult:v1:${date}:${birthKey}:${gender}:${status}`

  // ── Redis 캐시 확인 ────────────────────────────────────────────────────
  if (redis) {
    try {
      const cached = await redis.get<AdultFortune>(cacheKey)
      if (cached) return Response.json({ data: cached, cached: true })
    } catch (err) {
      console.warn('Redis 캐시 조회 실패', err)
    }
  }

  // ── 점수 계산 ──────────────────────────────────────────────────────────
  const seedExtra = year * 10000 + (month ?? 0) * 100 + (day ?? 0)
  // gender/status도 시드에 반영
  const genderOffset = gender === 'male' ? 3001 : 5003
  const statusOffset = status === 'single' ? 1001 : status === 'crush' ? 2003 : 3007
  const seed = makeSeed(date, seedExtra + genderOffset + statusOffset)
  const score = computeScore(seed)

  // ── 사주 컨텍스트 (생년월일 완전 입력 시) ──────────────────────────────
  let sajuContext: string | undefined
  if (month && day) {
    try {
      const saju = calculateSaju({ year, month, day, gender })
      const elemStr = Object.entries(saju.elementBalance)
        .filter(([, v]) => v > 0)
        .map(([k, v]) => `${k} ${v}개`)
        .join(', ')
      const yp = saju.fourPillars.year
      sajuContext = `출생: ${year}년 ${month}월 ${day}일 (${yp.stem}${yp.branch} / ${yp.stemKorean}${yp.branchKorean}년생)
일간(日干): ${saju.dayMaster.stemKorean}(${saju.dayMaster.stem}) — ${saju.dayMaster.element} ${saju.dayMaster.yinYang}
오행 분포: ${elemStr}
일주(日柱): ${saju.fourPillars.day.stem}${saju.fourPillars.day.branch}(${saju.fourPillars.day.stemKorean}${saju.fourPillars.day.branchKorean})`
    } catch (err) {
      console.warn('사주 계산 실패', err)
    }
  }

  // ── AI 텍스트 생성 ────────────────────────────────────────────────────
  let textContent: Omit<AdultFortune, 'date' | 'score' | 'personalized'>
  try {
    textContent = await generateAdultFortune(date, year, gender, status, score, sajuContext)
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

  const fortune: AdultFortune = {
    date,
    ...textContent,
    score,
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
