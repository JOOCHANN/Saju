// 사주 계산 + AI 해석 API — SSE 스트리밍
// 1단계: 사주 계산 결과 즉시 전송
// 2단계: Claude AI 해석 텍스트 스트리밍
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { calculateSaju } from '@/lib/saju'
import { buildSajuUserMessage, SAJU_SYSTEM_PROMPT } from '@/lib/ai/prompts'

export const dynamic = 'force-dynamic'

const inputSchema = z.object({
  year: z.number().int().min(1900).max(2020),
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

  // ── 사주 계산 ────────────────────────────────────────────────────────────
  const sajuResult = calculateSaju(parsed.data)
  const userMessage = buildSajuUserMessage(sajuResult)

  // ── SSE 스트리밍 ─────────────────────────────────────────────────────────
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (data: string) =>
        controller.enqueue(encoder.encode(`data: ${data}\n\n`))

      // 1단계: 사주 계산 결과 즉시 전송
      enqueue(JSON.stringify({ type: 'saju', payload: sajuResult }))

      // ANTHROPIC_API_KEY 없으면 해석 없이 종료
      const apiKey = process.env.ANTHROPIC_API_KEY
      if (!apiKey) {
        enqueue('[DONE]')
        controller.close()
        return
      }

      // 2단계: AI 해석 스트리밍
      try {
        const anthropic = new Anthropic({ apiKey })
        const messageStream = anthropic.messages.stream({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1500,
          system: SAJU_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userMessage }],
        })

        for await (const event of messageStream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            enqueue(JSON.stringify({ type: 'text', text: event.delta.text }))
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
