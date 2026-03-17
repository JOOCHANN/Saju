import { User } from 'lucide-react'
import Link from 'next/link'

export default function MyPage() {
  return (
    <div className="flex flex-col gap-6 px-4 py-5">
      {/* 프로필 섹션 */}
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <User size={28} className="text-muted-foreground" strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">로그인이 필요해요</p>
          <Link
            href="/login"
            className="mt-1 inline-block text-sm font-semibold text-indigo-600 underline-offset-2 hover:underline"
          >
            로그인 / 회원가입
          </Link>
        </div>
      </div>

      {/* 메뉴 */}
      <div className="flex flex-col gap-1 rounded-2xl border border-border bg-card">
        {['내 사주 정보', '알림 설정', '고객 지원', '이용약관', '개인정보처리방침'].map(
          (item, i) => (
            <div
              key={item}
              className={`flex items-center justify-between px-4 py-3.5 ${
                i !== 4 ? 'border-b border-border' : ''
              }`}
            >
              <span className="text-sm">{item}</span>
              <span className="text-muted-foreground">›</span>
            </div>
          ),
        )}
      </div>

      <p className="text-center text-xs text-muted-foreground">버전 0.1.0</p>
    </div>
  )
}
