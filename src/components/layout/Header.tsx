'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell } from 'lucide-react'

const pageTitles: Record<string, string> = {
  '/fortune': '오늘의 운세',
  '/saju': 'AI 사주 분석',
  '/storage': '보관함',
  '/mypage': '마이페이지',
}

export default function Header() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const title = pageTitles[pathname]

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="flex h-14 items-center justify-between px-4">
        {isHome ? (
          <Link href="/" className="text-xl font-bold tracking-tight">
            사주
          </Link>
        ) : (
          <h1 className="text-lg font-semibold">{title ?? '사주'}</h1>
        )}
        {isHome && (
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-muted"
            aria-label="알림"
          >
            <Bell size={20} strokeWidth={1.7} />
          </button>
        )}
      </div>
    </header>
  )
}
