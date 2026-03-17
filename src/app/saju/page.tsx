import { auth } from '@/auth'
import SajuClient from '@/components/saju/SajuClient'

export const dynamic = 'force-dynamic'

export default async function SajuPage() {
  const session = await auth()
  return <SajuClient isLoggedIn={!!session?.user?.id} />
}
