// 사주 핵심 계산 로직 — Edge Runtime 호환 (외부 의존성 없음)
import {
  BRANCHES,
  ELEMENT_CONTROLS,
  ELEMENT_GENERATES,
  JANG_SAENG_BRANCHES,
  JI_JANG_GAN,
  SAMHAP_GROUP,
  SINSAL_BY_GROUP,
  SOLAR_TERM_STARTS,
  STEMS,
  type SipIunSeongName,
  SIP_IUN_SEONG_NAMES,
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
// 지장간 (支藏干)
// ────────────────────────────────────────────────────────────────────────────

/**
 * 지지 인덱스에 해당하는 지장간(숨겨진 천간) 배열을 반환합니다.
 * 반환 형식: [여기?, 중기?, 본기] — 마지막 원소가 본기(主氣)
 */
export function getJiJangGan(branchIndex: number): readonly number[] {
  return JI_JANG_GAN[branchIndex]
}

// ────────────────────────────────────────────────────────────────────────────
// 십이운성 (十二運星)
// ────────────────────────────────────────────────────────────────────────────

/**
 * 천간(stemIndex)이 특정 지지(branchIndex)에서 갖는 십이운성 단계 인덱스를 반환합니다.
 * 양간(짝수): 순행(+1), 음간(홀수): 역행(-1)
 * 반환값: 0=장생 … 11=양
 */
export function getSipIunSeongIndex(stemIndex: number, branchIndex: number): number {
  const jangSaeng = JANG_SAENG_BRANCHES[stemIndex]
  const direction = stemIndex % 2 === 0 ? 1 : -1
  return mod((branchIndex - jangSaeng) * direction, 12)
}

/**
 * 십이운성 이름을 반환합니다.
 */
export function getSipIunSeongName(stemIndex: number, branchIndex: number): SipIunSeongName {
  return SIP_IUN_SEONG_NAMES[getSipIunSeongIndex(stemIndex, branchIndex)]
}

// ────────────────────────────────────────────────────────────────────────────
// 공망 (空亡)
// ────────────────────────────────────────────────────────────────────────────

/**
 * 간지 쌍(stemIndex, branchIndex)의 공망 지지 두 개를 반환합니다.
 * 60갑자에서 천간은 10개, 지지는 12개이므로 순(旬)당 2개 지지가 비게 됩니다.
 * 공식: 순두지지 b0 = mod(branchIndex - stemIndex, 12)
 *       공망 = [mod(b0+10, 12), mod(b0+11, 12)]
 */
export function getGongMang(stemIndex: number, branchIndex: number): [number, number] {
  const b0 = mod(branchIndex - stemIndex, 12)
  return [mod(b0 + 10, 12), mod(b0 + 11, 12)]
}

// ────────────────────────────────────────────────────────────────────────────
// 신살 (神殺)
// ────────────────────────────────────────────────────────────────────────────

export interface Sinsal {
  /** 도화살(桃花殺): 매력·이성운 */
  dohwa: number
  /** 역마살(驛馬殺): 이동·변화 */
  yeokma: number
  /** 화개살(華蓋殺): 예술·종교·고독 */
  hwagae: number
}

/**
 * 기준 지지(일반적으로 년지 또는 일지)를 바탕으로 신살 지지를 반환합니다.
 * 삼합(三合) 그룹 기반: 寅午戌/申子辰/巳酉丑/亥卯未
 */
export function getSinsal(refBranchIndex: number): Sinsal {
  const group = SAMHAP_GROUP[refBranchIndex]
  const [dohwa, yeokma, hwagae] = SINSAL_BY_GROUP[group]
  return { dohwa, yeokma, hwagae }
}

// ────────────────────────────────────────────────────────────────────────────
// 대운 (大運)
// ────────────────────────────────────────────────────────────────────────────

export interface DaewoonPillar {
  /** 대운 시작 나이 (만 나이 근사) */
  startAge: number
  stemIndex: number
  branchIndex: number
}

/**
 * 절기 근사 날짜를 JDN으로 반환합니다 (SOLAR_TERM_STARTS 기반, ±1~2일 오차).
 * SOLAR_TERM_STARTS: [branchIndex, startMonth, startDay] — 늦은 달 순 정렬
 */
function getSolarTermJDN(year: number, startMonth: number, startDay: number): number {
  // 대설(12월)이 전년 기준인 경우 이미 SOLAR_TERM_STARTS에서 처리됨
  return toJDN(year, startMonth, startDay)
}

/**
 * 출생일 직전 절기와 직후 절기의 JDN을 구합니다.
 * SOLAR_TERM_STARTS는 늦은 달 → 이른 달 순 정렬이므로 탐색 순서 주의.
 */
function getNearestSolarTerms(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
): { prevJDN: number; nextJDN: number } {
  const birthJDN = toJDN(birthYear, birthMonth, birthDay)

  // 당해 + 전후 2년치 절기 목록 (JDN 오름차순)
  const terms: number[] = []
  for (let y = birthYear - 1; y <= birthYear + 1; y++) {
    for (const [, sm, sd] of SOLAR_TERM_STARTS) {
      const jdn = getSolarTermJDN(y, sm, sd)
      terms.push(jdn)
    }
  }
  terms.sort((a, b) => a - b)

  // 출생일 직전/직후 절기 탐색
  let prevJDN = terms[0]
  let nextJDN = terms[terms.length - 1]
  for (const jdn of terms) {
    if (jdn < birthJDN) prevJDN = jdn
    if (jdn > birthJDN && nextJDN === terms[terms.length - 1]) nextJDN = jdn
  }
  return { prevJDN, nextJDN }
}

/**
 * 대운(大運) 8개를 계산합니다.
 *
 * @param yearStemIndex - 연간 인덱스 (음양 판단용)
 * @param monthStemIndex - 월간 인덱스
 * @param monthBranchIndex - 월지 인덱스
 * @param birthYear / birthMonth / birthDay - 출생일
 * @param gender - 'male' | 'female'
 * @param count - 생성할 대운 수 (기본 8개)
 */
export function getDaewoon(
  yearStemIndex: number,
  monthStemIndex: number,
  monthBranchIndex: number,
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  gender: 'male' | 'female',
  count = 8,
): DaewoonPillar[] {
  // 연간이 양간(짝수)이면 양년, 음간(홀수)이면 음년
  const isYangYear = yearStemIndex % 2 === 0

  // 순행: 남+양년 또는 여+음년 / 역행: 남+음년 또는 여+양년
  const isForward =
    (gender === 'male' && isYangYear) || (gender === 'female' && !isYangYear)
  const direction = isForward ? 1 : -1

  // 대운 시작 나이 계산 (3일 = 1년)
  const { prevJDN, nextJDN } = getNearestSolarTerms(birthYear, birthMonth, birthDay)
  const birthJDN = toJDN(birthYear, birthMonth, birthDay)
  const daysToTerm = isForward ? nextJDN - birthJDN : birthJDN - prevJDN
  const startAge = Math.round(daysToTerm / 3)

  // 대운 간지 생성 (월주 기준으로 ±1씩 진행)
  const pillars: DaewoonPillar[] = []
  for (let i = 0; i < count; i++) {
    const offset = direction * (i + 1)
    pillars.push({
      startAge: startAge + i * 10,
      stemIndex: mod(monthStemIndex + offset, 10),
      branchIndex: mod(monthBranchIndex + offset, 12),
    })
  }
  return pillars
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
