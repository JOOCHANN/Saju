// 사주 분석 삭제 API
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { readings } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function DELETE(
  _req: Request,
  props: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  const { id } = await props.params

  const deleted = await db
    .delete(readings)
    .where(and(eq(readings.id, id), eq(readings.userId, session.user.id)))
    .returning({ id: readings.id })

  if (!deleted.length) {
    return Response.json({ error: 'NOT_FOUND' }, { status: 404 })
  }

  return Response.json({ data: { id: deleted[0].id } })
}
