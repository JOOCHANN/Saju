// 궁합 분석 API — 두 사람의 사주 비교 + AI 해석 SSE 스트리밍
import OpenAI from 'openai'
import { z } from 'zod'
import { calculateSaju } from '@/lib/saju'
import { buildGunghapUserMessage, GUNGHAP_SYSTEM_PROMPT } from '@/lib/ai/prompts'

export const dynamic = 'force-dynamic'

const personSchema = z.object({
  year: z.number().int().min(1900).max(2020),
  month: z.number().int().min(1).max(12),
  day: z.number().int().min(1).max(31),
  hour: z.number().int().min(0).max(23).optional(),
  gender: z.enum(['male', 'female']),
})

const inputSchema = z.object({
  person1: personSchema,
  person2: personSchema,
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

  // ── 사주 계산 ────────────────────────────────────────────────────────────
  const saju1 = calculateSaju(parsed.data.person1)
  const saju2 = calculateSaju(parsed.data.person2)
  const userMessage = buildGunghapUserMessage(saju1, saju2)

  // ── SSE 스트리밍 ─────────────────────────────────────────────────────────
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (data: string) =>
        controller.enqueue(encoder.encode(`data: ${data}\n\n`))

      // 1단계: 두 사람의 사주 계산 결과 즉시 전송
      enqueue(JSON.stringify({ type: 'saju', payload: { saju1, saju2 } }))

      const apiKey = process.env.OPENAI_API_KEY
      if (!apiKey) {
        enqueue('[DONE]')
        controller.close()
        return
      }

      // 2단계: AI 궁합 해석 스트리밍
      try {
        const gatewayUrl = process.env.CF_AI_GATEWAY_URL
        const openai = new OpenAI({
          apiKey,
          ...(gatewayUrl ? { baseURL: gatewayUrl } : {}),
        })
        const messageStream = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          max_tokens: 2000,
          stream: true,
          messages: [
            { role: 'system', content: GUNGHAP_SYSTEM_PROMPT },
            { role: 'user', content: userMessage },
          ],
        })

        for await (const chunk of messageStream) {
          const text = chunk.choices[0]?.delta?.content
          if (text) {
            enqueue(JSON.stringify({ type: 'text', text }))
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        enqueue(JSON.stringify({ type: 'ai_error', message }))
      }

      enqueue('[DONE]')
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  })
}
