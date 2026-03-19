import Link from 'next/link'
import { Calendar, ChevronRight, Heart, Moon, Sparkles } from 'lucide-react'

const services = [
  {
    href: '/saju',
    icon: Moon,
    title: 'AI 사주 분석',
    desc: '사주팔자로 보는\n나의 운명',
    bg: 'bg-indigo-50',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
  },
  {
    href: '/fortune',
    icon: Sparkles,
    title: '오늘의 운세',
    desc: '매일 업데이트\n되는 운세',
    bg: 'bg-amber-50',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    href: '/saju',
    icon: Heart,
    title: '궁합',
    desc: '나와 맞는\n상대는?',
    bg: 'bg-rose-50',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-500',
    soon: true,
  },
  {
    href: '/saju',
    icon: Calendar,
    title: '택일',
    desc: '좋은 날\n선택하기',
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    soon: true,
  },
]

export default function HomePage() {
  const today = new Date()
  const dateStr = today.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  return (
    <div className="flex flex-col gap-6 px-4 py-5">
      {/* 날짜 인사 */}
      <div>
        <p className="text-sm text-muted-foreground">{dateStr}</p>
        <h2 className="mt-1 text-2xl font-bold leading-tight">
          오늘의 운세를
          <br />
          확인해보세요 ✨
        </h2>
      </div>

      {/* 오늘의 운세 CTA 카드 */}
      <Link href="/fortune">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 p-5 text-white shadow-lg">
          <div className="relative z-10">
            <p className="text-sm font-medium text-indigo-200">오늘의 운세</p>
            <p className="mt-1 text-xl font-bold">지금 바로 확인하기</p>
            <p className="mt-1 text-sm text-indigo-200">매일 자정에 업데이트됩니다</p>
            <div className="mt-4 flex items-center gap-1 text-sm font-semibold">
              운세 보기 <ChevronRight size={16} />
            </div>
          </div>
          {/* 배경 장식 */}
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -right-2 h-32 w-32 rounded-full bg-white/5" />
          <Sparkles
            size={48}
            className="absolute bottom-4 right-5 text-white/20"
            strokeWidth={1}
          />
        </div>
      </Link>

      {/* 서비스 그리드 */}
      <div>
        <h3 className="mb-3 text-base font-semibold text-foreground">서비스</h3>
        <div className="grid grid-cols-2 gap-3">
          {services.map(({ href, icon: Icon, title, desc, bg, iconBg, iconColor, soon }) => (
            <Link key={title} href={href}>
              <div
                className={`relative flex h-36 flex-col justify-between rounded-2xl p-4 transition-opacity active:opacity-80 ${bg}`}
              >
                {soon && (
                  <span className="absolute right-3 top-3 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    준비 중
                  </span>
                )}
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
                  <Icon size={20} className={iconColor} strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="mt-0.5 whitespace-pre-line text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* AI 사주 분석 배너 */}
      <Link href="/saju">
        <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100">
              <Moon size={22} className="text-indigo-600" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-semibold">AI 사주 분석 받기</p>
              <p className="text-xs text-muted-foreground">생년월일시로 정확한 분석</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-muted-foreground" />
        </div>
      </Link>

      {/* 저작권 */}
      <p className="text-right text-[11px] text-gray-300">made by 윤공주</p>
    </div>
  )
}
