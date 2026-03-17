// 사주 계산 엔진 — Public API
// Edge Runtime 완전 호환 (Node.js API 미사용)
export type { ElementName, TenGodName } from './constants'
import { BRANCHES, ELEMENT_NAMES, STEMS } from './constants'
import {
  countElements,
  getDayGanzhi,
  getHourBranchIndex,
  getHourStemIndex,
  getMonthBranchIndex,
  getMonthStemIndex,
  getTenGod,
  getYearGanzhi,
} from './calculator'
import type { ElementName, TenGodName } from './constants'

// ────────────────────────────────────────────────────────────────────────────
// 타입 정의
// ────────────────────────────────────────────────────────────────────────────

export interface SajuInput {
  /** 출생 연도 (예: 1990) */
  year: number
  /** 출생 월 (1–12) */
  month: number
  /** 출생 일 (1–31) */
  day: number
  /** 출생 시각 (0–23). 미입력 시 undefined → 시주 생략 */
  hour?: number
  /** 성별 (대운 방향 결정에 사용) */
  gender: 'male' | 'female'
}

export interface GanzhiInfo {
  stemIndex: number
  branchIndex: number
  /** 천간 한자 */
  stem: string
  /** 천간 한글 */
  stemKorean: string
  /** 지지 한자 */
  branch: string
  /** 지지 한글 */
  branchKorean: string
  /** 지지 띠 */
  zodiac: string
  /** 천간 오행 */
  stemElement: ElementName
  /** 지지 오행 */
  branchElement: ElementName
  /** 음양 (천간 기준) */
  yinYang: '양' | '음'
}

export interface FourPillars {
  year: GanzhiInfo
  month: GanzhiInfo
  day: GanzhiInfo
  hour: GanzhiInfo | null
}

export interface SajuResult {
  input: SajuInput
  fourPillars: FourPillars
  /** 일간 정보 (사주의 핵심 기준) */
  dayMaster: {
    stem: string
    stemKorean: string
    element: ElementName
    yinYang: '양' | '음'
  }
  /** 8자(또는 6자) 오행 분포 */
  elementBalance: Record<ElementName, number>
  /** 연·월·시주의 십신 (일주 천간 기준) */
  tenGods: {
    year: TenGodName
    month: TenGodName
    hour: TenGodName | null
  }
  /** AI 프롬프트용 텍스트 요약 */
  summary: string
}

// ────────────────────────────────────────────────────────────────────────────
// 헬퍼
// ────────────────────────────────────────────────────────────────────────────

function buildGanzhiInfo(stemIndex: number, branchIndex: number): GanzhiInfo {
  const stem = STEMS[stemIndex]
  const branch = BRANCHES[branchIndex]
  return {
    stemIndex,
    branchIndex,
    stem: stem.char,
    stemKorean: stem.korean,
    branch: branch.char,
    branchKorean: branch.korean,
    zodiac: branch.zodiac,
    stemElement: ELEMENT_NAMES[stem.element],
    branchElement: ELEMENT_NAMES[branch.element],
    yinYang: stem.yinYang === 0 ? '양' : '음',
  }
}

// ────────────────────────────────────────────────────────────────────────────
// 메인 함수
// ────────────────────────────────────────────────────────────────────────────

/**
 * 사주팔자를 계산합니다.
 *
 * @param input - 출생 정보 (연월일 필수, 시간·성별 선택)
 * @returns SajuResult — 사주 전체 정보 + AI 프롬프트용 요약
 *
 * @example
 * ```ts
 * const result = calculateSaju({ year: 1990, month: 6, day: 15, hour: 10, gender: 'male' })
 * console.log(result.summary) // "1990년 6월 15일 巳時생. 사주: 庚午年 甲午月 甲午日 丙巳時..."
 * ```
 */
export function calculateSaju(input: SajuInput): SajuResult {
  const { year, month, day, hour } = input

  // ── 연주 ──────────────────────────────────────────────────────────────────
  const [yearStemIdx, yearBranchIdx] = getYearGanzhi(year, month, day)
  const yearPillar = buildGanzhiInfo(yearStemIdx, yearBranchIdx)

  // ── 월주 ──────────────────────────────────────────────────────────────────
  const monthBranchIdx = getMonthBranchIndex(month, day)
  const monthStemIdx = getMonthStemIndex(yearStemIdx, monthBranchIdx)
  const monthPillar = buildGanzhiInfo(monthStemIdx, monthBranchIdx)

  // ── 일주 ──────────────────────────────────────────────────────────────────
  const [dayStemIdx, dayBranchIdx] = getDayGanzhi(year, month, day)
  const dayPillar = buildGanzhiInfo(dayStemIdx, dayBranchIdx)

  // ── 시주 (선택) ───────────────────────────────────────────────────────────
  let hourPillar: GanzhiInfo | null = null
  let hourStemIdx: number | null = null
  let hourBranchIdx: number | null = null

  if (hour !== undefined) {
    hourBranchIdx = getHourBranchIndex(hour)
    hourStemIdx = getHourStemIndex(dayStemIdx, hourBranchIdx)
    hourPillar = buildGanzhiInfo(hourStemIdx, hourBranchIdx)
  }

  // ── 오행 분포 ─────────────────────────────────────────────────────────────
  const counts = countElements(
    yearStemIdx,
    yearBranchIdx,
    monthStemIdx,
    monthBranchIdx,
    dayStemIdx,
    dayBranchIdx,
    hourStemIdx,
    hourBranchIdx,
  )
  const elementBalance = Object.fromEntries(
    ELEMENT_NAMES.map((name, i) => [name, counts[i]]),
  ) as Record<ElementName, number>

  // ── 십신 ──────────────────────────────────────────────────────────────────
  const tenGods = {
    year: getTenGod(dayStemIdx, yearStemIdx),
    month: getTenGod(dayStemIdx, monthStemIdx),
    hour: hourStemIdx !== null ? getTenGod(dayStemIdx, hourStemIdx) : null,
  }

  // ── 일간 ──────────────────────────────────────────────────────────────────
  const dayMasterStem = STEMS[dayStemIdx]
  const dayMaster = {
    stem: dayMasterStem.char,
    stemKorean: dayMasterStem.korean,
    element: ELEMENT_NAMES[dayMasterStem.element],
    yinYang: (dayMasterStem.yinYang === 0 ? '양' : '음') as '양' | '음',
  }

  // ── AI 프롬프트용 요약 ────────────────────────────────────────────────────
  const hourLabel = hourPillar ? `${hourPillar.branchKorean}시생` : '시간 미입력'
  const pillarsText = [
    `${yearPillar.stem}${yearPillar.branch}年`,
    `${monthPillar.stem}${monthPillar.branch}月`,
    `${dayPillar.stem}${dayPillar.branch}日`,
    hourPillar ? `${hourPillar.stem}${hourPillar.branch}時` : null,
  ]
    .filter(Boolean)
    .join(' ')

  const elemText = ELEMENT_NAMES.map((e) => `${e}${elementBalance[e]}`).join(' ')

  const tenGodText = [
    `연주 ${tenGods.year}`,
    `월주 ${tenGods.month}`,
    tenGods.hour ? `시주 ${tenGods.hour}` : null,
  ]
    .filter(Boolean)
    .join(', ')

  const summary =
    `${year}년 ${month}월 ${day}일 ${hourLabel}. ` +
    `사주: ${pillarsText}. ` +
    `일간 ${dayMaster.stem}${dayMaster.stemKorean}(${dayMaster.element} ${dayMaster.yinYang}). ` +
    `오행 분포: ${elemText}. ` +
    `십신: ${tenGodText}.`

  return {
    input,
    fourPillars: {
      year: yearPillar,
      month: monthPillar,
      day: dayPillar,
      hour: hourPillar,
    },
    dayMaster,
    elementBalance,
    tenGods,
    summary,
  }
}

// 편의 재출력
export { getTenGod, getYearGanzhi, getDayGanzhi } from './calculator'
export { STEMS, BRANCHES, ELEMENT_NAMES } from './constants'
