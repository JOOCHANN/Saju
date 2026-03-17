// 사주 AI 분석 API — SSE 스트리밍
// Claude API는 fetch 기반이므로 Edge Runtime 사용 가능
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { calculateSaju } from '@/lib/saju'
import { buildSajuUserMessage, SAJU_SYSTEM_PROMPT } from '@/lib/ai/prompts'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

const inputSchema = z.object({
  year: z.number().int().min(1900).max(2020),
  month: z.number().int().min(1).max(12),
  day: z.number().int().min(1).max(31),
  hour: z.number().int().min(0).max(23).optional(),
  gender: z.enum(['male', 'female']),
})

export async function POST(request: Request) {
  // ── 입력 검증 ────────────────────────────────────────────────────────────
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

  // ── Claude API 스트리밍 ──────────────────────────────────────────────────
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'AI_NOT_CONFIGURED' }, { status: 503 })
  }

  const anthropic = new Anthropic({ apiKey })
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (data: string) =>
        controller.enqueue(encoder.encode(`data: ${data}\n\n`))

      try {
        // 사주 계산 결과를 첫 번째 이벤트로 전송 (클라이언트 즉시 렌더링)
        enqueue(JSON.stringify({ type: 'saju', payload: sajuResult }))

        const messageStream = anthropic.messages.stream({
          model: 'claude-sonnet-4-6',
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

        enqueue('[DONE]')
        controller.close()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        enqueue(JSON.stringify({ type: 'error', message }))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no', // Nginx 버퍼링 비활성화
    },
  })
}
