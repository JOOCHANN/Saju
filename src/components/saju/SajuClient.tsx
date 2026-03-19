'use client'

import { useState } from 'react'
import { BookmarkCheck, ChevronDown, Loader2, LogIn, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import type { SajuResult } from '@/lib/saju'
import { BRANCHES, ELEMENT_NAMES, STEMS } from '@/lib/saju'

// ────────────────────────────────────────────────────────────────────────────
// 상수
// ────────────────────────────────────────────────────────────────────────────

const HOURS = [
  { label: '모름 (시간 미입력)', value: '' },
  { label: '子時 밤 11시 ~ 새벽 1시', value: '23' },
  { label: '丑時 새벽 1시 ~ 3시', value: '1' },
  { label: '寅時 새벽 3시 ~ 5시', value: '3' },
  { label: '卯時 새벽 5시 ~ 7시', value: '5' },
  { label: '辰時 아침 7시 ~ 9시', value: '7' },
  { label: '巳時 오전 9시 ~ 11시', value: '9' },
  { label: '午時 오전 11시 ~ 오후 1시', value: '11' },
  { label: '未時 오후 1시 ~ 3시', value: '13' },
  { label: '申時 오후 3시 ~ 5시', value: '15' },
  { label: '酉時 오후 5시 ~ 7시', value: '17' },
  { label: '戌時 저녁 7시 ~ 9시', value: '19' },
  { label: '亥時 저녁 9시 ~ 11시', value: '21' },
]

const ELEMENT_COLORS: Record<string, string> = {
  목: 'bg-green-500',
  화: 'bg-red-500',
  토: 'bg-amber-500',
  금: 'bg-gray-400',
  수: 'bg-blue-500',
}

const ELEMENT_TEXT_COLORS: Record<string, string> = {
  목: 'text-green-700',
  화: 'text-red-700',
  토: 'text-amber-700',
  금: 'text-gray-600',
  수: 'text-blue-700',
}

const ELEMENT_BG_LIGHT: Record<string, string> = {
  목: 'bg-green-100',
  화: 'bg-red-100',
  토: 'bg-amber-100',
  금: 'bg-gray-100',
  수: 'bg-blue-100',
}

type Status = 'idle' | 'loading' | 'done' | 'error'

// ────────────────────────────────────────────────────────────────────────────
// 서브 컴포넌트: 사주 기둥 카드
// ────────────────────────────────────────────────────────────────────────────

function PillarCard({
  label,
  pillar,
}: {
  label: string
  pillar: SajuResult['fourPillars']['year']
}) {
  const elem = pillar.stemElement
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card px-2 py-3">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span
        className={`text-2xl font-bold ${ELEMENT_TEXT_COLORS[elem] ?? 'text-foreground'}`}
      >
        {pillar.stem}
      </span>
      <span className="text-xl font-semibold text-foreground">{pillar.branch}</span>
      <span
        className={`mt-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${ELEMENT_BG_LIGHT[elem]} ${ELEMENT_TEXT_COLORS[elem]}`}
      >
        {elem}
      </span>
      <span className="text-[10px] text-muted-foreground">
        {pillar.stemKorean}
        {pillar.branchKorean}
      </span>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// 서브 컴포넌트: 오행 분포
// ────────────────────────────────────────────────────────────────────────────

function ElementBalance({ balance }: { balance: SajuResult['elementBalance'] }) {
  const total = Object.values(balance).reduce((a, b) => a + b, 0)
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="mb-3 text-xs font-semibold text-muted-foreground">오행 분포</p>
      <div className="flex flex-col gap-2">
        {ELEMENT_NAMES.map((elem) => {
          const count = balance[elem]
          const pct = total > 0 ? (count / total) * 100 : 0
          return (
            <div key={elem} className="flex items-center gap-2">
              <span className="w-4 text-center text-xs font-medium">{elem}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${ELEMENT_COLORS[elem]}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-4 text-right text-xs text-muted-foreground">{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// 서브 컴포넌트: 십신
// ────────────────────────────────────────────────────────────────────────────

function TenGodsSection({ tenGods, fourPillars }: {
  tenGods: SajuResult['tenGods']
  fourPillars: SajuResult['fourPillars']
}) {
  const items = [
    { label: '年柱', god: tenGods.year, pillar: fourPillars.year },
    { label: '月柱', god: tenGods.month, pillar: fourPillars.month },
    { label: '時柱', god: tenGods.hour, pillar: fourPillars.hour },
  ].filter((item) => item.god !== null && item.pillar !== null)

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="mb-3 text-xs font-semibold text-muted-foreground">십신 (十神)</p>
      <div className="flex gap-3">
        {items.map(({ label, god, pillar }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-muted-foreground">{label}</span>
            <span className="text-sm font-semibold text-foreground">
              {pillar!.stem}{pillar!.branch}
            </span>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
              {god}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// 서브 컴포넌트: 십이운성
// ────────────────────────────────────────────────────────────────────────────

function SipIunSeongSection({ sipIunSeong, fourPillars }: {
  sipIunSeong: SajuResult['sipIunSeong']
  fourPillars: SajuResult['fourPillars']
}) {
  const items = [
    { label: '年柱', stage: sipIunSeong.year, pillar: fourPillars.year },
    { label: '月柱', stage: sipIunSeong.month, pillar: fourPillars.month },
    { label: '日柱', stage: sipIunSeong.day, pillar: fourPillars.day },
    { label: '時柱', stage: sipIunSeong.hour, pillar: fourPillars.hour },
  ].filter((item) => item.stage !== null)

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="mb-3 text-xs font-semibold text-muted-foreground">십이운성 (十二運星)</p>
      <div className="grid grid-cols-4 gap-2">
        {items.map(({ label, stage, pillar }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-muted-foreground">{label}</span>
            <span className="text-xs text-foreground">
              {pillar!.stem}{pillar!.branch}
            </span>
            <span className="text-[10px] font-medium text-amber-700">{stage}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// 서브 컴포넌트: 공망 & 대운
// ────────────────────────────────────────────────────────────────────────────

function GongMangBadge({ gongMang }: { gongMang: SajuResult['gongMang'] }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
      <span className="text-xs text-muted-foreground">공망 (空亡)</span>
      <div className="flex gap-1.5">
        {gongMang.map((b, i) => (
          <span
            key={i}
            className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600"
          >
            {BRANCHES[b].char} {BRANCHES[b].korean}
          </span>
        ))}
      </div>
    </div>
  )
}

function DaewoonSection({ daewoon }: { daewoon: SajuResult['daewoon'] }) {
  const items = daewoon.slice(0, 6)
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="mb-3 text-xs font-semibold text-muted-foreground">대운 (大運)</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {items.map((dw, i) => (
          <div
            key={i}
            className="flex min-w-[52px] flex-col items-center gap-1 rounded-lg bg-muted/50 px-2 py-2"
          >
            <span className="text-[10px] text-muted-foreground">{dw.startAge}세~</span>
            <span className="text-base font-bold text-foreground">
              {STEMS[dw.stemIndex].char}
            </span>
            <span className="text-sm font-semibold text-foreground">
              {BRANCHES[dw.branchIndex].char}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {STEMS[dw.stemIndex].korean}{BRANCHES[dw.branchIndex].korean}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// 메인 컴포넌트
// ────────────────────────────────────────────────────────────────────────────

export default function SajuClient({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('1')
  const [day, setDay] = useState('1')
  const [hourValue, setHourValue] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')

  const [status, setStatus] = useState<Status>('idle')
  const [sajuResult, setSajuResult] = useState<SajuResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const y = parseInt(year)
    const m = parseInt(month)
    const d = parseInt(day)
    const hour = hourValue !== '' ? parseInt(hourValue) : undefined

    if (isNaN(y) || y < 1900 || y > 2020) return

    setErrorMsg('')
    setSajuResult(null)
    setStatus('loading')

    try {
      const res = await fetch('/api/saju/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: y, month: m, day: d, hour, gender }),
      })

      if (!res.ok) {
        throw new Error(`서버 오류 (${res.status})`)
      }

      const json = await res.json() as { data: SajuResult }
      setSajuResult(json.data)
      setStatus('done')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '분석 중 오류가 발생했어요.')
      setStatus('error')
    }
  }

  function handleReset() {
    setSajuResult(null)
    setErrorMsg('')
    setStatus('idle')
    setIsSaved(false)
  }

  async function handleSave() {
    if (!sajuResult || isSaving || isSaved) return
    setIsSaving(true)
    try {
      const res = await fetch('/api/readings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sajuResult }),
      })
      if (res.ok) setIsSaved(true)
    } finally {
      setIsSaving(false)
    }
  }

  // ── 입력 폼 ──────────────────────────────────────────────────────────────
  if (status === 'idle') {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-4 py-5">
        <div>
          <h1 className="text-xl font-bold">사주 분석</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            생년월일을 입력하면 사주팔자를 분석해드려요
          </p>
        </div>

        {/* 성별 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">성별</label>
          <div className="flex gap-2">
            {(['male', 'female'] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                  gender === g
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted/50'
                }`}
              >
                {g === 'male' ? '남성' : '여성'}
              </button>
            ))}
          </div>
        </div>

        {/* 생년 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" htmlFor="year">
            출생 연도
          </label>
          <input
            id="year"
            type="number"
            inputMode="numeric"
            placeholder="예) 1990"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            min={1900}
            max={2020}
            required
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          />
        </div>

        {/* 생월 / 생일 */}
        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="month">
              월
            </label>
            <div className="relative">
              <select
                id="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}월
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="day">
              일
            </label>
            <div className="relative">
              <select
                id="day"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {Array.from({ length: 31 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}일
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
            </div>
          </div>
        </div>

        {/* 태어난 시간 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" htmlFor="hour">
            태어난 시간{' '}
            <span className="font-normal text-muted-foreground">(선택)</span>
          </label>
          <div className="relative">
            <select
              id="hour"
              value={hourValue}
              onChange={(e) => setHourValue(e.target.value)}
              className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {HOURS.map(({ label, value }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
        >
          사주 분석하기
        </button>
      </form>
    )
  }

  // ── 로딩 ─────────────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <Loader2 size={28} className="animate-spin text-indigo-500" />
        <p className="text-sm text-muted-foreground">사주를 계산하는 중...</p>
      </div>
    )
  }

  // ── 에러 ─────────────────────────────────────────────────────────────────
  if (status === 'error') {
    return (
      <div className="flex flex-col gap-4 px-4 py-5">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">사주 분석</h1>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50"
          >
            <RotateCcw size={12} />
            다시 하기
          </button>
        </div>
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{errorMsg}</p>
        </div>
      </div>
    )
  }

  // ── 결과 ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 px-4 py-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">사주 분석 결과</h1>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50"
        >
          <RotateCcw size={12} />
          다시 하기
        </button>
      </div>

      {sajuResult && (
        <>
          {/* 사주 4기둥 */}
          <div className="grid grid-cols-4 gap-2">
            <PillarCard label="年柱" pillar={sajuResult.fourPillars.year} />
            <PillarCard label="月柱" pillar={sajuResult.fourPillars.month} />
            <PillarCard label="日柱" pillar={sajuResult.fourPillars.day} />
            {sajuResult.fourPillars.hour ? (
              <PillarCard label="時柱" pillar={sajuResult.fourPillars.hour} />
            ) : (
              <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border px-2 py-3">
                <span className="text-xs text-muted-foreground">時柱</span>
                <span className="text-xs text-muted-foreground">미입력</span>
              </div>
            )}
          </div>

          {/* 일간 배지 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">일간(日干)</span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                ELEMENT_BG_LIGHT[sajuResult.dayMaster.element]
              } ${ELEMENT_TEXT_COLORS[sajuResult.dayMaster.element]}`}
            >
              {sajuResult.dayMaster.stem}({sajuResult.dayMaster.stemKorean}) ·{' '}
              {sajuResult.dayMaster.element} {sajuResult.dayMaster.yinYang}
            </span>
          </div>

          {/* 오행 분포 */}
          <ElementBalance balance={sajuResult.elementBalance} />

          {/* 십신 */}
          <TenGodsSection
            tenGods={sajuResult.tenGods}
            fourPillars={sajuResult.fourPillars}
          />

          {/* 십이운성 */}
          <SipIunSeongSection
            sipIunSeong={sajuResult.sipIunSeong}
            fourPillars={sajuResult.fourPillars}
          />

          {/* 공망 */}
          <GongMangBadge gongMang={sajuResult.gongMang} />

          {/* 대운 */}
          <DaewoonSection daewoon={sajuResult.daewoon} />

          {/* 저장 버튼 */}
          <div className="rounded-xl border border-border bg-card p-4">
            {isLoggedIn ? (
              isSaved ? (
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-green-600">
                  <BookmarkCheck size={16} />
                  보관함에 저장되었어요
                </div>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {isSaving ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <BookmarkCheck size={15} />
                  )}
                  {isSaving ? '저장 중...' : '보관함에 저장'}
                </button>
              )
            ) : (
              <Link
                href="/login?callbackUrl=/saju"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <LogIn size={14} />
                로그인하면 분석 결과를 저장할 수 있어요
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  )
}
