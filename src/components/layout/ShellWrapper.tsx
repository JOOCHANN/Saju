'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import BottomTabBar from './BottomTabBar'

// 이 경로에서는 헤더/탭바를 숨깁니다
const NO_SHELL_PATHS = ['/login', '/signup']

export default function ShellWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hasShell = !NO_SHELL_PATHS.some((p) => pathname.startsWith(p))

  if (!hasShell) {
    return <div className="mobile-container min-h-screen">{children}</div>
  }

  return (
    <div className="mobile-container relative min-h-screen">
      <Header />
      <main className="pb-16">{children}</main>
      <BottomTabBar />
    </div>
  )
}
