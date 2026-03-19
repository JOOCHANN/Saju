// 사주 계산 API — 순수 계산만 반환 (AI 해석은 /api/saju/interpret 에서)
import { z } from 'zod'
import { calculateSaju } from '@/lib/saju'

export const dynamic = 'force-dynamic'

const inputSchema = z.object({
  year: z.number().int().min(1900).max(2030),
  month: z.number().int().min(1).max(12),
  day: z.number().int().min(1).max(31),
  hour: z.number().int().min(0).max(23).optional(),
  gender: z.enum(['male', 'female']),
})

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'INVALID_JSON' }, { status: 400 })
  }

  const parsed = inputSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: 'INVALID_INPUT', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const sajuResult = calculateSaju(parsed.data)
  return Response.json({ data: sajuResult })
}
