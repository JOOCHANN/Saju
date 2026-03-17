// 사주 핵심 계산 로직 — Edge Runtime 호환 (외부 의존성 없음)
import {
  BRANCHES,
  ELEMENT_CONTROLS,
  ELEMENT_GENERATES,
  SOLAR_TERM_STARTS,
  STEMS,
  type TenGodName,
} from './constants'

// ────────────────────────────────────────────────────────────────────────────
// 유틸
// ────────────────────────────────────────────────────────────────────────────

/** 그레고리력 → 율리우스 적일수(JDN) */
function toJDN(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12)
  const y = year + 4800 - a
  const m = month + 12 * a - 3
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  )
}

/** 음수 포함 모듈러 (항상 0 이상) */
function mod(n: number, m: number): number {
  return ((n % m) + m) % m
}

// ────────────────────────────────────────────────────────────────────────────
// 연주 (年柱)
// ────────────────────────────────────────────────────────────────────────────

/**
 * 연주 간지 인덱스를 반환합니다.
 * 입춘(2월 4일 근사) 이전 출생이면 전년도로 계산합니다.
 */
export function getYearGanzhi(
  year: number,
  month: number,
  day: number,
): [stemIndex: number, branchIndex: number] {
  // 입춘 이전(1월 전체 + 2월 1~3일)은 전년도 사주
  const sajuYear =
    month === 1 || (month === 2 && day < 4) ? year - 1 : year

  const stemIndex = mod(sajuYear + 6, 10)
  const branchIndex = mod(sajuYear + 8, 12)
  return [stemIndex, branchIndex]
}

// ────────────────────────────────────────────────────────────────────────────
// 월주 (月柱)
// ────────────────────────────────────────────────────────────────────────────

/**
 * 절기 기준 월지(月支) 인덱스를 반환합니다.
 * SOLAR_TERM_STARTS를 늦은 달 순으로 탐색해 해당 월지를 결정합니다.
 */
export function getMonthBranchIndex(month: number, day: number): number {
  for (const [branchIndex, startMonth, startDay] of SOLAR_TERM_STARTS) {
    if (month > startMonth || (month === startMonth && day >= startDay)) {
      return branchIndex
    }
  }
  // 1월 1~5일 → 子月 (전년 12월 7일 이후)
  return 0
}

/**
 * 오호둔법(五虎遁法)으로 월간(月干) 인덱스를 계산합니다.
 * 연간(年干)에 따라 寅月(월지 2)의 시작 천간이 결정됩니다.
 */
export function getMonthStemIndex(
  yearStemIndex: number,
  monthBranchIndex: number,
): number {
  // 甲己→丙(2), 乙庚→戊(4), 丙辛→庚(6), 丁壬→壬(8), 戊癸→甲(0)
  const monthStemBases = [2, 4, 6, 8, 0]
  const base = monthStemBases[yearStemIndex % 5]

  // 월지→월 오프셋: 寅(2)=0, 卯(3)=1, ..., 子(0)=10, 丑(1)=11
  const BRANCH_TO_MONTH_OFFSET: Record<number, number> = {
    2: 0,
    3: 1,
    4: 2,
    5: 3,
    6: 4,
    7: 5,
    8: 6,
    9: 7,
    10: 8,
    11: 9,
    0: 10,
    1: 11,
  }
  const offset = BRANCH_TO_MONTH_OFFSET[monthBranchIndex] ?? 0
  return mod(base + offset, 10)
}

// ────────────────────────────────────────────────────────────────────────────
// 일주 (日柱)
// ────────────────────────────────────────────────────────────────────────────

// 기준일: 2000년 1월 1일 = 庚午 (천간 6, 지지 6)
const JDN_REF = toJDN(2000, 1, 1)
const STEM_REF = 6
const BRANCH_REF = 6

/**
 * 일주 간지 인덱스를 반환합니다.
 * JDN 차이로 60갑자 사이클 내 위치를 계산합니다.
 */
export function getDayGanzhi(
  year: number,
  month: number,
  day: number,
): [stemIndex: number, branchIndex: number] {
  const jdn = toJDN(year, month, day)
  const diff = jdn - JDN_REF
  const stemIndex = mod(STEM_REF + diff, 10)
  const branchIndex = mod(BRANCH_REF + diff, 12)
  return [stemIndex, branchIndex]
}

// ────────────────────────────────────────────────────────────────────────────
// 시주 (時柱)
// ────────────────────────────────────────────────────────────────────────────

/**
 * 시각(0~23)으로 시지(時支) 인덱스를 반환합니다.
 * 23:00~00:59 = 子時(0), 이후 2시간 단위.
 */
export function getHourBranchIndex(hour: number): number {
  if (hour === 23) return 0 // 子時 (야자시)
  return Math.floor((hour + 1) / 2) % 12
}

/**
 * 오자둔법(五鼠遁法)으로 시간(時干) 인덱스를 계산합니다.
 * 일간(日干)에 따라 子時의 시작 천간이 결정됩니다.
 */
export function getHourStemIndex(
  dayStemIndex: number,
  hourBranchIndex: number,
): number {
  // 甲己→甲(0), 乙庚→丙(2), 丙辛→戊(4), 丁壬→庚(6), 戊癸→壬(8)
  const hourStemBases = [0, 2, 4, 6, 8]
  const base = hourStemBases[dayStemIndex % 5]
  return mod(base + hourBranchIndex, 10)
}

// ────────────────────────────────────────────────────────────────────────────
// 십신 (十神)
// ────────────────────────────────────────────────────────────────────────────

/**
 * 일간(dayStemIndex) 기준으로 대상 천간(targetStemIndex)의 십신을 반환합니다.
 */
export function getTenGod(
  dayStemIndex: number,
  targetStemIndex: number,
): TenGodName {
  const dayElem = STEMS[dayStemIndex].element
  const targetElem = STEMS[targetStemIndex].element
  const dayYY = STEMS[dayStemIndex].yinYang
  const targetYY = STEMS[targetStemIndex].yinYang
  const sameYY = dayYY === targetYY

  // 같은 오행: 비견/겁재
  if (dayElem === targetElem) return sameYY ? '비견' : '겁재'

  // 일간이 생(生)하는 오행: 식신/상관
  if (ELEMENT_GENERATES[dayElem] === targetElem) return sameYY ? '식신' : '상관'

  // 일간이 극(剋)하는 오행: 편재/정재
  if (ELEMENT_CONTROLS[dayElem] === targetElem) return sameYY ? '편재' : '정재'

  // 일간을 극(剋)하는 오행: 편관/정관
  if (ELEMENT_CONTROLS[targetElem] === dayElem) return sameYY ? '편관' : '정관'

  // 일간을 생(生)하는 오행: 편인/정인
  return sameYY ? '편인' : '정인'
}

// ────────────────────────────────────────────────────────────────────────────
// 오행 분포 집계
// ────────────────────────────────────────────────────────────────────────────

/**
 * 8자(천간4 + 지지4)의 오행 개수를 집계합니다.
 * hour가 없으면 6자 기준.
 */
export function countElements(
  yearStem: number,
  yearBranch: number,
  monthStem: number,
  monthBranch: number,
  dayStem: number,
  dayBranch: number,
  hourStem: number | null,
  hourBranch: number | null,
): number[] {
  const counts = [0, 0, 0, 0, 0] // 木火土金水

  const stems = [yearStem, monthStem, dayStem, ...(hourStem !== null ? [hourStem] : [])]
  const branches = [yearBranch, monthBranch, dayBranch, ...(hourBranch !== null ? [hourBranch] : [])]

  for (const si of stems) counts[STEMS[si].element]++
  for (const bi of branches) counts[BRANCHES[bi].element]++

  return counts
}
