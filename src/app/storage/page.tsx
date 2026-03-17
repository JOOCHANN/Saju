import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { readings } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import StorageClient, { type StoredReading } from '@/components/storage/StorageClient'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default async function StoragePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=/storage')

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

  return (
    <div className="flex flex-col gap-4 px-4 py-5">
      <div>
        <h1 className="text-xl font-bold">보관함</h1>
        <p className="mt-1 text-sm text-muted-foreground">저장한 사주 분석 {list.length}개</p>
      </div>
      <StorageClient
        initialReadings={list.map((r) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
        })) as StoredReading[]}
      />
    </div>
  )
}
