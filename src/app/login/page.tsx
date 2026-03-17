import { signIn } from '@/auth'
import { Moon } from 'lucide-react'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  // 이미 로그인된 경우 홈으로 이동
  const session = await auth()
  if (session) redirect('/')

  const { callbackUrl } = await searchParams
  const callback = callbackUrl ?? '/'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      {/* 로고 */}
      <div className="mb-10 flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100">
          <Moon size={32} className="text-indigo-600" strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">사주</h1>
          <p className="mt-1 text-sm text-muted-foreground">AI 사주 분석 서비스</p>
        </div>
      </div>

      {/* 소셜 로그인 버튼 */}
      <div className="w-full max-w-sm space-y-3">
        {/* 카카오 (한국에서 가장 많이 사용) */}
        <form
          action={async () => {
            'use server'
            await signIn('kakao', { redirectTo: callback })
          }}
        >
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#FEE500] py-3.5 text-sm font-semibold text-[#191919] transition-opacity hover:opacity-90 active:opacity-80"
          >
            <KakaoIcon />
            카카오로 계속하기
          </button>
        </form>

        {/* 구글 */}
        <form
          action={async () => {
            'use server'
            await signIn('google', { redirectTo: callback })
          }}
        >
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-white py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50 active:bg-muted"
          >
            <GoogleIcon />
            Google로 계속하기
          </button>
        </form>

        {/* 이메일 구분선 */}
        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">또는 이메일로</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* 이메일 매직링크 */}
        <EmailLoginForm callbackUrl={callback} />
      </div>

      {/* 약관 */}
      <p className="mt-8 max-w-sm text-center text-xs text-muted-foreground">
        계속 진행하면{' '}
        <a href="/terms" className="underline underline-offset-2">
          이용약관
        </a>
        {' 및 '}
        <a href="/privacy" className="underline underline-offset-2">
          개인정보처리방침
        </a>
        에 동의하는 것으로 간주합니다.
      </p>
    </div>
  )
}

// ─────────────────────────────────────
// 이메일 폼 (Client Component)
// ─────────────────────────────────────

import EmailLoginForm from '@/components/auth/EmailLoginForm'

// ─────────────────────────────────────
// SVG 아이콘
// ─────────────────────────────────────

function KakaoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 3C6.477 3 2 6.477 2 10.8c0 2.748 1.668 5.157 4.188 6.626l-.948 3.512a.3.3 0 0 0 .458.322L10.06 18.8c.63.09 1.278.136 1.94.136 5.523 0 10-3.477 10-7.136C22 7.477 17.523 3 12 3z"
        fill="#191919"
      />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}
