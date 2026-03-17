import { auth, signOut } from '@/auth'

// 사용자별 콘텐츠: 빌드 타임 정적 생성 불가
export const dynamic = 'force-dynamic'
import { LogOut, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default async function MyPage() {
  const session = await auth()
  const user = session?.user

  return (
    <div className="flex flex-col gap-6 px-4 py-5">
      {/* 프로필 섹션 */}
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
        {user?.image ? (
          <Image
            src={user.image}
            alt={user.name ?? '프로필'}
            width={56}
            height={56}
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <User size={28} className="text-muted-foreground" strokeWidth={1.5} />
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          {user ? (
            <>
              <p className="truncate font-semibold">{user.name ?? '사용자'}</p>
              <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">로그인이 필요해요</p>
              <Link
                href="/login"
                className="mt-1 inline-block text-sm font-semibold text-indigo-600 underline-offset-2 hover:underline"
              >
                로그인 / 회원가입
              </Link>
            </>
          )}
        </div>
      </div>

      {/* 메뉴 */}
      <div className="flex flex-col gap-1 rounded-2xl border border-border bg-card overflow-hidden">
        {[
          { label: '내 사주 정보', href: '/mypage/saju-info' },
          { label: '알림 설정', href: '/mypage/notifications' },
          { label: '고객 지원', href: '/mypage/support' },
          { label: '이용약관', href: '/terms' },
          { label: '개인정보처리방침', href: '/privacy' },
        ].map(({ label, href }, i, arr) => (
          <Link
            key={label}
            href={href}
            className={`flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-muted/50 ${
              i !== arr.length - 1 ? 'border-b border-border' : ''
            }`}
          >
            <span className="text-sm">{label}</span>
            <span className="text-muted-foreground">›</span>
          </Link>
        ))}
      </div>

      {/* 로그아웃 */}
      {user && (
        <form
          action={async () => {
            'use server'
            await signOut({ redirectTo: '/' })
          }}
        >
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50"
          >
            <LogOut size={16} />
            로그아웃
          </button>
        </form>
      )}

      <p className="text-center text-xs text-muted-foreground">버전 0.1.0</p>
    </div>
  )
}
