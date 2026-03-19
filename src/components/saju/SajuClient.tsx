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

const ELEM_TEXT: Record<string, string> = {
  목: 'text-green-700', 화: 'text-red-700', 토: 'text-amber-700',
  금: 'text-gray-600', 수: 'text-blue-700',
}
const ELEM_BG: Record<string, string> = {
  목: 'bg-green-100', 화: 'bg-red-100', 토: 'bg-amber-100',
  금: 'bg-gray-100', 수: 'bg-blue-100',
}
const ELEM_BAR: Record<string, string> = {
  목: 'bg-green-500', 화: 'bg-red-500', 토: 'bg-amber-500',
  금: 'bg-gray-400', 수: 'bg-blue-500',
}
const ELEM_EMOJI: Record<string, string> = {
  목: '🌱', 화: '🔥', 토: '🪨', 금: '⚙️', 수: '💧',
}
const ELEM_MEANING: Record<string, string> = {
  목: '나무·성장·창의',화: '불·열정·표현',토: '흙·안정·신용',금: '금·결단·의리',수: '물·지혜·감성',
}
const TEN_GOD_DESC: Record<string, string> = {
  비견: '나와 비슷한 성격의 힘 — 독립심과 자존감이 강해요',
  겁재: '강한 경쟁심과 승부욕 — 추진력이 넘쳐요',
  식신: '타고난 재능과 표현력 — 먹고 살 복이 있어요',
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
  관대: '쑥쑥 성장하는 에너지 — 활기차고 발전하는 기운이에요',
  건록: '스스로 독립하는 힘 — 가장 왕성하게 활동하는 기운이에요',
  제왕: '최고의 전성기 기운 — 리더십이 빛나는 시기예요',
  쇠: '원숙하고 지혜로운 기운 — 경험에서 나오는 판단력이 있어요',
  병: '쉬고 성찰하는 기운 — 무리하지 말고 내실을 다지세요',
  사: '변화와 전환의 기운 — 새로운 준비를 시작하는 시기예요',
  묘: '힘을 저장하는 기운 — 조용히 내실을 쌓는 때예요',
  절: '새로 시작하는 기운 — 과거를 정리하고 재충전해요',
  태: '가능성의 씨앗 기운 — 아직 드러나지 않은 잠재력이 있어요',
  양: '천천히 자라나는 기운 — 서두르지 않고 꾸준히 성장해요',
}
// 천간별 대운 설명 (10개 — 같은 오행이라도 음양에 따라 다름)
const STEM_DAEWOON_DESC: Record<string, string> = {
  갑: '힘차게 뻗어나가는 나무처럼 새 도전을 시작하기 좋아요. 강한 추진력으로 목표를 향해 나아가는 시기예요.',
  을: '유연하게 구부러지는 풀처럼 적응력과 창의성이 빛나요. 주변과 조화를 이루며 조용히 성장하는 시기예요.',
  병: '태양처럼 밝고 강렬하게 빛나는 시기예요. 주목받고 인기를 얻기 쉬우며 사회적으로 활발해져요.',
  정: '촛불처럼 따뜻하고 섬세한 빛을 발해요. 내면의 열정을 키우고 깊은 인간관계가 형성되는 시기예요.',
  무: '높은 산처럼 든든하게 기반을 다지는 시기예요. 신뢰와 안정을 쌓으며 중심을 잡아가는 때예요.',
  기: '비옥한 흙처럼 조용히 준비하고 키워나가는 시기예요. 서두르지 않고 내실을 다지는 게 중요해요.',
  경: '날카로운 도끼처럼 결단하고 변화를 이끄는 시기예요. 과감한 결정이 필요하고 새 전환점이 찾아와요.',
  신: '보석처럼 정제되고 빛나는 시기예요. 섬세함과 집중력이 돋보이며 자기 관리가 빛을 발해요.',
  임: '큰 강처럼 힘차게 흐르는 시기예요. 변화의 물결을 타며 새 기회가 열리고 시야가 넓어져요.',
  계: '조용히 스며드는 빗물처럼 깊은 성찰과 지혜가 쌓이는 시기예요. 내면을 돌보고 직관을 키워가요.',
}

// 오행 개수 기반 개인화 설명
function getElemStrengthDesc(elem: string, count: number, total: number): string {
  const ratio = total > 0 ? count / total : 0
  if (count === 0) {
    const m: Record<string, string> = {
      목: '목(나무) 기운이 없어요. 유연성·추진력이 약할 수 있으니 의도적으로 성장 마인드를 키워보세요.',
      화: '화(불) 기운이 없어요. 열정·표현력이 약할 수 있으니 자신감을 키우는 활동이 도움돼요.',
      토: '토(흙) 기운이 없어요. 안정감·신뢰감이 약할 수 있으니 꾸준함을 의식적으로 실천해보세요.',
      금: '금(금속) 기운이 없어요. 결단력·정확성이 약할 수 있으니 명확한 목표 설정이 중요해요.',
      수: '수(물) 기운이 없어요. 지혜·감수성이 약할 수 있으니 직관을 키우는 활동을 해보세요.',
    }
    return m[elem] ?? ''
  }
  if (ratio >= 0.375) {
    const m: Record<string, string> = {
      목: `목(나무) 기운이 강해요(${count}개). 창의성과 도전 정신이 넘치지만, 지나치면 고집스럽거나 참을성이 부족할 수 있어요.`,
      화: `화(불) 기운이 강해요(${count}개). 열정과 표현력이 넘치지만, 지나치면 급하거나 감정 기복이 커질 수 있어요.`,
      토: `토(흙) 기운이 강해요(${count}개). 안정감과 신뢰감이 뛰어나지만, 지나치면 변화에 너무 느리게 반응할 수 있어요.`,
      금: `금(금속) 기운이 강해요(${count}개). 결단력과 의리가 강하지만, 지나치면 고집이 세거나 날카로울 수 있어요.`,
      수: `수(물) 기운이 강해요(${count}개). 지혜와 감수성이 풍부하지만, 지나치면 걱정이 많거나 우유부단해질 수 있어요.`,
    }
    return m[elem] ?? ''
  }
  const m: Record<string, string> = {
    목: `목(나무) 기운이 ${count}개예요. 성장·창의성이 균형 잡혀 있어요. 도전을 즐기면서도 무리하지 않는 편이에요.`,
    화: `화(불) 기운이 ${count}개예요. 열정과 표현력이 균형 잡혀 있어요. 적당히 활기차고 표현을 잘 하는 편이에요.`,
    토: `토(흙) 기운이 ${count}개예요. 안정감이 균형 잡혀 있어요. 꾸준함과 변화 사이에서 잘 조율하는 편이에요.`,
    금: `금(금속) 기운이 ${count}개예요. 결단력이 균형 잡혀 있어요. 필요할 때 과감하게 결정하는 힘이 있어요.`,
    수: `수(물) 기운이 ${count}개예요. 지혜와 감수성이 균형 잡혀 있어요. 상황을 잘 파악하고 유연하게 대처해요.`,
  }
  return m[elem] ?? ''
}

type Status = 'idle' | 'loading' | 'streaming' | 'done' | 'error'

// ────────────────────────────────────────────────────────────────────────────
// 공통 Chip 컴포넌트
// ────────────────────────────────────────────────────────────────────────────

function Chip({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${className}`}>
      {children}
    </span>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// 공통 접이식 카드
// ────────────────────────────────────────────────────────────────────────────

function CollapsibleCard({
  icon, title, titleSub, chips, children,
}: {
  icon: string
  title: string
  titleSub?: string
  chips: React.ReactNode
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 px-4 py-4 text-left"
      >
        <span className="text-xl shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-1.5">
            <span className="text-sm font-semibold text-foreground">{title}</span>
            {titleSub && (
              <span className="text-[10px] text-muted-foreground">{titleSub}</span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-1">{chips}</div>
        </div>
        <ChevronDown
          size={16}
          className={`mt-1 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="border-t border-border/60 bg-muted/20 px-4 pb-4 pt-3">
          {children}
        </div>
      )}
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// 사주 4기둥 카드
// ────────────────────────────────────────────────────────────────────────────

function PillarCard({ label, pillar }: { label: string; pillar: SajuResult['fourPillars']['year'] }) {
  const e = pillar.stemElement
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card px-2 py-3 shadow-sm">
      <span className="text-[10px] font-semibold text-muted-foreground">{label}</span>
      <span className={`text-2xl font-bold ${ELEM_TEXT[e] ?? 'text-foreground'}`}>{pillar.stem}</span>
      <span className="text-xl font-semibold text-foreground">{pillar.branch}</span>
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ELEM_BG[e]} ${ELEM_TEXT[e]}`}>
        {e}
      </span>
      <span className="text-[10px] text-muted-foreground">{pillar.stemKorean}{pillar.branchKorean}</span>
      <span className="text-[10px] text-muted-foreground">{pillar.zodiac}띠</span>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// 알고리즘 섹션들
// ────────────────────────────────────────────────────────────────────────────

function ElementBalanceSection({ balance }: { balance: SajuResult['elementBalance'] }) {
  const total = Object.values(balance).reduce((a, b) => a + b, 0)
  const chips = (
    <>
      {ELEMENT_NAMES.map((e) => (
        <Chip key={e} className={`${ELEM_BG[e]} ${ELEM_TEXT[e]}`}>
          {ELEM_EMOJI[e]} {e} {balance[e]}/{total}
        </Chip>
      ))}
    </>
  )
  return (
    <CollapsibleCard icon="☯️" title="오행 분포" titleSub="나를 구성하는 5가지 에너지" chips={chips}>
      <div className="space-y-3">
        {ELEMENT_NAMES.map((e) => {
          const pct = total > 0 ? (balance[e] / total) * 100 : 0
          return (
            <div key={e}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm w-5">{ELEM_EMOJI[e]}</span>
                <span className={`text-xs font-semibold w-4 ${ELEM_TEXT[e]}`}>{e}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className={`h-full rounded-full transition-all duration-700 ${ELEM_BAR[e]}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">{balance[e]}/{total}</span>
              </div>
              <p className="text-[11px] text-muted-foreground pl-10 mb-0.5">{ELEM_MEANING[e]}</p>
              <p className="text-[11px] leading-relaxed pl-10" style={{ color: balance[e] === 0 ? '#9ca3af' : undefined }}>
                {getElemStrengthDesc(e, balance[e], total)}
              </p>
            </div>
          )
        })}
      </div>
    </CollapsibleCard>
  )
}

function TenGodsSection({ tenGods, fourPillars }: {
  tenGods: SajuResult['tenGods']; fourPillars: SajuResult['fourPillars']
}) {
  const items = [
    { label: '年', god: tenGods.year, pillar: fourPillars.year },
    { label: '月', god: tenGods.month, pillar: fourPillars.month },
    { label: '時', god: tenGods.hour, pillar: fourPillars.hour },
  ].filter((i) => i.god !== null && i.pillar !== null)

  const chips = (
    <>
      {items.map(({ label, god }) => (
        <Chip key={label} className="bg-indigo-100 text-indigo-700">
          {label}柱 {god}
        </Chip>
      ))}
    </>
  )
  return (
    <CollapsibleCard icon="🔮" title="십신 (十神)" titleSub="각 기둥이 나에게 미치는 역할" chips={chips}>
      <div className="rounded-xl bg-indigo-50 p-3 text-[11px] leading-relaxed text-indigo-800 mb-3">
        💡 일간(나)을 기준으로 다른 기둥들이 재물·명예·가족 등 어떤 역할을 하는지 보여줘요.
      </div>
      <div className="space-y-2">
        {items.map(({ label, god, pillar }) => (
          <div key={label} className="flex items-start gap-3 rounded-xl bg-white p-3 shadow-sm">
            <div className="flex flex-col items-center min-w-[44px]">
              <span className="text-[10px] text-muted-foreground">{label}柱</span>
              <span className="text-base font-bold">{pillar!.stem}{pillar!.branch}</span>
              <span className="text-[10px] text-muted-foreground">{pillar!.stemKorean}{pillar!.branchKorean}</span>
            </div>
            <div className="flex-1">
              <Chip className="bg-indigo-100 text-indigo-700 mb-1.5">{god}</Chip>
              <p className="text-xs leading-relaxed text-foreground">{TEN_GOD_DESC[god as string] ?? ''}</p>
            </div>
          </div>
        ))}
      </div>
    </CollapsibleCard>
  )
}

function SipIunSeongSection({ sipIunSeong, fourPillars }: {
  sipIunSeong: SajuResult['sipIunSeong']; fourPillars: SajuResult['fourPillars']
}) {
  const items = [
    { label: '年', stage: sipIunSeong.year, pillar: fourPillars.year },
    { label: '月', stage: sipIunSeong.month, pillar: fourPillars.month },
    { label: '日', stage: sipIunSeong.day, pillar: fourPillars.day },
    { label: '時', stage: sipIunSeong.hour, pillar: fourPillars.hour },
  ].filter((i) => i.stage !== null)

  const chips = (
    <>
      {items.map(({ label, stage }) => (
        <Chip key={label} className="bg-amber-100 text-amber-700">
          {label}柱 {stage}
        </Chip>
      ))}
    </>
  )
  return (
    <CollapsibleCard icon="🌀" title="십이운성 (十二運星)" titleSub="내 기운의 생애 주기 단계" chips={chips}>
      <div className="rounded-xl bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-800 mb-3">
        💡 기운도 사람처럼 태어나고 자라고 쉬고 다시 태어나는 12단계를 거쳐요. 각 기둥이 어떤 단계인지 알 수 있어요.
      </div>
      <div className="space-y-2">
        {items.map(({ label, stage, pillar }) => (
          <div key={label} className="flex items-start gap-3 rounded-xl bg-white p-3 shadow-sm">
            <div className="flex flex-col items-center min-w-[44px]">
              <span className="text-[10px] text-muted-foreground">{label}柱</span>
              <span className="text-base font-bold">{pillar!.stem}{pillar!.branch}</span>
              <span className="text-[10px] text-muted-foreground">{pillar!.stemKorean}{pillar!.branchKorean}</span>
            </div>
            <div className="flex-1">
              <Chip className="bg-amber-100 text-amber-700 mb-1.5">{stage}</Chip>
              <p className="text-xs leading-relaxed text-foreground">{SIP_IUN_DESC[stage as string] ?? ''}</p>
            </div>
          </div>
        ))}
      </div>
    </CollapsibleCard>
  )
}

function GongMangSection({ gongMang }: { gongMang: SajuResult['gongMang'] }) {
  const chips = (
    <>
      {gongMang.map((b, i) => (
        <Chip key={i} className="bg-gray-100 text-gray-700">
          {BRANCHES[b].char} {BRANCHES[b].korean} ({BRANCHES[b].zodiac}띠)
        </Chip>
      ))}
    </>
  )
  return (
    <CollapsibleCard icon="🕳️" title="공망 (空亡)" titleSub="기운이 빈 지지" chips={chips}>
      <div className="flex gap-2 mb-3">
        {gongMang.map((b, i) => (
          <div key={i} className="flex flex-col items-center rounded-xl bg-white px-4 py-2.5 shadow-sm border border-border">
            <span className="text-2xl font-bold text-gray-600">{BRANCHES[b].char}</span>
            <span className="text-xs text-muted-foreground">{BRANCHES[b].korean} ({BRANCHES[b].zodiac}띠)</span>
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-gray-50 p-3 text-[11px] leading-relaxed text-gray-700 space-y-1.5">
        <p>📌 공망이란 사주에서 기운이 <strong>비어버린</strong> 지지를 말해요.</p>
        <p>이 띠 해이거나 이 띠 해에 태어난 인연은 깊어도 결국 떠나거나 허무하게 끝나는 경우가 있어요.</p>
        <p>금전·명예보다 <strong>정신적 성장과 내면의 충실함</strong>에 집중하는 게 훨씬 이로워요.</p>
        <p>나쁜 것만은 아니에요 — 세속적인 것에 얽매이지 않고 자유롭게 살아갈 수 있는 기질이기도 해요.</p>
      </div>
    </CollapsibleCard>
  )
}

function DaewoonSection({ daewoon, birthYear }: { daewoon: SajuResult['daewoon']; birthYear: number }) {
  const currentYear = new Date().getFullYear()
  const currentAge = currentYear - birthYear
  const items = daewoon.slice(0, 6)

  // 현재 해당하는 대운 인덱스 찾기
  const currentIdx = items.reduce((found, dw, i) => {
    const nextStart = items[i + 1]?.startAge ?? Infinity
    return currentAge >= dw.startAge && currentAge < nextStart ? i : found
  }, -1)

  const chips = (
    <>
      {items.slice(0, 4).map((dw, i) => {
        const e = ELEMENT_NAMES[STEMS[dw.stemIndex].element]
        const isCurrent = i === currentIdx
        return (
          <Chip key={i} className={isCurrent ? 'bg-indigo-600 text-white font-bold' : `${ELEM_BG[e]} ${ELEM_TEXT[e]}`}>
            {isCurrent ? '▶ ' : ''}{dw.startAge}세 {STEMS[dw.stemIndex].korean}{BRANCHES[dw.branchIndex].korean}
          </Chip>
        )
      })}
      {items.length > 4 && <Chip className="bg-muted text-muted-foreground">+{items.length - 4}개</Chip>}
    </>
  )
  return (
    <CollapsibleCard icon="🌊" title="대운 (大運)" titleSub="10년 단위로 바뀌는 큰 운의 흐름" chips={chips}>
      <div className="rounded-xl bg-blue-50 p-3 text-[11px] leading-relaxed text-blue-800 mb-3">
        💡 대운은 10년마다 바뀌는 큰 운이에요. 천간(위 글자)의 기운에 따라 그 시기에 집중해야 할 것들이 달라져요.
        {currentIdx >= 0 && (
          <span className="ml-1 font-semibold">지금은 <span className="text-indigo-700">{items[currentIdx].startAge}세 대운</span>이에요.</span>
        )}
      </div>
      <div className="space-y-2">
        {items.map((dw, i) => {
          const stemE = ELEMENT_NAMES[STEMS[dw.stemIndex].element]
          const branchE = ELEMENT_NAMES[BRANCHES[dw.branchIndex].element]
          const stemKorean = STEMS[dw.stemIndex].korean
          const isCurrent = i === currentIdx
          const stemDesc = STEM_DAEWOON_DESC[stemKorean] ?? ''
          return (
            <div key={i} className={`rounded-xl p-3 shadow-sm border ${isCurrent ? 'border-indigo-400 bg-indigo-50' : 'border-border bg-white'}`}>
              {isCurrent && (
                <div className="flex items-center gap-1 mb-2">
                  <span className="inline-flex items-center rounded-full bg-indigo-600 px-2.5 py-0.5 text-[11px] font-bold text-white">▶ 현재 내 대운</span>
                  <span className="text-[10px] text-indigo-600">({currentAge}세)</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center min-w-[52px]">
                  <span className="text-[10px] font-semibold text-muted-foreground">{dw.startAge}세~</span>
                  <span className={`text-xl font-bold ${ELEM_TEXT[stemE]}`}>{STEMS[dw.stemIndex].char}</span>
                  <span className="text-lg font-semibold text-foreground">{BRANCHES[dw.branchIndex].char}</span>
                  <span className="text-[10px] text-muted-foreground">{stemKorean}{BRANCHES[dw.branchIndex].korean}</span>
                </div>
                <div className="flex-1">
                  <div className="flex gap-1 mb-1.5 flex-wrap">
                    <Chip className={`${ELEM_BG[stemE]} ${ELEM_TEXT[stemE]}`}>천간 {stemKorean}({stemE})</Chip>
                    <Chip className={`${ELEM_BG[branchE]} ${ELEM_TEXT[branchE]}`}>지지 {branchE}</Chip>
                  </div>
                  <p className="text-[11px] leading-relaxed text-foreground">{stemDesc}</p>
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
// AI 해석 섹션
// ────────────────────────────────────────────────────────────────────────────

interface AiSection { title: string; summary: string; bullets: string[]; body: string[] }

function parseAiText(text: string): AiSection[] {
  const sections: AiSection[] = []
  let cur: AiSection | null = null
  for (const line of text.split('\n')) {
    if (line.startsWith('## ')) {
      if (cur) sections.push(cur)
      cur = { title: line.slice(3).trim(), summary: '', bullets: [], body: [] }
    } else if (cur) {
      const m = line.match(/^\*\*요약\*\*[:：]\s*(.+)/)
      if (m) cur.summary = m[1].trim()
      else if (line.startsWith('- ')) cur.bullets.push(line.slice(2).trim())
      else if (line.trim()) cur.body.push(line.trim())
    }
  }
  if (cur) sections.push(cur)
  return sections
}

const AI_THEME: Record<string, { bg: string; border: string; title: string; badge: string; icon: string }> = {
  연애운:           { bg: 'bg-pink-50',   border: 'border-pink-100',   title: 'text-pink-700',   badge: 'bg-pink-100 text-pink-700',   icon: '💕' },
  결혼운:           { bg: 'bg-purple-50', border: 'border-purple-100', title: 'text-purple-700', badge: 'bg-purple-100 text-purple-700', icon: '💍' },
  금전운:           { bg: 'bg-yellow-50', border: 'border-yellow-100', title: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700', icon: '💰' },
  직업운:           { bg: 'bg-blue-50',   border: 'border-blue-100',   title: 'text-blue-700',   badge: 'bg-blue-100 text-blue-700',   icon: '💼' },
  건강운:           { bg: 'bg-green-50',  border: 'border-green-100',  title: 'text-green-700',  badge: 'bg-green-100 text-green-700',  icon: '🌿' },
  '이 사주의 핵심 조언': { bg: 'bg-indigo-50', border: 'border-indigo-100', title: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-700', icon: '✨' },
}

function AiSectionCard({ section, isLast, isStreaming }: {
  section: AiSection; isLast: boolean; isStreaming: boolean
}) {
  const [open, setOpen] = useState(isLast)
  const theme = AI_THEME[section.title] ?? { bg: 'bg-muted', border: 'border-border', title: 'text-foreground', badge: 'bg-muted text-foreground', icon: '📌' }
  const isCoreAdvice = section.title === '이 사주의 핵심 조언'

  return (
    <div className={`overflow-hidden rounded-2xl border ${theme.border} ${theme.bg} shadow-sm`}>
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left">
        <span className="text-xl shrink-0">{theme.icon}</span>
        <div className="flex-1 min-w-0">
          <span className={`text-sm font-bold ${theme.title}`}>{section.title}</span>
          {section.summary ? (
            <p className="mt-0.5 text-xs font-medium text-foreground/80 leading-snug">{section.summary}</p>
          ) : isStreaming && isLast ? (
            <span className="inline-block h-3 w-0.5 animate-pulse bg-current opacity-60 ml-1" />
          ) : null}
        </div>
        <ChevronDown size={15} className={`mt-1 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-white/60 bg-white/60 px-4 pb-4 pt-3">
          {isCoreAdvice && section.bullets.length > 0 ? (
            <ul className="space-y-2">
              {section.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-foreground">
                  <span className={`mt-1 shrink-0 h-1.5 w-1.5 rounded-full ${theme.badge.split(' ')[0]}`} />
                  <span>{b}</span>
                </li>
              ))}
              {isStreaming && isLast && <span className="inline-block h-4 w-0.5 animate-pulse bg-indigo-400" />}
            </ul>
          ) : (
            <div className="space-y-2">
              {section.body.map((line, i) => (
                <p key={i} className="text-sm leading-relaxed text-foreground">{line}</p>
              ))}
              {section.bullets.map((b, i) => (
                <div key={`b${i}`} className="flex items-start gap-2 text-sm leading-relaxed text-foreground">
                  <span className={`mt-1.5 shrink-0 h-1.5 w-1.5 rounded-full ${theme.badge.split(' ')[0]}`} />
                  <span>{b}</span>
                </div>
              ))}
              {isStreaming && isLast && <span className="inline-block h-4 w-0.5 animate-pulse opacity-60" />}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AiInterpretation({ text, isStreaming, isDone, error }: {
  text: string; isStreaming: boolean; isDone: boolean; error: string
}) {
  const sections = parseAiText(text)
  return (
    <div>
      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
      {!error && sections.length > 0 && (
        <div className="space-y-2">
          {sections.map((s, i) => (
            <AiSectionCard key={s.title} section={s} isLast={i === sections.length - 1} isStreaming={isStreaming} />
          ))}
        </div>
      )}
      {!error && !text && isStreaming && (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-8 text-sm text-muted-foreground">
          <Loader2 size={16} className="animate-spin" />
          <span>사주를 해석하는 중이에요...</span>
        </div>
      )}
      {!error && !text && isDone && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground text-center">AI 해석을 불러올 수 없어요.</p>
        </div>
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
    const y = parseInt(year), m = parseInt(month), d = parseInt(day)
    const hour = hourValue !== '' ? parseInt(hourValue) : undefined
    if (isNaN(y) || y < 1900 || y > 2020) return
    setAiText(''); setAiError(''); setErrorMsg(''); setSajuResult(null); setStatus('loading')
    try {
      const res = await fetch('/api/saju/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
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
        const lines = buffer.split('\n'); buffer = lines.pop() ?? ''
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
            else if (evt.type === 'text') setAiText((p) => p + evt.text)
            else if (evt.type === 'ai_error') setAiError('AI 해석 오류: ' + evt.message)
          } catch { /* ignore */ }
        }
      }
      setStatus('done')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '분석 중 오류가 발생했어요.')
      setStatus('error')
    }
  }

  function handleReset() {
    setSajuResult(null); setAiText(''); setAiError(''); setErrorMsg(''); setStatus('idle'); setIsSaved(false)
  }

  async function handleSave() {
    if (!sajuResult || isSaving || isSaved) return
    setIsSaving(true)
    try {
      const res = await fetch('/api/readings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
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
          <p className="mt-1 text-sm text-muted-foreground">생년월일을 입력하면 사주팔자와 운세 해석을 알려드려요</p>
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
            value={year} onChange={(e) => setYear(e.target.value)} min={1900} max={2020} required
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ring-offset-background" />
        </div>
        <div className="flex gap-3">
          {[{ id: 'month', label: '월', value: month, set: setMonth, count: 12, unit: '월' },
            { id: 'day',   label: '일', value: day,   set: setDay,   count: 31, unit: '일' }].map(({ id, label, value, set, count, unit }) => (
            <div key={id} className="flex flex-1 flex-col gap-1.5">
              <label className="text-sm font-medium" htmlFor={id}>{label}</label>
              <div className="relative">
                <select id={id} value={value} onChange={(e) => set(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ring-offset-background">
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
              className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ring-offset-background">
              {HOURS.map(({ label, value }) => <option key={value} value={value}>{label}</option>)}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
        <button type="submit"
          className="mt-2 flex w-full items-center justify-center rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80">
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
          <button onClick={handleReset} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50">
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
        <button onClick={handleReset} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50">
          <RotateCcw size={12} /> 다시 하기
        </button>
      </div>

      {sajuResult && (
        <>
          {/* 4기둥 */}
          <div className="grid grid-cols-4 gap-2">
            <PillarCard label="年柱" pillar={sajuResult.fourPillars.year} />
            <PillarCard label="月柱" pillar={sajuResult.fourPillars.month} />
            <PillarCard label="日柱" pillar={sajuResult.fourPillars.day} />
            {sajuResult.fourPillars.hour ? (
              <PillarCard label="時柱" pillar={sajuResult.fourPillars.hour} />
            ) : (
              <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-border px-2 py-3">
                <span className="text-xs text-muted-foreground">時柱</span>
                <span className="text-xs text-muted-foreground">미입력</span>
              </div>
            )}
          </div>

          {/* 일간 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">일간(日干) — 사주의 주인공</span>
            <Chip className={`${ELEM_BG[sajuResult.dayMaster.element]} ${ELEM_TEXT[sajuResult.dayMaster.element]} font-semibold`}>
              {sajuResult.dayMaster.stem}({sajuResult.dayMaster.stemKorean}) · {sajuResult.dayMaster.element} {sajuResult.dayMaster.yinYang}
            </Chip>
          </div>

          {/* 접이식 알고리즘 섹션 */}
          <ElementBalanceSection balance={sajuResult.elementBalance} />
          <TenGodsSection tenGods={sajuResult.tenGods} fourPillars={sajuResult.fourPillars} />
          <SipIunSeongSection sipIunSeong={sajuResult.sipIunSeong} fourPillars={sajuResult.fourPillars} />
          <GongMangSection gongMang={sajuResult.gongMang} />
          <DaewoonSection daewoon={sajuResult.daewoon} birthYear={sajuResult.input.year} />

          {/* 구분선 */}
          <div className="flex items-center gap-3 my-1">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-muted-foreground">운세 해석</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* AI 해석 */}
          <AiInterpretation text={aiText} isStreaming={status === 'streaming'} isDone={status === 'done'} error={aiError} />

          {/* 저장 */}
          {status === 'done' && (
            <div className="rounded-2xl border border-border bg-card p-4">
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
