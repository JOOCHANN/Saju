import type { Metadata, Viewport } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'
import BottomTabBar from '@/components/layout/BottomTabBar'

export const metadata: Metadata = {
  title: {
    default: '사주 — AI 사주 분석 서비스',
    template: '%s | 사주',
  },
  description: 'AI가 해석해주는 나의 사주. 누구나 쉽게 접근 가능한 사주/운세 서비스.',
  keywords: ['사주', '운세', '사주팔자', '오늘의운세', '궁합', '대운', 'AI사주'],
  openGraph: {
    title: '사주 — AI 사주 분석 서비스',
    description: 'AI가 해석해주는 나의 사주',
    locale: 'ko_KR',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="bg-background antialiased">
        <div className="mobile-container relative min-h-screen">
          <Header />
          <main className="pb-16">{children}</main>
          <BottomTabBar />
        </div>
      </body>
    </html>
  )
}
