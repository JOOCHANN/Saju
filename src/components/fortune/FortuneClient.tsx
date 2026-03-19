'use client'

import { useState } from 'react'
import { ArrowLeft, ChevronDown, Loader2, RefreshCw, Sparkles } from 'lucide-react'
import { ZODIACS, getRecentYears, getZodiacByYear } from '@/lib/fortune/zodiac'
import type { ZodiacData } from '@/lib/fortune/zodiac'
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
  const color =
    score >= 80 ? 'bg-green-500' :
    score >= 60 ? 'bg-amber-400' :
    score >= 40 ? 'bg-orange-400' : 'bg-red-400'
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-bold text-foreground w-8 text-right">{score}점</span>
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
          <p className="text-xs opacity-80">/ 100점</p>
        </div>
      </div>

      {/* 점수 요약 */}
      <div className="grid grid-cols-2 gap-2">
        {SCORE_LABELS.map(({ key, label, emoji }) => (
          <div key={key} className="flex flex-col gap-1.5 rounded-xl border border-border bg-card p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-sm">{emoji}</span>
              <span className="text-xs font-medium">{label}</span>
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

      {/* 로또 번호 — 접이식 */}
      {fortune.lottoSets && <LottoSection sets={fortune.lottoSets} />}
    </div>
  )
}

function LottoBall({ n }: { n: number }) {
  const style =
    n <= 10 ? 'bg-gradient-to-b from-yellow-300 to-yellow-500 text-white shadow-yellow-200' :
    n <= 20 ? 'bg-gradient-to-b from-blue-400 to-blue-600 text-white shadow-blue-200' :
    n <= 30 ? 'bg-gradient-to-b from-red-400 to-red-600 text-white shadow-red-200' :
    n <= 40 ? 'bg-gradient-to-b from-gray-400 to-gray-600 text-white shadow-gray-200' :
              'bg-gradient-to-b from-green-400 to-green-600 text-white shadow-green-200'
  return (
    <span className={`flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-bold shadow-md ${style}`}>
      {n}
    </span>
  )
}

function LottoSection({ sets }: { sets: number[][] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-4 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">🎱</span>
          <div>
            <p className="text-sm font-bold text-amber-800">오늘의 행운 로또 번호를 보시겠습니까?</p>
            <p className="text-[11px] text-amber-600">오늘 날짜 기준 5세트 추천</p>
          </div>
        </div>
        <ChevronDown size={18} className={`shrink-0 text-amber-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-amber-100 px-4 pb-5 pt-4">
          <div className="space-y-3">
            {sets.map((set, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-10 shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-center text-[11px] font-bold text-amber-700">
                  {i + 1}번
                </span>
                <div className="flex gap-1.5">
                  {set.map((n) => <LottoBall key={n} n={n} />)}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-[11px] text-amber-500">재미로 보는 번호예요 😄 당첨을 보장하지 않아요</p>
        </div>
      )}
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// 유틸
// ────────────────────────────────────────────────────────────────────────────

/** 해당 띠의 모든 출생 연도 (최신순) */
function getAllYearsForZodiac(zodiac: ZodiacData): number[] {
  const years: number[] = []
  const max = new Date().getFullYear()
  let y = zodiac.baseYear
  while (y <= max) {
    years.push(y)
    y += 12
  }
  return years.reverse()
}

// ────────────────────────────────────────────────────────────────────────────
// 메인 컴포넌트
// ────────────────────────────────────────────────────────────────────────────

type Status = 'select' | 'birthdate' | 'loading' | 'done' | 'error'

export default function FortuneClient() {
  const [status, setStatus] = useState<Status>('select')
  const [selectedZodiac, setSelectedZodiac] = useState<ZodiacData | null>(null)
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

  function handleZodiacClick(z: ZodiacData) {
    setSelectedZodiac(z)
    const years = getAllYearsForZodiac(z)
    setBirthYear(String(years[0]))
    setBirthMonth('1')
    setBirthDay('1')
    setStatus('birthdate')
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

  // ── 생년월일 입력 ─────────────────────────────────────────────────────────
  if (status === 'birthdate' && selectedZodiac) {
    const years = getAllYearsForZodiac(selectedZodiac)
    return (
      <div className="flex flex-col gap-5 px-4 py-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setStatus('select')}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-muted/50"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-bold">오늘의 운세보기</h1>
            <p className="text-sm text-muted-foreground">
              <span className="mr-1">{selectedZodiac.emoji}</span>
              {selectedZodiac.name}띠 선택됨
            </p>
          </div>
        </div>

        <form onSubmit={fetchByBirthdate} className="flex flex-col gap-4">
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-3 text-[12px] leading-relaxed text-amber-800">
            ✨ 생년월일을 선택하면 사주 기반으로 더 개인화된 오늘의 운세를 알려드려요.
          </div>

          {/* 출생 연도 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">출생 연도</label>
            <div className="relative">
              <select
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                required
                className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 ring-offset-background"
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}년생</option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          {/* 월·일 */}
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
      </div>
    )
  }

  // ── 띠 선택 화면 ──────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5 px-4 py-5">
      <div>
        <h1 className="text-xl font-bold">오늘의 운세보기</h1>
        <p className="mt-1 text-sm text-muted-foreground">띠를 선택해주세요</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {ZODIACS.map((z) => {
          const years = getRecentYears(z)
          return (
            <button
              key={z.name}
              onClick={() => handleZodiacClick(z)}
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
