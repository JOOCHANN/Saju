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
  status: 'single' | 'crush' | 'dating'
  energySummary: string        // 🔥 오늘의 관계 에너지 한 줄
  tension: string              // 💫 관계 텐션 (주도권·거리감·긴장감)
  actionGuide: {               // 🎯 행동 가이드 (시간·방식·조건·분기 포함)
    contact: string
    meeting: string
    conversation: string
  }
  timeFlow: {                  // ⏰ 시간대별 미션
    morning: string
    afternoon: string
    night: string
  }
  psychAnalysis: string        // 🧠 관계 심리 분석
  warning: string              // ⚠️ 주의 포인트
  score: number                // 헤더 표시용 점수 (1~100)
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
  return Math.floor(Math.max(rng(), rng()) * 100) + 1
}

// ────────────────────────────────────────────────────────────────────────────
// 상태별 프롬프트 분기
// ────────────────────────────────────────────────────────────────────────────

const STATUS_CONTEXT: Record<string, string> = {
  single: `현재 상태: 솔로
→ 새로운 인연 가능성, 첫 인상 관리, 접근 전략 중심으로 작성
→ "언제 어디서 어떻게 접근할지" 구체적 행동 포함
→ 새 인연이 나타날 수 있는 상황·장소 힌트 포함`,

  crush: `현재 상태: 썸 단계
→ 밀당 타이밍, 주도권 이동, 고백 가능성 중심으로 작성
→ "지금 밀어야 하는가 vs 기다려야 하는가" 명확하게 판단
→ 상대의 심리 흐름 분석 포함`,

  dating: `현재 상태: 연애 중
→ 관계 깊이, 감정 균형, 갈등 예방 중심으로 작성
→ "오늘 파트너와 어떻게 연결될 것인가" 구체적으로
→ 관계 유지·강화를 위한 실질적 행동 포함`,
}

const STATUS_LABEL: Record<string, string> = {
  single: '솔로',
  crush: '썸',
  dating: '연애 중',
}

// ────────────────────────────────────────────────────────────────────────────
// AI 운세 텍스트 생성
// ────────────────────────────────────────────────────────────────────────────

async function generateAdultFortune(
  date: string,
  year: number,
  gender: string,
  status: string,
  score: number,
  sajuContext?: string,
): Promise<Omit<AdultFortune, 'date' | 'score' | 'status' | 'personalized'>> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('AI_KEY_MISSING')

  const gatewayUrl = process.env.CF_AI_GATEWAY_URL
  const openai = new OpenAI({
    apiKey,
    ...(gatewayUrl ? { baseURL: gatewayUrl } : {}),
  })

  const genderKo = gender === 'male' ? '남성' : '여성'
  const statusKo = STATUS_LABEL[status] ?? '알 수 없음'
  const statusGuide = STATUS_CONTEXT[status] ?? ''
  const scoreDesc = score >= 80 ? '매우 강함' : score >= 60 ? '좋음' : score >= 40 ? '보통' : '약함'
  const sajuLine = sajuContext ? `\n사주 정보:\n${sajuContext}\n` : ''

  const prompt = `오늘(${date}) ${year}년생 ${genderKo}의 관계 운세를 아래 JSON 형식으로 작성해주세요.${sajuLine}

[상태별 분기]
${statusGuide}

관계 운 점수: ${score}점 (${scoreDesc})

[핵심 작성 원칙]
- 목표: 단순 운세가 아닌 "상황별 대응 전략"처럼 느껴지게 만들기
- 읽는 사람이 "내 얘기 같다 + 오늘 써먹을 수 있다" 느끼게 작성
- 직설적이되 저급하지 않게 — 심리 분석 느낌
- 신체 묘사·성행위 묘사 절대 금지
- 현재 상태(${statusKo})가 모든 섹션에 명확히 반영
${sajuContext ? '- 사주 특성을 반영해 개인화 강화' : ''}

[6가지 강화 규칙 — 모든 섹션에 적용]

규칙1. 선택지 + 리스크 구조
모든 주요 문장에 "행동 → 결과" 또는 "선택 → 리스크" 포함
예: "먼저 다가가면 빠르게 가까워질 수 있지만, 타이밍이 맞지 않으면 부담으로 느껴질 수 있음"

규칙2. 반응 기반 분기 (행동 가이드 필수)
상대 반응에 따른 분기 로직 포함
예: "답장이 1시간 내 오면 → 대화 이어가기 / 늦으면 → 추가 메시지 보내지 말고 기다리기"

규칙3. 조건 기반 개인화 (각 섹션 최소 1개)
"최근 연락 빈도가 줄었다면", "상대가 바쁜 상황이라면", "이미 감정 교류가 있다면" 등 조건 문장 포함

규칙4. 관계 텐션 강화
주도권·거리감·감정 깊이·긴장감 수준 명시, 반드시 "관계 방향이 바뀔 수 있는 순간" 1회 이상 언급

규칙5. 시간대별 미션 구조
단순 설명이 아닌 구체적 행동 미션 형태
예: "오전: 가벼운 연결 (짧은 메시지 1회) / 오후: 관계 탐색 (질문 2개) / 저녁: 감정 대화 시도"

규칙6. 주의 포인트 현실화
추상적 경고 금지, 실제 상황 기반
예: "답장이 늦어도 감정이 식었다고 단정하지 말 것 — 말투 변화에 과민 반응하면 오해가 커짐"

반드시 아래 JSON만 응답 (마크다운/코드블록 금지):
{
  "energySummary": "오늘의 관계 에너지 한 줄 (25자 이내, ${statusKo} 상황 구체적 묘사)",
  "tension": "관계 텐션 — 오늘 주도권(누가 리드), 거리감 변화(좁혀짐/유지/밀어냄), 긴장감 수준, 감정 깊이 방향을 구체적으로. 반드시 관계 방향이 바뀔 수 있는 순간 언급. 조건 문장 최소 1개 포함 (4~5문장)",
  "actionGuide": {
    "contact": "연락 — 구체적 시간대 + 메시지 톤/방식 + 상대 반응에 따른 분기 로직(답장 빠를 때/늦을 때 각각 대응) (3문장)",
    "meeting": "만남 — 언제(요일/시간) + 장소 분위기 + 선택→리스크 구조 포함 (2~3문장)",
    "conversation": "대화 — 주제 + 질문 vs 공유 비율 + 조건 문장(상대 반응이 미적지근하면/감정 표현이 있다면) (2~3문장)"
  },
  "timeFlow": {
    "morning": "오전 미션 — 구체적 행동 1가지 + 선택→리스크 포함 (2문장)",
    "afternoon": "오후 미션 — 구체적 행동 1가지 + 조건 문장 포함 (2문장)",
    "night": "저녁 미션 — 구체적 행동 1가지 + 반응 분기 포함 (2문장)"
  },
  "psychAnalysis": "관계 심리 분석 — ${statusKo} 상황에서 상대(또는 잠재 인연)의 심리 흐름, 나의 감정 패턴, 관계 역학. 조건 문장 최소 1개 포함 (4~5문장)",
  "warning": "실제 상황 기반 주의사항 — 추상적 경고 금지, 구체적 행동 패턴으로 서술. 조건 기반 1개 이상 (2~3문장)"
}`

  const message = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 2500,
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
    tension: String(p.tension ?? ''),
    actionGuide: {
      contact: String(ag.contact ?? ''),
      meeting: String(ag.meeting ?? ''),
      conversation: String(ag.conversation ?? ''),
    },
    timeFlow: {
      morning: String(tf.morning ?? ''),
      afternoon: String(tf.afternoon ?? ''),
      night: String(tf.night ?? ''),
    },
    psychAnalysis: String(p.psychAnalysis ?? ''),
    warning: String(p.warning ?? ''),
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

  const birthKey = month && day ? `${year}-${month}-${day}` : month ? `${year}-${month}` : `${year}`
  const cacheKey = `fortune-adult:v2:${date}:${birthKey}:${gender}:${status}`

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

  // ── AI 텍스트 생성 ──────────────────────────────────────────────────────
  let textContent: Omit<AdultFortune, 'date' | 'score' | 'status' | 'personalized'>
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
    status,
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
