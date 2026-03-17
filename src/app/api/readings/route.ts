// 사주 분석 저장/조회 API
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { readings } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { z } from 'zod'
import type { SajuResult } from '@/lib/saju'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ── GET: 내 분석 목록 ───────────────────────────────────────────────────────

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  const list = await db
    .select({
      id: readings.id,
      type: readings.type,
      resultData: readings.resultData,
      createdAt: readings.createdAt,
    })
    .from(readings)
    .where(eq(readings.userId, session.user.id))
    .orderBy(desc(readings.createdAt))
    .limit(50)

  return Response.json({ data: list })
}

// ── POST: 분석 저장 ─────────────────────────────────────────────────────────

const saveSchema = z.object({
  sajuResult: z.record(z.unknown()),
  aiText: z.string().max(5000),
})

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'INVALID_JSON' }, { status: 400 })
  }

  const parsed = saveSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'INVALID_INPUT' }, { status: 400 })
  }

  const result = parsed.data.sajuResult as unknown as SajuResult
  const { aiText } = parsed.data

  // inputData: 생년도 + 성별만 (민감 데이터 최소화)
  const inputData = {
    year: result.input.year,
    gender: result.input.gender,
  }

  // resultData: 사주 계산 결과 + AI 텍스트
  const resultData = {
    summary: result.summary,
    dayMaster: result.dayMaster,
    fourPillars: result.fourPillars,
    elementBalance: result.elementBalance,
    tenGods: result.tenGods,
    aiText,
  }

  const [inserted] = await db
    .insert(readings)
    .values({
      userId: session.user.id,
      type: 'SAJU_BASIC',
      inputData,
      resultData,
    })
    .returning({ id: readings.id })

  return Response.json({ data: { id: inserted.id } }, { status: 201 })
}
