'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { Loader2, Mail } from 'lucide-react'

export default function EmailLoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || status === 'loading') return

    setStatus('loading')
    const res = await signIn('resend', {
      email,
      redirect: false,
      callbackUrl,
    })

    if (res?.error) {
      setStatus('error')
    } else {
      setStatus('sent')
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-xl border border-border bg-muted/50 p-4 text-center">
        <Mail size={24} className="mx-auto mb-2 text-indigo-500" />
        <p className="text-sm font-semibold">이메일을 확인해주세요</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {email} 로 로그인 링크를 보냈습니다
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="이메일 주소 입력"
        required
        className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      />
      {status === 'error' && (
        <p className="text-xs text-destructive">이메일 전송에 실패했습니다. 다시 시도해주세요.</p>
      )}
      <button
        type="submit"
        disabled={!email || status === 'loading'}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3.5 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {status === 'loading' ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Mail size={16} />
        )}
        이메일로 로그인
      </button>
    </form>
  )
}
