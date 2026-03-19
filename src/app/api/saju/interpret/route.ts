// 사주 AI 해석 API — SSE 스트리밍 (사주 계산 결과를 받아 AI 해석 생성)
import OpenAI from 'openai'
import { z } from 'zod'
import { buildSajuUserMessage, SAJU_SYSTEM_PROMPT } from '@/lib/ai/prompts'
import type { SajuResult } from '@/lib/saju'

export const dynamic = 'force-dynamic'

const inputSchema = z.object({
  sajuResult: z.record(z.unknown()),
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
    return Response.json({ error: 'INVALID_INPUT' }, { status: 400 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'AI_KEY_MISSING' }, { status: 503 })
  }

  const sajuResult = parsed.data.sajuResult as unknown as SajuResult
  const userMessage = buildSajuUserMessage(sajuResult)

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (data: string) =>
        controller.enqueue(encoder.encode(`data: ${data}\n\n`))

      try {
        const gatewayUrl = process.env.CF_AI_GATEWAY_URL
        const openai = new OpenAI({
          apiKey,
          ...(gatewayUrl ? { baseURL: gatewayUrl } : {}),
        })

        const messageStream = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          max_tokens: 3500,
          stream: true,
          messages: [
            { role: 'system', content: SAJU_SYSTEM_PROMPT },
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
