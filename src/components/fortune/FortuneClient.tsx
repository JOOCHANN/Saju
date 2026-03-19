'use client'

import { useState } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import { ZODIACS, getRecentYears } from '@/lib/fortune/zodiac'
import type { DailyFortune } from '@/app/api/fortune/daily/route'

// ────────────────────────────────────────────────────────────────────────────
// 상수
// ────────────────────────────────────────────────────────────────────────────

const SCORE_LABELS: Array<{ key: keyof DailyFortune['score']; label: string; emoji: string }> = [
  { key: 'overall', label: '전체운', emoji: '⭐' },
  { key: 'love', label: '사랑운', emoji: '❤️' },
  { key: 'money', label: '재물운', emoji: '💰' },
  { key: 'health', label: '건강운', emoji: '💪' },
]

// ────────────────────────────────────────────────────────────────────────────
// 서브 컴포넌트
// ────────────────────────────────────────────────────────────────────────────

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className={`h-2 w-5 rounded-full transition-all ${
            i < score ? 'bg-amber-400' : 'bg-muted'
          }`}
        />
      ))}
    </div>
  )
}

function FortuneCard({ fortune }: { fortune: DailyFortune }) {
  const zodiacData = ZODIACS.find((z) => z.name === fortune.zodiac)

  return (
    <div className="flex flex-col gap-4">
      {/* 헤더 */}
      <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-4 text-white">
        <span className="text-4xl">{zodiacData?.emoji}</span>
        <div>
          <p className="text-xs font-medium opacity-80">{fortune.date} 오늘의 운세</p>
          <p className="text-xl font-bold">{fortune.zodiac}띠</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-2xl font-bold">{fortune.score.overall}</p>
          <p className="text-xs opacity-80">/ 5점</p>
        </div>
      </div>

      {/* 점수 요약 */}
      <div className="grid grid-cols-2 gap-2">
        {SCORE_LABELS.map(({ key, label, emoji }) => (
          <div
            key={key}
            className="flex flex-col gap-1.5 rounded-xl border border-border bg-card p-3"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{emoji}</span>
              <span className="text-xs font-medium">{label}</span>
              <span className="ml-auto text-xs font-semibold text-amber-500">
                {fortune.score[key]}점
              </span>
            </div>
            <ScoreBar score={fortune.score[key]} />
          </div>
        ))}
      </div>

      {/* 운세 내용 */}
      {[
        { key: 'overall', label: '전체운', emoji: '⭐' },
        { key: 'love', label: '사랑운', emoji: '❤️' },
        { key: 'money', label: '재물운', emoji: '💰' },
        { key: 'health', label: '건강운', emoji: '💪' },
      ].map(({ key, label, emoji }) => (
        <div key={key} className="rounded-xl border border-border bg-card p-4">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
            <span>{emoji}</span>
            {label}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {fortune[key as keyof Pick<DailyFortune, 'overall' | 'love' | 'money' | 'health'>]}
          </p>
        </div>
      ))}

      {/* 행운 정보 */}
      <div className="flex gap-3">
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-border bg-card p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
            색
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">행운의 색</p>
            <p className="text-sm font-semibold">{fortune.luckyColor}</p>
          </div>
        </div>
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-border bg-card p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">
            {fortune.luckyNumber}
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">행운의 번호</p>
            <p className="text-sm font-semibold">{fortune.luckyNumber}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// 메인 컴포넌트
// ────────────────────────────────────────────────────────────────────────────

type Status = 'select' | 'loading' | 'done' | 'error'

export default function FortuneClient() {
  const [selectedZodiac, setSelectedZodiac] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>('select')
  const [fortune, setFortune] = useState<DailyFortune | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  async function fetchFortune(zodiac: string) {
    setSelectedZodiac(zodiac)
    setStatus('loading')
    setFortune(null)
    setErrorMsg('')

    try {
      const res = await fetch(`/api/fortune/daily?zodiac=${encodeURIComponent(zodiac)}`)
      const json = (await res.json()) as { data?: DailyFortune; error?: string }

      if (!res.ok || !json.data) {
        const ERROR_MESSAGES: Record<string, string> = {
          AI_KEY_MISSING: 'AI 서비스가 아직 설정되지 않았어요.',
          AI_AUTH_ERROR: 'AI 인증에 실패했어요. 관리자에게 문의하세요.',
          AI_RATE_LIMIT: '요청이 너무 많아요. 잠시 후 다시 시도해주세요.',
          AI_OVERLOADED: 'AI 서비스가 일시적으로 과부하 상태예요. 잠시 후 다시 시도해주세요.',
          AI_PARSE_ERROR: '운세 데이터를 처리하는 중 오류가 발생했어요.',
          INVALID_ZODIAC: '올바른 띠를 선택해주세요.',
          AI_ERROR: '운세 생성 중 오류가 발생했어요. 다시 시도해주세요.',
        }
        const code = json.error ?? 'AI_ERROR'
        throw new Error(ERROR_MESSAGES[code] ?? '운세를 불러오지 못했어요. 다시 시도해주세요.')
      }

      setFortune(json.data)
      setStatus('done')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '오류가 발생했어요.')
      setStatus('error')
    }
  }

  // ── 띠 선택 화면 ─────────────────────────────────────────────────────────
  if (status === 'select') {
    return (
      <div className="flex flex-col gap-5 px-4 py-5">
        <div>
          <h1 className="text-xl font-bold">오늘의 운세</h1>
          <p className="mt-1 text-sm text-muted-foreground">내 띠를 선택해서 오늘의 운세를 확인하세요</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {ZODIACS.map((z) => {
            const years = getRecentYears(z)
            return (
              <button
                key={z.name}
                onClick={() => fetchFortune(z.name)}
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card px-2 py-4 transition-colors hover:border-amber-300 hover:bg-amber-50 active:scale-95"
              >
                <span className="text-3xl">{z.emoji}</span>
                <span className="text-sm font-semibold">{z.name}띠</span>
                <span className="text-[10px] text-muted-foreground">
                  {years.join(', ')}년생
                </span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // ── 로딩 ─────────────────────────────────────────────────────────────────
  if (status === 'loading') {
    const zodiacData = ZODIACS.find((z) => z.name === selectedZodiac)
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-24">
        <span className="text-5xl">{zodiacData?.emoji}</span>
        <Loader2 size={24} className="animate-spin text-amber-500" />
        <p className="text-sm text-muted-foreground">{selectedZodiac}띠 오늘의 운세를 불러오는 중...</p>
      </div>
    )
  }

  // ── 에러 ─────────────────────────────────────────────────────────────────
  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-24 text-center">
        <p className="text-sm text-destructive">{errorMsg}</p>
        <button
          onClick={() => setStatus('select')}
          className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm"
        >
          <RefreshCw size={14} />
          다시 시도
        </button>
      </div>
    )
  }

  // ── 결과 ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 px-4 py-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">오늘의 운세</h1>
        <button
          onClick={() => setStatus('select')}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50"
        >
          <RefreshCw size={12} />
          띠 변경
        </button>
      </div>

      {fortune && <FortuneCard fortune={fortune} />}
    </div>
  )
}
