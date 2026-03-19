'use client'

import { useState } from 'react'
import { ChevronDown, Heart, Loader2, RotateCcw } from 'lucide-react'
import type { SajuResult } from '@/lib/saju'

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

const ELEM_BG: Record<string, string> = {
  목: 'bg-green-100 text-green-700',
  화: 'bg-red-100 text-red-700',
  토: 'bg-amber-100 text-amber-700',
  금: 'bg-gray-100 text-gray-700',
  수: 'bg-blue-100 text-blue-700',
}

// ────────────────────────────────────────────────────────────────────────────
// 타입
// ────────────────────────────────────────────────────────────────────────────

interface PersonInput {
  year: string
  month: string
  day: string
  hour: string
  gender: 'male' | 'female'
}

interface AiSection {
  title: string
  summary: string
  score: number | null
  bullets: string[]
  body: string[]
}

type Status = 'idle' | 'loading' | 'streaming' | 'done' | 'error'

// ────────────────────────────────────────────────────────────────────────────
// AI 텍스트 파싱
// ────────────────────────────────────────────────────────────────────────────

function parseAiText(raw: string): AiSection[] {
  const sections: AiSection[] = []
  const parts = raw.split(/^## /m).filter(Boolean)
  for (const part of parts) {
    const lines = part.split('\n')
    const title = lines[0]?.trim() ?? ''
    let summary = ''
    let score: number | null = null
    const bullets: string[] = []
    const body: string[] = []
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      const summaryMatch = line.match(/^\*\*요약\*\*[:：]\s*(.+)/)
      const scoreMatch = line.match(/^\*\*점수\*\*[:：]\s*(\d+)/)
      if (summaryMatch) { summary = summaryMatch[1].trim(); continue }
      if (scoreMatch) { score = Math.min(100, Math.max(0, parseInt(scoreMatch[1]))); continue }
      if (line.startsWith('- ')) { bullets.push(line.slice(2).trim()); continue }
      if (line.trim()) body.push(line.trim())
    }
    if (title) sections.push({ title, summary, score, bullets, body })
  }
  return sections
}

// ────────────────────────────────────────────────────────────────────────────
// 점수 바
// ────────────────────────────────────────────────────────────────────────────

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 70 ? 'bg-green-500' :
    score >= 50 ? 'bg-amber-400' :
    score >= 30 ? 'bg-orange-400' : 'bg-red-400'
  const label =
    score >= 70 ? '잘 맞아요' :
    score >= 50 ? '보통이에요' :
    score >= 30 ? '노력이 필요해요' : '많은 노력이 필요해요'
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-bold text-foreground">{score}점</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// AI 섹션 카드
// ────────────────────────────────────────────────────────────────────────────

function AiSectionCard({ section }: { section: AiSection }) {
  const [open, setOpen] = useState(false)
  const isBullet = section.bullets.length > 0
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <button
        className="flex w-full items-start gap-3 p-4 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-foreground">{section.title}</p>
            <ChevronDown
              size={16}
              className={`shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
            />
          </div>
          {section.summary && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{section.summary}</p>
          )}
          {section.score !== null && !isBullet && (
            <div className="mt-2">
              <ScoreBar score={section.score} />
            </div>
          )}
        </div>
      </button>
      {open && (
        <div className="border-t border-border px-4 pb-4 pt-3 text-sm leading-relaxed text-foreground">
          {section.score !== null && (
            <div className="mb-3">
              <ScoreBar score={section.score} />
            </div>
          )}
          {isBullet
            ? <ul className="space-y-2">{section.bullets.map((b, i) => (
                <li key={i} className="flex gap-2"><span className="mt-0.5 shrink-0 text-rose-400">•</span><span>{b}</span></li>
              ))}</ul>
            : <div className="space-y-2">{section.body.map((b, i) => <p key={i}>{b}</p>)}</div>
          }
        </div>
      )}
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// 사람 입력 폼
// ────────────────────────────────────────────────────────────────────────────

function PersonForm({
  label,
  accent,
  value,
  onChange,
}: {
  label: string
  accent: string
  value: PersonInput
  onChange: (v: PersonInput) => void
}) {
  const set = (key: keyof PersonInput, val: string) =>
    onChange({ ...value, [key]: val })

  return (
    <div className={`rounded-2xl border-2 ${accent} bg-card p-4`}>
      <p className="mb-3 text-sm font-bold text-foreground">{label}</p>

      {/* 성별 */}
      <div className="mb-3 flex gap-2">
        {(['male', 'female'] as const).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => onChange({ ...value, gender: g })}
            className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${
              value.gender === g
                ? 'bg-rose-500 text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {g === 'male' ? '남성' : '여성'}
          </button>
        ))}
      </div>

      {/* 년도 */}
      <div className="mb-2">
        <input
          type="number"
          placeholder="출생년도 (예: 1993)"
          value={value.year}
          onChange={(e) => set('year', e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-400"
        />
      </div>

      {/* 월 일 */}
      <div className="mb-2 grid grid-cols-2 gap-2">
        <select
          value={value.month}
          onChange={(e) => set('month', e.target.value)}
          className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>{m}월</option>
          ))}
        </select>
        <select
          value={value.day}
          onChange={(e) => set('day', e.target.value)}
          className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
        >
          {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>{d}일</option>
          ))}
        </select>
      </div>

      {/* 시간 */}
      <select
        value={value.hour}
        onChange={(e) => set('hour', e.target.value)}
        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
      >
        {HOURS.map((h) => (
          <option key={h.value} value={h.value}>{h.label}</option>
        ))}
      </select>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// 사주 요약 미니 카드
// ────────────────────────────────────────────────────────────────────────────

function SajuMiniCard({ label, saju }: { label: string; saju: SajuResult }) {
  const { fourPillars: fp, dayMaster: dm, elementBalance: eb } = saju
  const pillars = [fp.year, fp.month, fp.day, ...(fp.hour ? [fp.hour] : [])]
  const elemEntries = Object.entries(eb).filter(([, v]) => v > 0)

  return (
    <div className="flex-1 rounded-2xl border border-border bg-card p-3">
      <p className="mb-2 text-xs font-bold text-muted-foreground">{label}</p>
      {/* 4기둥 */}
      <div className="mb-2 flex gap-1">
        {pillars.map((p, i) => (
          <div key={i} className="flex flex-1 flex-col items-center rounded-lg bg-muted px-1 py-1.5">
            <span className="text-[10px] text-muted-foreground">{['연', '월', '일', '시'][i]}</span>
            <span className="text-xs font-bold">{p.stem}</span>
            <span className="text-xs font-bold">{p.branch}</span>
          </div>
        ))}
      </div>
      {/* 일간 + 오행 */}
      <div className="flex flex-wrap gap-1">
        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-medium text-rose-700">
          {dm.stemKorean}({dm.element})
        </span>
        {elemEntries.map(([e, v]) => (
          <span key={e} className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${ELEM_BG[e] ?? ''}`}>
            {e}{v}
          </span>
        ))}
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// 전체 궁합 점수 (AI 섹션 평균)
// ────────────────────────────────────────────────────────────────────────────

function OverallScore({ sections }: { sections: AiSection[] }) {
  const scored = sections.filter((s) => s.score !== null && s.title !== '두 사람을 위한 핵심 조언')
  if (scored.length === 0) return null
  const avg = Math.round(scored.reduce((sum, s) => sum + (s.score ?? 0), 0) / scored.length)
  const emoji = avg >= 70 ? '💕' : avg >= 50 ? '💛' : '💪'
  const label = avg >= 70 ? '찰떡 궁합이에요!' : avg >= 50 ? '괜찮은 궁합이에요' : '노력으로 극복해요'

  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 p-5 text-white shadow-lg">
      <p className="text-sm font-medium text-rose-100">종합 궁합 점수</p>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-4xl font-bold">{avg}점</span>
        <span className="mb-1 text-2xl">{emoji}</span>
      </div>
      <p className="mt-1 text-sm font-semibold">{label}</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
        <div className="h-full rounded-full bg-white/80" style={{ width: `${avg}%` }} />
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// 메인 컴포넌트
// ────────────────────────────────────────────────────────────────────────────

const defaultPerson = (): PersonInput => ({
  year: '', month: '1', day: '1', hour: '', gender: 'male',
})

export default function GunghapClient() {
  const [person1, setPerson1] = useState<PersonInput>(defaultPerson())
  const [person2, setPerson2] = useState<PersonInput>({ ...defaultPerson(), gender: 'female' })
  const [status, setStatus] = useState<Status>('idle')
  const [saju1, setSaju1] = useState<SajuResult | null>(null)
  const [saju2, setSaju2] = useState<SajuResult | null>(null)
  const [aiText, setAiText] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const sections = parseAiText(aiText)

  const handleSubmit = async () => {
    const y1 = parseInt(person1.year)
    const y2 = parseInt(person2.year)
    if (!person1.year || isNaN(y1) || y1 < 1900 || y1 > 2020) {
      setErrorMsg('나의 출생년도를 올바르게 입력해주세요 (1900~2020)')
      return
    }
    if (!person2.year || isNaN(y2) || y2 < 1900 || y2 > 2020) {
      setErrorMsg('상대의 출생년도를 올바르게 입력해주세요 (1900~2020)')
      return
    }
    setErrorMsg('')
    setStatus('loading')
    setSaju1(null)
    setSaju2(null)
    setAiText('')

    try {
      const body = {
        person1: {
          year: y1, month: parseInt(person1.month), day: parseInt(person1.day),
          ...(person1.hour ? { hour: parseInt(person1.hour) } : {}),
          gender: person1.gender,
        },
        person2: {
          year: y2, month: parseInt(person2.month), day: parseInt(person2.day),
          ...(person2.hour ? { hour: parseInt(person2.hour) } : {}),
          gender: person2.gender,
        },
      }

      const res = await fetch('/api/gunghap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok || !res.body) throw new Error('API_ERROR')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const parts = buf.split('\n\n')
        buf = parts.pop() ?? ''
        for (const part of parts) {
          const line = part.startsWith('data: ') ? part.slice(6) : part
          if (line === '[DONE]') { setStatus('done'); continue }
          try {
            const msg = JSON.parse(line)
            if (msg.type === 'saju') {
              setSaju1(msg.payload.saju1)
              setSaju2(msg.payload.saju2)
              setStatus('streaming')
            } else if (msg.type === 'text') {
              setAiText((prev) => prev + msg.text)
            } else if (msg.type === 'ai_error') {
              setStatus('done')
            }
          } catch (err) {
            console.warn('SSE parse error', err)
          }
        }
      }
      setStatus('done')
    } catch (err) {
      console.error('궁합 오류', err)
      setErrorMsg('분석 중 오류가 발생했어요. 다시 시도해주세요.')
      setStatus('error')
    }
  }

  const handleReset = () => {
    setStatus('idle')
    setSaju1(null)
    setSaju2(null)
    setAiText('')
    setErrorMsg('')
    setPerson1(defaultPerson())
    setPerson2({ ...defaultPerson(), gender: 'female' })
  }

  // ── 입력 폼 ─────────────────────────────────────────────────────────────
  if (status === 'idle' || status === 'error') {
    return (
      <div className="flex flex-col gap-4 px-4 py-5">
        {/* 헤더 */}
        <div>
          <div className="flex items-center gap-2">
            <Heart size={20} className="text-rose-500" strokeWidth={1.8} />
            <h2 className="text-xl font-bold">궁합 보기</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">두 사람의 사주로 궁합을 알아봐요</p>
        </div>

        {/* 두 사람 입력 */}
        <PersonForm
          label="나"
          accent="border-rose-300"
          value={person1}
          onChange={setPerson1}
        />
        <PersonForm
          label="상대"
          accent="border-pink-200"
          value={person2}
          onChange={setPerson2}
        />

        {errorMsg && (
          <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-600">{errorMsg}</p>
        )}

        <button
          onClick={handleSubmit}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-500 py-4 text-base font-bold text-white shadow-md transition-opacity active:opacity-80"
        >
          <Heart size={18} strokeWidth={2} />
          궁합 분석하기
        </button>
      </div>
    )
  }

  // ── 로딩 ────────────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-4 py-20">
        <Loader2 size={36} className="animate-spin text-rose-400" />
        <p className="text-sm text-muted-foreground">궁합을 분석하고 있어요...</p>
      </div>
    )
  }

  // ── 결과 ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 px-4 py-5">
      {/* 두 사람 요약 */}
      {saju1 && saju2 && (
        <div className="flex gap-3">
          <SajuMiniCard label="나" saju={saju1} />
          <div className="flex flex-col items-center justify-center">
            <Heart size={20} className="text-rose-400" strokeWidth={2} />
          </div>
          <SajuMiniCard label="상대" saju={saju2} />
        </div>
      )}

      {/* 종합 점수 */}
      {sections.length > 0 && <OverallScore sections={sections} />}

      {/* AI 스트리밍 중 */}
      {status === 'streaming' && sections.length === 0 && (
        <div className="flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3">
          <Loader2 size={16} className="animate-spin text-rose-400" />
          <p className="text-sm text-rose-600">AI가 궁합을 분석 중이에요...</p>
        </div>
      )}

      {/* AI 분석 섹션 */}
      {sections.map((s, i) => (
        <AiSectionCard key={i} section={s} />
      ))}

      {/* 다시하기 */}
      {status === 'done' && (
        <button
          onClick={handleReset}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
        >
          <RotateCcw size={15} />
          다시 보기
        </button>
      )}
    </div>
  )
}
