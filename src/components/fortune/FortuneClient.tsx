'use client'

import { useState } from 'react'
import { ChevronDown, Loader2, RefreshCw, Sparkles } from 'lucide-react'
import { ZODIACS, getRecentYears, getZodiacByYear } from '@/lib/fortune/zodiac'
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
          {fortune.personalized && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold mt-1">
              <Sparkles size={9} /> 사주 맞춤 운세
            </span>
          )}
        </div>
        <div className="ml-auto text-right">
          <p className="text-2xl font-bold">{fortune.score.overall}</p>
          <p className="text-xs opacity-80">/ 5점</p>
        </div>
      </div>

      {/* 점수 요약 */}
      <div className="grid grid-cols-2 gap-2">
        {SCORE_LABELS.map(({ key, label, emoji }) => (
          <div key={key} className="flex flex-col gap-1.5 rounded-xl border border-border bg-card p-3">
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
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">색</div>
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

type Mode = 'zodiac' | 'birthdate'
type Status = 'select' | 'loading' | 'done' | 'error'

export default function FortuneClient() {
  const [mode, setMode] = useState<Mode>('zodiac')
  const [status, setStatus] = useState<Status>('select')
  const [fortune, setFortune] = useState<DailyFortune | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [loadingLabel, setLoadingLabel] = useState('')

  // 생년월일 입력 상태
  const [birthYear, setBirthYear] = useState('')
  const [birthMonth, setBirthMonth] = useState('1')
  const [birthDay, setBirthDay] = useState('1')

  const ERROR_MESSAGES: Record<string, string> = {
    AI_KEY_MISSING: 'AI 서비스가 아직 설정되지 않았어요.',
    AI_AUTH_ERROR: 'AI 인증에 실패했어요. 관리자에게 문의하세요.',
    AI_RATE_LIMIT: '요청이 너무 많아요. 잠시 후 다시 시도해주세요.',
    AI_PARSE_ERROR: '운세 데이터를 처리하는 중 오류가 발생했어요.',
    INVALID_INPUT: '입력 정보를 확인해주세요.',
    AI_ERROR: '운세 생성 중 오류가 발생했어요. 다시 시도해주세요.',
  }

  async function fetchByZodiac(zodiac: string) {
    setLoadingLabel(`${zodiac}띠`)
    setStatus('loading')
    setFortune(null)
    setErrorMsg('')
    try {
      const res = await fetch(`/api/fortune/daily?zodiac=${encodeURIComponent(zodiac)}`)
      const json = (await res.json()) as { data?: DailyFortune; error?: string }
      if (!res.ok || !json.data) throw new Error(ERROR_MESSAGES[json.error ?? 'AI_ERROR'] ?? '오류가 발생했어요.')
      setFortune(json.data)
      setStatus('done')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '오류가 발생했어요.')
      setStatus('error')
    }
  }

  async function fetchByBirthdate(e: React.FormEvent) {
    e.preventDefault()
    const y = parseInt(birthYear)
    if (isNaN(y) || y < 1900 || y > 2020) return
    const zodiac = getZodiacByYear(y)
    setLoadingLabel(`${zodiac}띠 (${y}년생 맞춤)`)
    setStatus('loading')
    setFortune(null)
    setErrorMsg('')
    try {
      const params = new URLSearchParams({ year: String(y), month: birthMonth, day: birthDay })
      const res = await fetch(`/api/fortune/daily?${params}`)
      const json = (await res.json()) as { data?: DailyFortune; error?: string }
      if (!res.ok || !json.data) throw new Error(ERROR_MESSAGES[json.error ?? 'AI_ERROR'] ?? '오류가 발생했어요.')
      setFortune(json.data)
      setStatus('done')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '오류가 발생했어요.')
      setStatus('error')
    }
  }

  // ── 로딩 ─────────────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-24">
        <Loader2 size={28} className="animate-spin text-amber-500" />
        <p className="text-sm text-muted-foreground">{loadingLabel} 운세를 불러오는 중...</p>
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
  if (status === 'done' && fortune) {
    return (
      <div className="flex flex-col gap-4 px-4 py-5">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">오늘의 운세</h1>
          <button
            onClick={() => setStatus('select')}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50"
          >
            <RefreshCw size={12} />
            다시 보기
          </button>
        </div>
        <FortuneCard fortune={fortune} />
      </div>
    )
  }

  // ── 선택 화면 ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5 px-4 py-5">
      <div>
        <h1 className="text-xl font-bold">오늘의 운세</h1>
        <p className="mt-1 text-sm text-muted-foreground">원하는 방식으로 오늘의 운세를 확인하세요</p>
      </div>

      {/* 모드 토글 */}
      <div className="flex rounded-xl border border-border bg-muted/30 p-1 gap-1">
        <button
          type="button"
          onClick={() => setMode('zodiac')}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
            mode === 'zodiac'
              ? 'bg-white shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          🐾 띠로 보기
        </button>
        <button
          type="button"
          onClick={() => setMode('birthdate')}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
            mode === 'birthdate'
              ? 'bg-white shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          ✨ 생년월일로 보기
        </button>
      </div>

      {/* 띠 선택 */}
      {mode === 'zodiac' && (
        <div className="grid grid-cols-3 gap-2">
          {ZODIACS.map((z) => {
            const years = getRecentYears(z)
            return (
              <button
                key={z.name}
                onClick={() => fetchByZodiac(z.name)}
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
      )}

      {/* 생년월일 입력 */}
      {mode === 'birthdate' && (
        <form onSubmit={fetchByBirthdate} className="flex flex-col gap-4">
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-3 text-[12px] leading-relaxed text-amber-800">
            ✨ 생년월일을 입력하면 사주 기반으로 더 개인화된 오늘의 운세를 알려드려요.
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">출생 연도</label>
            <input
              type="number"
              inputMode="numeric"
              placeholder="예) 1990"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              min={1900}
              max={2020}
              required
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 ring-offset-background"
            />
          </div>

          <div className="flex gap-3">
            {[
              { id: 'bmonth', label: '월', value: birthMonth, set: setBirthMonth, count: 12, unit: '월' },
              { id: 'bday',   label: '일', value: birthDay,   set: setBirthDay,   count: 31, unit: '일' },
            ].map(({ id, label, value, set, count, unit }) => (
              <div key={id} className="flex flex-1 flex-col gap-1.5">
                <label className="text-sm font-medium">{label}</label>
                <div className="relative">
                  <select
                    id={id}
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 ring-offset-background"
                  >
                    {Array.from({ length: count }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}{unit}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
          >
            <Sparkles size={15} />
            나만의 오늘 운세 보기
          </button>
        </form>
      )}
    </div>
  )
}
