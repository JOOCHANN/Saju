'use client'

import { useState } from 'react'
import {
  BookmarkCheck,
  ChevronDown,
  Loader2,
  LogIn,
  RotateCcw,
} from 'lucide-react'
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
  목: 'bg-green-500', 화: 'bg-red-500', 토: 'bg-amber-500',
  금: 'bg-gray-400', 수: 'bg-blue-500',
}
const ELEMENT_TEXT_COLORS: Record<string, string> = {
  목: 'text-green-700', 화: 'text-red-700', 토: 'text-amber-700',
  금: 'text-gray-600', 수: 'text-blue-700',
}
const ELEMENT_BG_LIGHT: Record<string, string> = {
  목: 'bg-green-100', 화: 'bg-red-100', 토: 'bg-amber-100',
  금: 'bg-gray-100', 수: 'bg-blue-100',
}
const ELEMENT_SIMPLE: Record<string, string> = {
  목: '🌱 나무·성장', 화: '🔥 불·열정', 토: '🪨 흙·안정',
  금: '⚙️ 금·결단', 수: '💧 물·지혜',
}

const TEN_GOD_DESC: Record<string, string> = {
  비견: '나와 비슷한 성격의 힘 — 독립심과 자존감이 강해요',
  겁재: '강한 경쟁심과 승부욕 — 추진력이 넘쳐요',
  식신: '타고난 재능과 표현력 — 먹복(먹고 살 복)이 있어요',
  상관: '창의적이고 자유로운 영혼 — 틀에 박힌 걸 싫어해요',
  편재: '사업이나 투자로 버는 돈 — 활동적인 재물운이에요',
  정재: '꾸준히 모으는 안정적인 돈 — 성실하게 재산을 쌓아요',
  편관: '강한 추진력과 도전정신 — 역경을 뚫고 나아가는 힘이에요',
  정관: '명예와 책임감 — 원칙을 지키며 신뢰를 받아요',
  편인: '예술적 감각과 직관력 — 독창적인 아이디어가 넘쳐요',
  정인: '학문과 지혜 — 배움을 좋아하고 포용력이 있어요',
}

const SIP_IUN_DESC: Record<string, string> = {
  장생: '새로운 시작의 기운 — 뭐든 시작하기 좋은 에너지예요',
  목욕: '순수하고 예민한 감수성 — 감정 기복이 있을 수 있어요',
  관대: '쑥쑥 성장하는 시기 — 활기차고 발전하는 기운이에요',
  건록: '스스로 독립하는 힘 — 가장 왕성하게 활동하는 기운이에요',
  제왕: '최고의 전성기 기운 — 리더십이 빛나는 시기예요',
  쇠: '원숙하고 지혜로운 기운 — 경험에서 나오는 판단력이 있어요',
  병: '쉬고 성찰하는 기운 — 무리하지 말고 내실을 다지세요',
  사: '변화와 전환의 기운 — 새로운 준비를 시작하는 시기예요',
  묘: '힘을 저장하는 기운 — 조용히 내실을 쌓는 때예요',
  절: '완전히 새로 시작하는 기운 — 과거를 정리하고 재충전해요',
  태: '가능성의 씨앗 — 아직 드러나지 않은 잠재력이 있어요',
  양: '천천히 자라나는 기운 — 서두르지 않고 꾸준히 성장해요',
}

const DAEWOON_ELEM_DESC: Record<string, string> = {
  목: '성장과 도전의 시기예요. 새로운 일을 시작하거나 배움을 넓히기 좋아요. 적극적으로 나아가면 좋은 결과를 얻을 수 있어요.',
  화: '활발하고 빛나는 시기예요. 주변에서 주목받고 인정받기 쉬운 때예요. 사회활동과 대인관계가 활발해져요.',
  토: '안정과 기반을 다지는 시기예요. 신뢰를 쌓고 내실을 갖추는 데 집중하면 좋아요. 무리한 도전보다 꾸준함이 힘이에요.',
  금: '결실을 맺는 시기예요. 그동안의 노력이 결과로 이어지는 때예요. 정리와 완성, 새로운 기준을 세우기 좋아요.',
  수: '변화와 지혜의 시기예요. 유연하게 적응하며 새로운 방향을 찾는 때예요. 공부하거나 내면을 성장시키기 좋아요.',
}

type Status = 'idle' | 'loading' | 'streaming' | 'done' | 'error'

// ────────────────────────────────────────────────────────────────────────────
// 공통 컴포넌트: 접었다 펼치는 카드
// ────────────────────────────────────────────────────────────────────────────

function CollapsibleCard({
  title,
  titleSub,
  summary,
  defaultOpen = false,
  children,
}: {
  title: string
  titleSub?: string
  summary: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-muted-foreground">{title}</span>
            {titleSub && (
              <span className="text-[10px] text-muted-foreground">— {titleSub}</span>
            )}
          </div>
          <div className="mt-0.5 text-sm text-foreground">{summary}</div>
        </div>
        <ChevronDown
          size={15}
          className={`mt-1 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="border-t border-border px-4 pb-4 pt-3">{children}</div>
      )}
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// 서브 컴포넌트: 사주 4기둥 (항상 표시)
// ────────────────────────────────────────────────────────────────────────────

function PillarCard({ label, pillar }: { label: string; pillar: SajuResult['fourPillars']['year'] }) {
  const elem = pillar.stemElement
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card px-2 py-3">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className={`text-2xl font-bold ${ELEMENT_TEXT_COLORS[elem] ?? 'text-foreground'}`}>
        {pillar.stem}
      </span>
      <span className="text-xl font-semibold text-foreground">{pillar.branch}</span>
      <span className={`mt-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${ELEMENT_BG_LIGHT[elem]} ${ELEMENT_TEXT_COLORS[elem]}`}>
        {elem}
      </span>
      <span className="text-[10px] text-muted-foreground">{pillar.stemKorean}{pillar.branchKorean}</span>
      <span className="text-[10px] text-muted-foreground">{pillar.zodiac}띠</span>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// 서브 컴포넌트: 오행 분포 (접이식)
// ────────────────────────────────────────────────────────────────────────────

function ElementBalanceSection({ balance }: { balance: SajuResult['elementBalance'] }) {
  const total = Object.values(balance).reduce((a, b) => a + b, 0)
  const sorted = ELEMENT_NAMES.slice().sort((a, b) => balance[b] - balance[a])
  const top = sorted[0]
  const summary = `${ELEMENT_SIMPLE[top]} 기운이 가장 강해요 (${ELEMENT_NAMES.map((e) => `${e}${balance[e]}`).join('·')})`

  return (
    <CollapsibleCard title="오행 분포" titleSub="나를 구성하는 5가지 에너지 비율" summary={summary}>
      <div className="flex flex-col gap-3">
        {ELEMENT_NAMES.map((elem) => {
          const count = balance[elem]
          const pct = total > 0 ? (count / total) * 100 : 0
          return (
            <div key={elem}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold w-6">{elem}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${ELEMENT_COLORS[elem]}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-4 text-right text-xs text-muted-foreground">{count}</span>
              </div>
              <p className="text-[11px] text-muted-foreground pl-8">{ELEMENT_SIMPLE[elem]}</p>
            </div>
          )
        })}
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground bg-muted/40 rounded-lg p-2">
          💡 기운이 2개 이상이면 그 성질이 강하게 나타나고, 0개이면 그 영역이 약할 수 있어요. 균형 잡힌 사주일수록 안정적이에요.
        </p>
      </div>
    </CollapsibleCard>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// 서브 컴포넌트: 십신 (접이식)
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

  const summary = items.map((i) => `${i.label} ${i.god}`).join(' · ')

  return (
    <CollapsibleCard
      title="십신 (十神)"
      titleSub="각 기둥이 나에게 미치는 역할"
      summary={summary}
    >
      <p className="mb-3 text-[11px] leading-relaxed text-muted-foreground bg-muted/40 rounded-lg p-2">
        💡 일간(나)을 기준으로 다른 기둥들이 어떤 역할을 하는지 나타내요. 재물·명예·가족 등 삶의 각 영역과 연결돼요.
      </p>
      <div className="flex flex-col gap-2">
        {items.map(({ label, god, pillar }) => (
          <div key={label} className="flex items-start gap-3 rounded-lg bg-muted/40 p-3">
            <div className="flex flex-col items-center min-w-[52px]">
              <span className="text-[10px] text-muted-foreground">{label}</span>
              <span className="text-sm font-bold">{pillar!.stem}{pillar!.branch}</span>
              <span className="text-[10px] text-muted-foreground">{pillar!.stemKorean}{pillar!.branchKorean}</span>
            </div>
            <div className="flex-1">
              <span className="inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 mb-1">
                {god}
              </span>
              <p className="text-xs leading-relaxed text-foreground">
                {TEN_GOD_DESC[god as string] ?? ''}
              </p>
            </div>
          </div>
        ))}
      </div>
    </CollapsibleCard>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// 서브 컴포넌트: 십이운성 (접이식)
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

  const summary = items.map((i) => `${i.label} ${i.stage}`).join(' · ')

  return (
    <CollapsibleCard
      title="십이운성 (十二運星)"
      titleSub="내 기운의 생애 주기 단계"
      summary={summary}
    >
      <p className="mb-3 text-[11px] leading-relaxed text-muted-foreground bg-muted/40 rounded-lg p-2">
        💡 사람의 일생처럼 기운도 태어나고 자라고 쉬고 다시 태어나는 12단계를 거쳐요. 각 기둥이 어떤 단계에 있는지 보여줘요.
      </p>
      <div className="flex flex-col gap-2">
        {items.map(({ label, stage, pillar }) => (
          <div key={label} className="flex items-start gap-3 rounded-lg bg-muted/40 p-3">
            <div className="flex flex-col items-center min-w-[52px]">
              <span className="text-[10px] text-muted-foreground">{label}</span>
              <span className="text-sm font-bold">{pillar!.stem}{pillar!.branch}</span>
              <span className="text-[10px] text-muted-foreground">{pillar!.stemKorean}{pillar!.branchKorean}</span>
            </div>
            <div className="flex-1">
              <span className="inline-block rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 mb-1">
                {stage}
              </span>
              <p className="text-xs leading-relaxed text-foreground">
                {SIP_IUN_DESC[stage as string] ?? ''}
              </p>
            </div>
          </div>
        ))}
      </div>
    </CollapsibleCard>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// 서브 컴포넌트: 공망 (접이식)
// ────────────────────────────────────────────────────────────────────────────

function GongMangSection({ gongMang }: { gongMang: SajuResult['gongMang'] }) {
  const names = gongMang.map((b) => `${BRANCHES[b].char}(${BRANCHES[b].korean}) ${BRANCHES[b].zodiac}`)
  const summary = `${names.join(' · ')} — 이 기운이 약해지는 구간이에요`

  return (
    <CollapsibleCard title="공망 (空亡)" titleSub="기운이 비어있는 지지" summary={summary}>
      <div className="flex gap-2 mb-3">
        {gongMang.map((b, i) => (
          <span key={i} className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
            {BRANCHES[b].char} {BRANCHES[b].korean} ({BRANCHES[b].zodiac}띠)
          </span>
        ))}
      </div>
      <div className="text-[11px] leading-relaxed text-muted-foreground space-y-1.5 bg-muted/40 rounded-lg p-3">
        <p>📌 공망이란 사주에서 기운이 '비어버린' 지지를 말해요.</p>
        <p>이 띠해이거나 이 띠 해에 태어난 인연은 인연이 깊어도 결국 떠나거나 허무함으로 끝나는 경우가 있어요.</p>
        <p>금전·명예보다 <strong>정신적 성장과 내면의 충실함</strong>에 집중하는 게 훨씬 이로워요.</p>
        <p>나쁜 것만은 아니에요 — 오히려 세속적인 것에 얽매이지 않고 자유롭게 살아갈 수 있는 기질이기도 해요.</p>
      </div>
    </CollapsibleCard>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// 서브 컴포넌트: 대운 (접이식)
// ────────────────────────────────────────────────────────────────────────────

function DaewoonSection({ daewoon }: { daewoon: SajuResult['daewoon'] }) {
  const items = daewoon.slice(0, 6)
  const first = items[0]
  const summary = first
    ? `${first.startAge}세부터 시작 — ${items.map((d) => `${d.startAge}세 ${STEMS[d.stemIndex].korean}${BRANCHES[d.branchIndex].korean}`).join(' · ')}`
    : '대운 정보 없음'

  return (
    <CollapsibleCard title="대운 (大運)" titleSub="10년 단위로 바뀌는 큰 운의 흐름" summary={summary}>
      <p className="mb-3 text-[11px] leading-relaxed text-muted-foreground bg-muted/40 rounded-lg p-2">
        💡 대운은 10년마다 바뀌는 '큰 운'이에요. 평생 운세가 어떤 흐름으로 흘러가는지 보여줘요. 어떤 기운의 대운인지에 따라 그 시기에 집중해야 할 것들이 달라요.
      </p>
      <div className="flex flex-col gap-2">
        {items.map((dw, i) => {
          const stemElem = ELEMENT_NAMES[STEMS[dw.stemIndex].element]
          const branchElem = ELEMENT_NAMES[BRANCHES[dw.branchIndex].element]
          return (
            <div key={i} className="rounded-lg border border-border p-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex flex-col items-center min-w-[44px]">
                  <span className="text-[10px] text-muted-foreground font-medium">{dw.startAge}세~</span>
                  <span className={`text-lg font-bold ${ELEMENT_TEXT_COLORS[stemElem]}`}>
                    {STEMS[dw.stemIndex].char}
                  </span>
                  <span className="text-base font-semibold text-foreground">
                    {BRANCHES[dw.branchIndex].char}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap gap-1 mb-1">
                    <span className="text-xs text-muted-foreground">
                      {STEMS[dw.stemIndex].korean}{BRANCHES[dw.branchIndex].korean}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${ELEMENT_BG_LIGHT[stemElem]} ${ELEMENT_TEXT_COLORS[stemElem]}`}>
                      천간 {stemElem}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${ELEMENT_BG_LIGHT[branchElem]} ${ELEMENT_TEXT_COLORS[branchElem]}`}>
                      지지 {branchElem}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-foreground">
                    {DAEWOON_ELEM_DESC[stemElem] ?? ''}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </CollapsibleCard>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// 유틸: AI 텍스트 파싱
// ────────────────────────────────────────────────────────────────────────────

interface AiSection {
  title: string
  summary: string
  bullets: string[]
  body: string[]
}

function parseAiText(text: string): AiSection[] {
  const sections: AiSection[] = []
  let current: AiSection | null = null

  for (const line of text.split('\n')) {
    if (line.startsWith('## ')) {
      if (current) sections.push(current)
      current = { title: line.slice(3).trim(), summary: '', bullets: [], body: [] }
    } else if (current) {
      const summaryMatch = line.match(/^\*\*요약\*\*[:：]\s*(.+)/)
      if (summaryMatch) {
        current.summary = summaryMatch[1].trim()
      } else if (line.startsWith('- ')) {
        current.bullets.push(line.slice(2).trim())
      } else if (line.trim()) {
        current.body.push(line.trim())
      }
    }
  }
  if (current) sections.push(current)
  return sections
}

// ────────────────────────────────────────────────────────────────────────────
// 서브 컴포넌트: AI 해석 (접이식 섹션들)
// ────────────────────────────────────────────────────────────────────────────

const AI_SECTION_ICONS: Record<string, string> = {
  연애운: '💕', 결혼운: '💍', 금전운: '💰',
  직업운: '💼', 건강운: '🌿', '이 사주의 핵심 조언': '✨',
}

function AiSection({ section, isLast, isStreaming }: {
  section: AiSection
  isLast: boolean
  isStreaming: boolean
}) {
  const [open, setOpen] = useState(isLast)
  const icon = AI_SECTION_ICONS[section.title] ?? '📌'
  const isCoreAdvice = section.title === '이 사주의 핵심 조언'

  return (
    <div className="rounded-xl border border-indigo-100 bg-white overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 px-4 py-3 text-left"
      >
        <span className="text-lg shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-bold text-indigo-700">{section.title}</span>
          {section.summary && (
            <p className="mt-0.5 text-xs font-medium text-foreground">{section.summary}</p>
          )}
          {!section.summary && isStreaming && isLast && (
            <span className="inline-block h-3 w-0.5 animate-pulse bg-indigo-400 ml-1" />
          )}
        </div>
        <ChevronDown
          size={15}
          className={`mt-1 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="border-t border-indigo-50 px-4 pb-4 pt-3 bg-indigo-50/30">
          {isCoreAdvice && section.bullets.length > 0 ? (
            <ul className="space-y-2">
              {section.bullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-foreground">
                  <span className="mt-0.5 shrink-0 text-indigo-400">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
              {isStreaming && isLast && (
                <span className="inline-block h-4 w-0.5 animate-pulse bg-indigo-400" />
              )}
            </ul>
          ) : (
            <div className="space-y-2">
              {section.body.map((line, i) => (
                <p key={i} className="text-sm leading-relaxed text-foreground">{line}</p>
              ))}
              {section.bullets.map((bullet, i) => (
                <li key={`b${i}`} className="flex items-start gap-2 text-sm leading-relaxed text-foreground list-none">
                  <span className="mt-0.5 shrink-0 text-indigo-400">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
              {isStreaming && isLast && (
                <span className="inline-block h-4 w-0.5 animate-pulse bg-indigo-400" />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AiInterpretation({ text, isStreaming, isDone, error }: {
  text: string
  isStreaming: boolean
  isDone: boolean
  error: string
}) {
  const sections = parseAiText(text)

  return (
    <div className="rounded-xl border border-indigo-100 bg-gradient-to-b from-indigo-50/50 to-white p-4">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm font-bold text-indigo-700">사주 해석</span>
        {isStreaming && (
          <Loader2 size={12} className="ml-auto animate-spin text-indigo-400" />
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {!error && sections.length > 0 && (
        <div className="flex flex-col gap-2">
          {sections.map((section, i) => (
            <AiSection
              key={section.title}
              section={section}
              isLast={i === sections.length - 1}
              isStreaming={isStreaming}
            />
          ))}
        </div>
      )}

      {!error && !text && isStreaming && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 size={14} className="animate-spin" />
          <span>사주를 해석하는 중이에요...</span>
        </div>
      )}

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
      if (!res.ok || !res.body) throw new Error(`서버 오류 (${res.status})`)

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
          if (raw === '[DONE]') { setStatus('done'); continue }
          try {
            const evt = JSON.parse(raw) as
              | { type: 'saju'; payload: SajuResult }
              | { type: 'text'; text: string }
              | { type: 'ai_error'; message: string }
            if (evt.type === 'saju') { setSajuResult(evt.payload); setStatus('streaming') }
            else if (evt.type === 'text') setAiText((prev) => prev + evt.text)
            else if (evt.type === 'ai_error') setAiError('AI 해석 오류: ' + evt.message)
          } catch { /* JSON 파싱 오류 무시 */ }
        }
      }
      setStatus('done')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '분석 중 오류가 발생했어요.')
      setStatus('error')
    }
  }

  function handleReset() {
    setSajuResult(null); setAiText(''); setAiError('')
    setErrorMsg(''); setStatus('idle'); setIsSaved(false)
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
    } finally { setIsSaving(false) }
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

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">성별</label>
          <div className="flex gap-2">
            {(['male', 'female'] as const).map((g) => (
              <button key={g} type="button" onClick={() => setGender(g)}
                className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors ${gender === g ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-border bg-card text-muted-foreground hover:bg-muted/50'}`}>
                {g === 'male' ? '남성' : '여성'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" htmlFor="year">출생 연도</label>
          <input id="year" type="number" inputMode="numeric" placeholder="예) 1990"
            value={year} onChange={(e) => setYear(e.target.value)}
            min={1900} max={2020} required
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" />
        </div>

        <div className="flex gap-3">
          {[{ id: 'month', label: '월', value: month, set: setMonth, count: 12, unit: '월' },
            { id: 'day', label: '일', value: day, set: setDay, count: 31, unit: '일' }].map(({ id, label, value, set, count, unit }) => (
            <div key={id} className="flex flex-1 flex-col gap-1.5">
              <label className="text-sm font-medium" htmlFor={id}>{label}</label>
              <div className="relative">
                <select id={id} value={value} onChange={(e) => set(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  {Array.from({ length: count }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}{unit}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" htmlFor="hour">
            태어난 시간 <span className="font-normal text-muted-foreground">(선택)</span>
          </label>
          <div className="relative">
            <select id="hour" value={hourValue} onChange={(e) => setHourValue(e.target.value)}
              className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              {HOURS.map(({ label, value }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <button type="submit"
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80">
          사주 분석하기
        </button>
      </form>
    )
  }

  if (status === 'loading') {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <Loader2 size={28} className="animate-spin text-indigo-500" />
        <p className="text-sm text-muted-foreground">사주를 계산하는 중...</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col gap-4 px-4 py-5">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">사주 분석</h1>
          <button onClick={handleReset}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50">
            <RotateCcw size={12} /> 다시 하기
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
    <div className="flex flex-col gap-3 px-4 py-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">사주 분석 결과</h1>
        <button onClick={handleReset}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50">
          <RotateCcw size={12} /> 다시 하기
        </button>
      </div>

      {sajuResult && (
        <>
          {/* 사주 4기둥 — 항상 표시 */}
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

          {/* 일간 배지 — 항상 표시 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">일간(日干) — 사주의 주인공</span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ELEMENT_BG_LIGHT[sajuResult.dayMaster.element]} ${ELEMENT_TEXT_COLORS[sajuResult.dayMaster.element]}`}>
              {sajuResult.dayMaster.stem}({sajuResult.dayMaster.stemKorean}) · {sajuResult.dayMaster.element} {sajuResult.dayMaster.yinYang}
            </span>
          </div>

          {/* 접이식 알고리즘 섹션들 */}
          <ElementBalanceSection balance={sajuResult.elementBalance} />
          <TenGodsSection tenGods={sajuResult.tenGods} fourPillars={sajuResult.fourPillars} />
          <SipIunSeongSection sipIunSeong={sajuResult.sipIunSeong} fourPillars={sajuResult.fourPillars} />
          <GongMangSection gongMang={sajuResult.gongMang} />
          <DaewoonSection daewoon={sajuResult.daewoon} />

          {/* 구분선 */}
          <div className="flex items-center gap-3 my-1">
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

          {/* 저장 버튼 */}
          {status === 'done' && (
            <div className="rounded-xl border border-border bg-card p-4">
              {isLoggedIn ? (
                isSaved ? (
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-green-600">
                    <BookmarkCheck size={16} /> 보관함에 저장되었어요
                  </div>
                ) : (
                  <button onClick={handleSave} disabled={isSaving}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60">
                    {isSaving ? <Loader2 size={15} className="animate-spin" /> : <BookmarkCheck size={15} />}
                    {isSaving ? '저장 중...' : '보관함에 저장'}
                  </button>
                )
              ) : (
                <Link href="/login?callbackUrl=/saju"
                  className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <LogIn size={14} /> 로그인하면 분석 결과를 저장할 수 있어요
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
