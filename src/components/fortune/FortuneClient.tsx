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
  const percentile = Math.max(5, Math.round((1 - fortune.score.overall / 100) * 100))

  return (
    <div className="flex flex-col gap-4">

      {/* ── 헤더 ── */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-4 text-white">
        <div className="flex items-start gap-3">
          <span className="text-4xl">{zodiacData?.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs opacity-80">{fortune.date} 오늘의 운세</p>
            <p className="text-xl font-bold">{fortune.zodiac}띠</p>
            {fortune.personalized && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold mt-1">
                <Sparkles size={9} /> 사주 맞춤 운세
              </span>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-3xl font-bold leading-none">{fortune.score.overall}</p>
            <p className="text-xs opacity-70 mt-0.5">/ 100점</p>
            <span className="mt-1.5 inline-block rounded-full bg-white/25 px-2 py-0.5 text-[11px] font-semibold">
              상위 {percentile}%
            </span>
          </div>
        </div>
      </div>

      {/* ── 오늘의 핵심 ── */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5">
        <p className="text-[11px] font-bold text-amber-500 mb-1">💡 오늘의 핵심</p>
        <p className="text-[15px] font-bold text-amber-900 leading-snug">"{fortune.todaySummary}"</p>
      </div>

      {/* ── 행동 가이드 ── */}
      <div className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-3">
        <p className="text-sm font-bold">⚡ 오늘 행동 가이드</p>
        {[
          { icon: '📋', label: '중요한 결정', text: fortune.actionGuide.decision },
          { icon: '👥', label: '인간관계', text: fortune.actionGuide.relationship },
          { icon: '💰', label: '금전', text: fortune.actionGuide.money },
        ].map(({ icon, label, text }) => (
          <div key={label} className="flex gap-2.5">
            <span className="text-base shrink-0 mt-0.5">{icon}</span>
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground">{label}</p>
              <p className="text-sm leading-relaxed mt-0.5">{text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── 시간대별 운세 ── */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-bold">⏰ 시간대별 운세</p>
        {[
          { icon: '🌅', label: '오전  06 ~ 12시', text: fortune.timeFortune.morning },
          { icon: '🌤', label: '오후  12 ~ 18시', text: fortune.timeFortune.afternoon },
          { icon: '🌙', label: '저녁  18 ~ 24시', text: fortune.timeFortune.evening },
        ].map(({ icon, label, text }) => (
          <div key={label} className="flex gap-3 rounded-xl border border-border bg-card p-3">
            <span className="text-xl shrink-0">{icon}</span>
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground">{label}</p>
              <p className="text-sm leading-relaxed mt-0.5">{text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── 세부 운세 ── */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-bold">📊 세부 운세</p>
        {SCORE_LABELS.map(({ key, label, emoji }) => (
          <div key={key} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-base">{emoji}</span>
              <span className="text-sm font-semibold">{label}</span>
            </div>
            <ScoreBar score={fortune.score[key]} />
            <p className="text-sm leading-relaxed text-muted-foreground mt-3">
              {fortune[key as keyof Pick<DailyFortune, 'overall' | 'love' | 'money' | 'health'>]}
            </p>
          </div>
        ))}
      </div>

      {/* ── 행운 정보 ── */}
      <div className="flex gap-3">
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-border bg-card p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">색</div>
          <div>
            <p className="text-[10px] text-muted-foreground">행운의 색</p>
            <p className="text-sm font-semibold">{fortune.luckyColor}</p>
          </div>
        </div>
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-border bg-card p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">
            {fortune.luckyNumber}
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">행운의 번호</p>
            <p className="text-sm font-semibold">{fortune.luckyNumber}</p>
          </div>
        </div>
      </div>

      {/* ── 로또 ── */}
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

  // 생년월일 선택 상태 (월·일은 선택 사항)
  const [birthYear, setBirthYear] = useState<number | null>(null)
  const [birthMonth, setBirthMonth] = useState<number | null>(null)
  const [birthDay, setBirthDay] = useState<number | null>(null)

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
    setBirthYear(years[0])
    setBirthMonth(null)
    setBirthDay(null)
    setStatus('birthdate')
  }

  async function fetchByBirthdate() {
    if (!birthYear) return
    const zodiac = getZodiacByYear(birthYear)
    const monthLabel = birthMonth ? `${birthMonth}월` : ''
    const dayLabel = birthDay ? ` ${birthDay}일` : ''
    setLoadingLabel(`${zodiac}띠 (${birthYear}년생${monthLabel}${dayLabel} 맞춤)`)
    setStatus('loading')
    setFortune(null)
    setErrorMsg('')
    try {
      const params = new URLSearchParams({ year: String(birthYear) })
      if (birthMonth) params.set('month', String(birthMonth))
      if (birthDay) params.set('day', String(birthDay))
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
        {/* 헤더 */}
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

        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-3 text-[12px] leading-relaxed text-amber-800">
          ✨ 정확한 생년월일일수록 나에게 딱 맞는 운세를 볼 수 있어요. 월·일은 생략해도 괜찮아요.
        </div>

        {/* 출생 연도 — 한 눈에 다 보이는 wrap 칩 */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">출생 연도 <span className="text-amber-500">*</span></p>
          <div className="flex flex-wrap gap-2">
            {years.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setBirthYear(y)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  birthYear === y
                    ? 'border-amber-400 bg-amber-400 text-white'
                    : 'border-border bg-card text-foreground hover:border-amber-200 hover:bg-amber-50'
                }`}
              >
                {y}년
              </button>
            ))}
          </div>
        </div>

        {/* 월·일 — select 드롭다운 (선택 사항) */}
        <div className="flex gap-3">
          {/* 월 */}
          <div className="relative flex-1">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">월 (선택 사항)</label>
            <div className="relative">
              <select
                value={birthMonth ?? ''}
                onChange={(e) => setBirthMonth(e.target.value ? Number(e.target.value) : null)}
                className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 ring-offset-background"
              >
                <option value="">선택 안함</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>{m}월</option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
          {/* 일 */}
          <div className="relative flex-1">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">일 (선택 사항)</label>
            <div className="relative">
              <select
                value={birthDay ?? ''}
                onChange={(e) => setBirthDay(e.target.value ? Number(e.target.value) : null)}
                className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 ring-offset-background"
              >
                <option value="">선택 안함</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>{d}일</option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled={!birthYear}
          onClick={fetchByBirthdate}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-40"
        >
          <Sparkles size={15} />
          나만의 오늘 운세 보기
        </button>

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
