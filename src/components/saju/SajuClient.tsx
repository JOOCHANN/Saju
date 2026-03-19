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

// 오행 한 줄 설명
const ELEMENT_DESC: Record<string, string> = {
  목: '성장·창의·인자함',
  화: '열정·표현·예의',
  토: '안정·신용·중립',
  금: '결단·의리·정의',
  수: '지혜·적응·감성',
}

// 십신 설명
const TEN_GOD_DESC: Record<string, string> = {
  비견: '독립심·자존감 강함',
  겁재: '승부욕·강한 의지',
  식신: '재능·표현력·먹복',
  상관: '창의력·자유로운 영혼',
  편재: '활동적 재물·사업 기질',
  정재: '안정적 재물·성실함',
  편관: '강한 추진력·도전정신',
  정관: '명예·책임감·원칙주의',
  편인: '예술·직관·독창성',
  정인: '학문·지혜·포용력',
}

// 십이운성 설명
const SIP_IUN_DESC: Record<string, string> = {
  장생: '새로운 시작, 성장의 기운',
  목욕: '순수함, 예민한 감수성',
  관대: '발전과 성장, 활기찬 에너지',
  건록: '독립·자립, 왕성한 활동력',
  제왕: '전성기, 강한 리더십',
  쇠: '원숙함, 지혜로운 판단',
  병: '인내의 시기, 내면 성찰',
  사: '변화와 전환, 새로운 준비',
  묘: '저장·축적, 내실을 다지는 때',
  절: '단절과 재충전, 새 출발 준비',
  태: '잉태와 계획, 가능성의 씨앗',
  양: '양육과 보호, 천천히 성장',
}

type Status = 'idle' | 'loading' | 'streaming' | 'done' | 'error'

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
      <span className={`text-2xl font-bold ${ELEMENT_TEXT_COLORS[elem] ?? 'text-foreground'}`}>
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
      {/* 지지 동물 */}
      <span className="text-[10px] text-muted-foreground">{pillar.zodiac}띠</span>
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
              <div className="flex w-16 flex-col">
                <span className="text-xs font-medium">{elem}</span>
                <span className="text-[9px] leading-tight text-muted-foreground">
                  {ELEMENT_DESC[elem]}
                </span>
              </div>
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

function TenGodsSection({
  tenGods,
  fourPillars,
}: {
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
      <div className="mb-1 flex items-baseline gap-2">
        <p className="text-xs font-semibold text-muted-foreground">십신 (十神)</p>
        <p className="text-[10px] text-muted-foreground">— 일간을 기준으로 각 기둥이 나에게 미치는 역할</p>
      </div>
      <div className="mt-3 flex gap-3">
        {items.map(({ label, god, pillar }) => (
          <div key={label} className="flex flex-1 flex-col items-center gap-1 rounded-lg bg-muted/40 px-2 py-2">
            <span className="text-[10px] text-muted-foreground">{label}</span>
            <span className="text-sm font-semibold text-foreground">
              {pillar!.stem}
              {pillar!.branch}
            </span>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
              {god}
            </span>
            <span className="mt-0.5 text-center text-[9px] leading-tight text-muted-foreground">
              {TEN_GOD_DESC[god as string] ?? ''}
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

function SipIunSeongSection({
  sipIunSeong,
  fourPillars,
}: {
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
      <div className="mb-1 flex items-baseline gap-2">
        <p className="text-xs font-semibold text-muted-foreground">십이운성 (十二運星)</p>
        <p className="text-[10px] text-muted-foreground">— 일간이 각 기둥에서 갖는 생애 주기</p>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {items.map(({ label, stage, pillar }) => (
          <div key={label} className="flex flex-col items-center gap-1 rounded-lg bg-muted/40 px-1 py-2">
            <span className="text-[10px] text-muted-foreground">{label}</span>
            <span className="text-xs text-foreground">
              {pillar!.stem}
              {pillar!.branch}
            </span>
            <span className="text-[10px] font-semibold text-amber-700">{stage}</span>
            <span className="mt-0.5 text-center text-[9px] leading-tight text-muted-foreground">
              {SIP_IUN_DESC[stage as string] ?? ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// 서브 컴포넌트: 공망
// ────────────────────────────────────────────────────────────────────────────

function GongMangBadge({ gongMang }: { gongMang: SajuResult['gongMang'] }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground">공망 (空亡)</span>
        <div className="flex gap-1.5">
          {gongMang.map((b, i) => (
            <span
              key={i}
              className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600"
            >
              {BRANCHES[b].char} {BRANCHES[b].korean} ({BRANCHES[b].zodiac})
            </span>
          ))}
        </div>
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
        이 지지의 기운이 약해지는 구간이에요. 해당 띠의 인연이나 관련 분야에서 허무함을 느낄 수 있어 물질보다 정신적 성장에 집중하는 게 유리해요.
      </p>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// 서브 컴포넌트: 대운
// ────────────────────────────────────────────────────────────────────────────

function DaewoonSection({ daewoon }: { daewoon: SajuResult['daewoon'] }) {
  const items = daewoon.slice(0, 6)
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-1 flex items-baseline gap-2">
        <p className="text-xs font-semibold text-muted-foreground">대운 (大運)</p>
        <p className="text-[10px] text-muted-foreground">— 10년 단위로 바뀌는 큰 운의 흐름</p>
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {items.map((dw, i) => {
          const stemElem = ELEMENT_NAMES[STEMS[dw.stemIndex].element]
          return (
            <div
              key={i}
              className="flex min-w-[56px] flex-col items-center gap-1 rounded-lg bg-muted/50 px-2 py-2"
            >
              <span className="text-[10px] text-muted-foreground">{dw.startAge}세~</span>
              <span className={`text-base font-bold ${ELEMENT_TEXT_COLORS[stemElem] ?? 'text-foreground'}`}>
                {STEMS[dw.stemIndex].char}
              </span>
              <span className="text-sm font-semibold text-foreground">
                {BRANCHES[dw.branchIndex].char}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {STEMS[dw.stemIndex].korean}
                {BRANCHES[dw.branchIndex].korean}
              </span>
              <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${ELEMENT_BG_LIGHT[stemElem]} ${ELEMENT_TEXT_COLORS[stemElem]}`}>
                {stemElem}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// 서브 컴포넌트: AI 해석 텍스트
// ────────────────────────────────────────────────────────────────────────────

function parseSections(text: string): { title: string; lines: string[] }[] {
  const sections: { title: string; lines: string[] }[] = []
  let current: { title: string; lines: string[] } | null = null
  for (const line of text.split('\n')) {
    if (line.startsWith('## ')) {
      if (current) sections.push(current)
      current = { title: line.slice(3).trim(), lines: [] }
    } else if (current && line.trim()) {
      current.lines.push(line)
    }
  }
  if (current) sections.push(current)
  return sections
}

function AiInterpretation({
  text,
  isStreaming,
  isDone,
  error,
}: {
  text: string
  isStreaming: boolean
  isDone: boolean
  error: string
}) {
  const sectionIcons: Record<string, string> = {
    연애운: '💕',
    결혼운: '💍',
    금전운: '💰',
    직업운: '💼',
    건강운: '🌿',
    '이 사주의 핵심 조언': '✨',
  }

  return (
    <div className="rounded-xl border border-indigo-100 bg-gradient-to-b from-indigo-50/50 to-white p-4">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm font-bold text-indigo-700">사주 해석</span>
        {isStreaming && (
          <Loader2 size={12} className="ml-auto animate-spin text-indigo-400" />
        )}
      </div>

      {/* 에러 */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* 스트리밍 중이거나 텍스트 있을 때 */}
      {!error && text && (
        <div className="flex flex-col gap-4">
          {parseSections(text).map((section) => (
            <div key={section.title} className="rounded-lg bg-white/80 p-3 shadow-sm">
              <div className="mb-1.5 flex items-center gap-1.5">
                <span className="text-base">{sectionIcons[section.title] ?? '📌'}</span>
                <span className="text-sm font-bold text-indigo-700">{section.title}</span>
              </div>
              <p className="text-sm leading-relaxed text-foreground">
                {section.lines.join(' ')}
              </p>
            </div>
          ))}
          {isStreaming && (
            <span className="inline-block h-4 w-0.5 animate-pulse bg-indigo-400" />
          )}
        </div>
      )}

      {/* 로딩 중 (스트리밍 시작 전) */}
      {!error && !text && isStreaming && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 size={14} className="animate-spin" />
          <span>사주를 해석하는 중이에요...</span>
        </div>
      )}

      {/* 완료됐는데 텍스트 없음 (API 키 미설정 등) */}
      {!error && !text && isDone && (
        <p className="text-sm text-muted-foreground">해석을 불러올 수 없어요. API 키를 확인해주세요.</p>
      )}
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
  const [aiText, setAiText] = useState('')
  const [aiError, setAiError] = useState('')
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

    setAiText('')
    setAiError('')
    setErrorMsg('')
    setSajuResult(null)
    setStatus('loading')

    try {
      const res = await fetch('/api/saju/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: y, month: m, day: d, hour, gender }),
      })

      if (!res.ok || !res.body) {
        throw new Error(`서버 오류 (${res.status})`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (raw === '[DONE]') {
            setStatus('done')
            continue
          }
          try {
            const evt = JSON.parse(raw) as
              | { type: 'saju'; payload: SajuResult }
              | { type: 'text'; text: string }
              | { type: 'ai_error'; message: string }

            if (evt.type === 'saju') {
              setSajuResult(evt.payload)
              setStatus('streaming')
            } else if (evt.type === 'text') {
              setAiText((prev) => prev + evt.text)
            } else if (evt.type === 'ai_error') {
              setAiError('AI 해석 중 오류가 발생했어요: ' + evt.message)
            }
          } catch {
            // JSON 파싱 오류 무시
          }
        }
      }

      setStatus('done')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '분석 중 오류가 발생했어요.')
      setStatus('error')
    }
  }

  function handleReset() {
    setSajuResult(null)
    setAiText('')
    setAiError('')
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
        body: JSON.stringify({ sajuResult, aiText }),
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
            생년월일을 입력하면 사주팔자와 운세 해석을 알려드려요
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

  // ── 로딩 (사주 계산 중) ───────────────────────────────────────────────────
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

  // ── 결과 + 스트리밍 ───────────────────────────────────────────────────────
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

          {/* 구분선 */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">운세 해석</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* AI 해석 */}
          <AiInterpretation
            text={aiText}
            isStreaming={status === 'streaming'}
            isDone={status === 'done'}
            error={aiError}
          />

          {/* 저장 버튼 — 해석 완료 후 표시 */}
          {status === 'done' && (
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
          )}
        </>
      )}
    </div>
  )
}
