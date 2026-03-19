'use client'

import { useState } from 'react'
import { ChevronDown, Loader2, RefreshCw, Flame } from 'lucide-react'
import type { AdultFortune } from '@/app/api/fortune/adult/route'

// ────────────────────────────────────────────────────────────────────────────
// 상수
// ────────────────────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear()
const MAX_BIRTH_YEAR = CURRENT_YEAR - 18 // 성인만 이용 가능
const MIN_BIRTH_YEAR = 1930

const YEARS = Array.from(
  { length: MAX_BIRTH_YEAR - MIN_BIRTH_YEAR + 1 },
  (_, i) => MAX_BIRTH_YEAR - i,
)

// ────────────────────────────────────────────────────────────────────────────
// 서브 컴포넌트
// ────────────────────────────────────────────────────────────────────────────

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 80 ? 'bg-rose-500' :
    score >= 60 ? 'bg-pink-400' :
    score >= 40 ? 'bg-orange-400' : 'bg-gray-400'
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-bold text-foreground w-12 text-right">{score}점</span>
    </div>
  )
}

function AdultFortuneCard({ fortune }: { fortune: AdultFortune }) {
  const percentile = Math.max(5, Math.round((1 - fortune.score / 100) * 100))

  return (
    <div className="flex flex-col gap-4">

      {/* ── 헤더 ── */}
      <div className="rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 p-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs opacity-80">{fortune.date} 관계 운세</p>
            <p className="text-xl font-bold mt-0.5">오늘의 관계 에너지</p>
            {fortune.personalized && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold mt-1.5">
                <Flame size={9} /> 사주 맞춤 분석
              </span>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-3xl font-bold leading-none">{fortune.score}</p>
            <p className="text-xs opacity-70 mt-0.5">/ 100점</p>
            <span className="mt-1.5 inline-block rounded-full bg-white/25 px-2 py-0.5 text-[11px] font-semibold">
              상위 {percentile}%
            </span>
          </div>
        </div>
        <div className="mt-3 border-t border-white/20 pt-3">
          <ScoreBar score={fortune.score} />
        </div>
      </div>

      {/* ── 오늘의 관계 에너지 한 줄 ── */}
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5">
        <p className="text-[11px] font-bold text-rose-500 mb-1">🔥 오늘의 관계 에너지</p>
        <p className="text-[15px] font-bold text-rose-900 leading-snug">"{fortune.energySummary}"</p>
      </div>

      {/* ── 매력 & 끌림 분석 ── */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-sm font-bold mb-2.5">💋 매력 &amp; 끌림 분석</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{fortune.attractiveness}</p>
      </div>

      {/* ── 관계 심리 흐름 ── */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-sm font-bold mb-2.5">🧠 관계 심리 흐름</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{fortune.psychFlow}</p>
      </div>

      {/* ── 행동 가이드 ── */}
      <div className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-3">
        <p className="text-sm font-bold">🎯 행동 가이드</p>
        {[
          { icon: '📱', label: '연락 타이밍', text: fortune.actionGuide.contact },
          { icon: '📍', label: '만남 타이밍', text: fortune.actionGuide.timing },
          { icon: '🚫', label: '피해야 할 것', text: fortune.actionGuide.avoid },
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

      {/* ── 시간대별 관계 흐름 ── */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-bold">⏰ 시간대별 관계 흐름</p>
        {[
          { icon: '🌅', label: '오전  06 ~ 12시', text: fortune.timeFlow.morning },
          { icon: '🌤', label: '오후  12 ~ 18시', text: fortune.timeFlow.afternoon },
          { icon: '🌙', label: '저녁  18 ~ 24시', text: fortune.timeFlow.night },
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

      {/* ── 주의 포인트 ── */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-bold text-amber-700 mb-2">⚠️ 주의 포인트</p>
        <p className="text-sm leading-relaxed text-amber-800">{fortune.warning}</p>
      </div>

    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// 메인 컴포넌트
// ────────────────────────────────────────────────────────────────────────────

type Status = 'form' | 'loading' | 'done' | 'error'
type Gender = 'male' | 'female'
type RelStatus = 'single' | 'crush' | 'dating'

const ERROR_MESSAGES: Record<string, string> = {
  AI_KEY_MISSING: 'AI 서비스가 아직 설정되지 않았어요.',
  AI_AUTH_ERROR: 'AI 인증에 실패했어요. 관리자에게 문의하세요.',
  AI_RATE_LIMIT: '요청이 너무 많아요. 잠시 후 다시 시도해주세요.',
  AI_PARSE_ERROR: '운세 데이터를 처리하는 중 오류가 발생했어요.',
  INVALID_INPUT: '입력 정보를 확인해주세요.',
  AI_ERROR: '운세 생성 중 오류가 발생했어요. 다시 시도해주세요.',
}

export default function AdultFortuneClient() {
  const [pageStatus, setPageStatus] = useState<Status>('form')
  const [fortune, setFortune] = useState<AdultFortune | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  // 입력값
  const [birthYear, setBirthYear] = useState<number | null>(null)
  const [birthMonth, setBirthMonth] = useState<number | null>(null)
  const [birthDay, setBirthDay] = useState<number | null>(null)
  const [gender, setGender] = useState<Gender | null>(null)
  const [relStatus, setRelStatus] = useState<RelStatus | null>(null)

  const canSubmit = birthYear !== null && gender !== null && relStatus !== null

  async function handleSubmit() {
    if (!canSubmit) return
    setPageStatus('loading')
    setFortune(null)
    setErrorMsg('')
    try {
      const params = new URLSearchParams({
        year: String(birthYear),
        gender: gender!,
        status: relStatus!,
      })
      if (birthMonth) params.set('month', String(birthMonth))
      if (birthDay) params.set('day', String(birthDay))
      const res = await fetch(`/api/fortune/adult?${params}`)
      const json = (await res.json()) as { data?: AdultFortune; error?: string }
      if (!res.ok || !json.data) throw new Error(ERROR_MESSAGES[json.error ?? 'AI_ERROR'] ?? '오류가 발생했어요.')
      setFortune(json.data)
      setPageStatus('done')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '오류가 발생했어요.')
      setPageStatus('error')
    }
  }

  // ── 로딩 ─────────────────────────────────────────────────────────────────
  if (pageStatus === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-24">
        <Loader2 size={28} className="animate-spin text-rose-500" />
        <p className="text-sm text-muted-foreground">관계 운세를 분석하는 중...</p>
      </div>
    )
  }

  // ── 에러 ─────────────────────────────────────────────────────────────────
  if (pageStatus === 'error') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-24 text-center">
        <p className="text-sm text-destructive">{errorMsg}</p>
        <button
          onClick={() => setPageStatus('form')}
          className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm"
        >
          <RefreshCw size={14} />
          다시 시도
        </button>
      </div>
    )
  }

  // ── 결과 ─────────────────────────────────────────────────────────────────
  if (pageStatus === 'done' && fortune) {
    return (
      <div className="flex flex-col gap-4 px-4 py-5">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">19금 사주</h1>
          <button
            onClick={() => setPageStatus('form')}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50"
          >
            <RefreshCw size={12} />
            다시 보기
          </button>
        </div>
        <AdultFortuneCard fortune={fortune} />
      </div>
    )
  }

  // ── 입력 폼 ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5 px-4 py-5">
      {/* 헤더 */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Flame size={20} className="text-rose-500" />
          <h1 className="text-xl font-bold">19금 사주</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          오늘 나의 관계·매력·끌림 에너지를 분석해드려요
        </p>
      </div>

      <div className="rounded-2xl border border-rose-100 bg-rose-50 p-3 text-[12px] leading-relaxed text-rose-800">
        🔞 만 18세 이상만 이용 가능 · 관계 심리·감정 흐름 중심의 성인 운세입니다
      </div>

      {/* 출생 연도 */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold">
          출생 연도 <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <select
            value={birthYear ?? ''}
            onChange={(e) => setBirthYear(e.target.value ? Number(e.target.value) : null)}
            className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 ring-offset-background"
          >
            <option value="">연도 선택</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}년생</option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      {/* 월·일 */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">월 (선택 사항)</label>
          <div className="relative">
            <select
              value={birthMonth ?? ''}
              onChange={(e) => setBirthMonth(e.target.value ? Number(e.target.value) : null)}
              className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 ring-offset-background"
            >
              <option value="">선택 안함</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>{m}월</option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
        <div className="relative flex-1">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">일 (선택 사항)</label>
          <div className="relative">
            <select
              value={birthDay ?? ''}
              onChange={(e) => setBirthDay(e.target.value ? Number(e.target.value) : null)}
              className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 ring-offset-background"
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

      {/* 성별 */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold">
          성별 <span className="text-rose-500">*</span>
        </label>
        <div className="flex gap-2">
          {([['male', '남성', '👨'], ['female', '여성', '👩']] as [Gender, string, string][]).map(([val, label, emoji]) => (
            <button
              key={val}
              type="button"
              onClick={() => setGender(val)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-colors ${
                gender === val
                  ? 'border-rose-400 bg-rose-400 text-white'
                  : 'border-border bg-card text-foreground hover:border-rose-200 hover:bg-rose-50'
              }`}
            >
              <span>{emoji}</span>{label}
            </button>
          ))}
        </div>
      </div>

      {/* 현재 상태 */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold">
          현재 상태 <span className="text-rose-500">*</span>
        </label>
        <div className="flex gap-2">
          {([['single', '솔로 💔'], ['crush', '썸 💘'], ['dating', '연애 중 ❤️']] as [RelStatus, string][]).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setRelStatus(val)}
              className={`flex flex-1 items-center justify-center rounded-xl border py-3 text-sm font-medium transition-colors ${
                relStatus === val
                  ? 'border-rose-400 bg-rose-400 text-white'
                  : 'border-border bg-card text-foreground hover:border-rose-200 hover:bg-rose-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 제출 버튼 */}
      <button
        type="button"
        disabled={!canSubmit}
        onClick={handleSubmit}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-40"
      >
        <Flame size={15} />
        오늘의 관계 운세 보기
      </button>

    </div>
  )
}
