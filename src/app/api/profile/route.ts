// 사용자 사주 프로필 API (생년월일 암호화 저장)
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { userProfiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { encrypt, decrypt } from '@/lib/crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ── GET: 내 프로필 조회 ─────────────────────────────────────────────────────

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, session.user.id),
  })

  if (!profile) {
    return Response.json({ data: null })
  }

  // 복호화
  try {
    const birthDateRaw = await decrypt(profile.birthDate)
    const [year, month, day] = birthDateRaw.split('-').map(Number)
    const hour =
      profile.birthHour ? Number(await decrypt(profile.birthHour)) : undefined

    return Response.json({
      data: {
        year,
        month,
        day,
        hour,
        gender: profile.gender === 'MALE' ? 'male' : 'female',
        isLunar: profile.isLunar,
      },
    })
  } catch {
    return Response.json({ error: 'DECRYPT_FAILED' }, { status: 500 })
  }
}

// ── PUT: 프로필 저장/수정 ───────────────────────────────────────────────────

const profileSchema = z.object({
  year: z.number().int().min(1900).max(2030),
  month: z.number().int().min(1).max(12),
  day: z.number().int().min(1).max(31),
  hour: z.number().int().min(0).max(23).optional(),
  gender: z.enum(['male', 'female']),
})

export async function PUT(request: Request) {
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

  const parsed = profileSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'INVALID_INPUT' }, { status: 400 })
  }

  const { year, month, day, hour, gender } = parsed.data

  // 암호화
  const birthDate = await encrypt(
    `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
  )
  const birthHour = hour !== undefined ? await encrypt(String(hour)) : null

  const existing = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, session.user.id),
    columns: { id: true },
  })

  if (existing) {
    await db
      .update(userProfiles)
      .set({ birthDate, birthHour, gender: gender === 'male' ? 'MALE' : 'FEMALE' })
      .where(eq(userProfiles.userId, session.user.id))
  } else {
    await db.insert(userProfiles).values({
      userId: session.user.id,
      birthDate,
      birthHour,
      gender: gender === 'male' ? 'MALE' : 'FEMALE',
      isLunar: false,
    })
  }

  return Response.json({ data: { ok: true } })
}
