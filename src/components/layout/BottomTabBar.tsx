'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Archive, Home, Moon, Sparkles, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/', label: '홈', icon: Home },
  { href: '/fortune', label: '운세', icon: Sparkles },
  { href: '/saju', label: '사주', icon: Moon },
  { href: '/storage', label: '보관함', icon: Archive },
  { href: '/mypage', label: '마이', icon: User },
]

export default function BottomTabBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 border-t border-border bg-background">
      <div className="flex h-16 items-center">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs transition-colors',
                isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/70',
              )}
            >
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.7} />
              <span className={cn('font-medium', isActive && 'font-semibold')}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
