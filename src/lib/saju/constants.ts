// 사주 계산 상수 정의

export interface StemData {
  char: string // 한자 (甲, 乙, ...)
  korean: string // 한글 (갑, 을, ...)
  element: number // 오행 인덱스: 0=木,1=火,2=土,3=金,4=水
  yinYang: 0 | 1 // 0=양(陽), 1=음(陰)
}

export interface BranchData {
  char: string
  korean: string
  element: number
  yinYang: 0 | 1
  zodiac: string // 띠 한글
}

// 천간 (十天干) — 甲乙丙丁戊己庚辛壬癸
export const STEMS: StemData[] = [
  { char: '甲', korean: '갑', element: 0, yinYang: 0 }, // 0
  { char: '乙', korean: '을', element: 0, yinYang: 1 }, // 1
  { char: '丙', korean: '병', element: 1, yinYang: 0 }, // 2
  { char: '丁', korean: '정', element: 1, yinYang: 1 }, // 3
  { char: '戊', korean: '무', element: 2, yinYang: 0 }, // 4
  { char: '己', korean: '기', element: 2, yinYang: 1 }, // 5
  { char: '庚', korean: '경', element: 3, yinYang: 0 }, // 6
  { char: '辛', korean: '신', element: 3, yinYang: 1 }, // 7
  { char: '壬', korean: '임', element: 4, yinYang: 0 }, // 8
  { char: '癸', korean: '계', element: 4, yinYang: 1 }, // 9
]

// 지지 (十二地支) — 子丑寅卯辰巳午未申酉戌亥
export const BRANCHES: BranchData[] = [
  { char: '子', korean: '자', element: 4, yinYang: 0, zodiac: '쥐' }, // 0
  { char: '丑', korean: '축', element: 2, yinYang: 1, zodiac: '소' }, // 1
  { char: '寅', korean: '인', element: 0, yinYang: 0, zodiac: '호랑이' }, // 2
  { char: '卯', korean: '묘', element: 0, yinYang: 1, zodiac: '토끼' }, // 3
  { char: '辰', korean: '진', element: 2, yinYang: 0, zodiac: '용' }, // 4
  { char: '巳', korean: '사', element: 1, yinYang: 1, zodiac: '뱀' }, // 5
  { char: '午', korean: '오', element: 1, yinYang: 0, zodiac: '말' }, // 6
  { char: '未', korean: '미', element: 2, yinYang: 1, zodiac: '양' }, // 7
  { char: '申', korean: '신', element: 3, yinYang: 0, zodiac: '원숭이' }, // 8
  { char: '酉', korean: '유', element: 3, yinYang: 1, zodiac: '닭' }, // 9
  { char: '戌', korean: '술', element: 2, yinYang: 0, zodiac: '개' }, // 10
  { char: '亥', korean: '해', element: 4, yinYang: 1, zodiac: '돼지' }, // 11
]

// 오행 이름
export const ELEMENT_NAMES = ['목', '화', '토', '금', '수'] as const
export type ElementName = (typeof ELEMENT_NAMES)[number]

// 오행 상생(相生): ELEMENT_GENERATES[i] = j → 오행[i]가 오행[j]를 생(生)함
// 木→火→土→金→水→木
export const ELEMENT_GENERATES = [1, 2, 3, 4, 0] as const

// 오행 상극(相剋): ELEMENT_CONTROLS[i] = j → 오행[i]가 오행[j]를 극(剋)함
// 木→土→水→火→金→木
export const ELEMENT_CONTROLS = [2, 3, 4, 0, 1] as const

// 십신 (十神) 이름
export const TEN_GOD_NAMES = [
  '비견',
  '겁재',
  '식신',
  '상관',
  '편재',
  '정재',
  '편관',
  '정관',
  '편인',
  '정인',
] as const
export type TenGodName = (typeof TEN_GOD_NAMES)[number]

// 절기 기반 월지 시작일 (근사값 ±1일, 음력 기준)
// [월 브랜치 인덱스, 시작 월, 시작 일]
// 소서~대설~소한 순으로 늦은 달부터 정렬 (앞부터 매칭)
export const SOLAR_TERM_STARTS: [number, number, number][] = [
  [0, 12, 7], // 子月: 12월 7일 (대설)
  [11, 11, 7], // 亥月: 11월 7일 (입동)
  [10, 10, 8], // 戌月: 10월 8일 (한로)
  [9, 9, 8], // 酉月: 9월 8일 (백로)
  [8, 8, 7], // 申月: 8월 7일 (입추)
  [7, 7, 7], // 未月: 7월 7일 (소서)
  [6, 6, 6], // 午月: 6월 6일 (망종)
  [5, 5, 6], // 巳月: 5월 6일 (입하)
  [4, 4, 5], // 辰月: 4월 5일 (청명)
  [3, 3, 6], // 卯月: 3월 6일 (경칩)
  [2, 2, 4], // 寅月: 2월 4일 (입춘)
  [1, 1, 6], // 丑月: 1월 6일 (소한)
]
// 1월 1~5일 = 子月 (전년 12월 7일 이후)

// ────────────────────────────────────────────────────────────────────────────
// 지장간 (支藏干) — 각 지지에 숨겨진 천간 (자평명리 기준)
// 형식: [여기(餘氣)?, 중기(中氣)?, 본기(本氣)] — 마지막 원소가 본기(主氣)
// ────────────────────────────────────────────────────────────────────────────
export const JI_JANG_GAN: readonly (readonly number[])[] = [
  [8, 9],      // 子(0): 壬(여기) 癸(본기)
  [9, 7, 5],   // 丑(1): 癸(여기) 辛(중기) 己(본기)
  [4, 2, 0],   // 寅(2): 戊(여기) 丙(중기) 甲(본기)
  [0, 1],      // 卯(3): 甲(여기) 乙(본기)
  [1, 9, 4],   // 辰(4): 乙(여기) 癸(중기) 戊(본기)
  [4, 6, 2],   // 巳(5): 戊(여기) 庚(중기) 丙(본기)
  [2, 5, 3],   // 午(6): 丙(여기) 己(중기) 丁(본기)
  [3, 1, 5],   // 未(7): 丁(여기) 乙(중기) 己(본기)
  [4, 8, 6],   // 申(8): 戊(여기) 壬(중기) 庚(본기)
  [6, 7],      // 酉(9): 庚(여기) 辛(본기)
  [7, 3, 4],   // 戌(10): 辛(여기) 丁(중기) 戊(본기)
  [4, 0, 8],   // 亥(11): 戊(여기) 甲(중기) 壬(본기)
] as const

// ────────────────────────────────────────────────────────────────────────────
// 십이운성 (十二運星) — 생명 주기 12단계
// ────────────────────────────────────────────────────────────────────────────
export const SIP_IUN_SEONG_NAMES = [
  '장생', '목욕', '관대', '건록', '제왕', '쇠', '병', '사', '묘', '절', '태', '양',
] as const
export type SipIunSeongName = (typeof SIP_IUN_SEONG_NAMES)[number]

// 각 천간의 장생(長生)이 시작되는 지지 인덱스
// 양간(짝수): 순행(+1), 음간(홀수): 역행(-1)
export const JANG_SAENG_BRANCHES: readonly number[] = [
  11, // 甲(0) → 亥(11)
  6,  // 乙(1) → 午(6)
  2,  // 丙(2) → 寅(2)
  9,  // 丁(3) → 酉(9)
  2,  // 戊(4) → 寅(2)
  9,  // 己(5) → 酉(9)
  5,  // 庚(6) → 巳(5)
  0,  // 辛(7) → 子(0)
  8,  // 壬(8) → 申(8)
  3,  // 癸(9) → 卯(3)
] as const

// ────────────────────────────────────────────────────────────────────────────
// 신살 (神殺) 계산용 삼합(三合) 테이블
// 삼합 그룹: 0=寅午戌 / 1=申子辰 / 2=巳酉丑 / 3=亥卯未
// 각 그룹의 [도화살, 역마살, 화개살] 지지 인덱스
// ────────────────────────────────────────────────────────────────────────────
// 지지 → 삼합 그룹 인덱스 (-1 = 없음)
export const SAMHAP_GROUP: readonly number[] = [
  1,  // 子(0)  → 申子辰(1)
  2,  // 丑(1)  → 巳酉丑(2)
  0,  // 寅(2)  → 寅午戌(0)
  3,  // 卯(3)  → 亥卯未(3)
  1,  // 辰(4)  → 申子辰(1)
  2,  // 巳(5)  → 巳酉丑(2)
  0,  // 午(6)  → 寅午戌(0)
  3,  // 未(7)  → 亥卯未(3)
  1,  // 申(8)  → 申子辰(1)
  2,  // 酉(9)  → 巳酉丑(2)
  0,  // 戌(10) → 寅午戌(0)
  3,  // 亥(11) → 亥卯未(3)
] as const

// 삼합 그룹 → [도화살 지지, 역마살 지지, 화개살 지지]
export const SINSAL_BY_GROUP: readonly (readonly number[])[] = [
  [3, 8, 10],  // 寅午戌(0): 도화=卯(3)  역마=申(8)  화개=戌(10)
  [9, 2, 4],   // 申子辰(1): 도화=酉(9)  역마=寅(2)  화개=辰(4)
  [6, 11, 1],  // 巳酉丑(2): 도화=午(6)  역마=亥(11) 화개=丑(1)
  [0, 5, 7],   // 亥卯未(3): 도화=子(0)  역마=巳(5)  화개=未(7)
] as const

// 시지 (時支) — 시간대별 지지 인덱스
// [시작 시각, 종료 시각, 브랜치 인덱스]
export const HOUR_BRANCHES: [number, number, number][] = [
  [23, 24, 0], // 子時 23:00-24:00
  [0, 1, 0], // 子時 00:00-00:59
  [1, 3, 1], // 丑時 01:00-02:59
  [3, 5, 2], // 寅時 03:00-04:59
  [5, 7, 3], // 卯時 05:00-06:59
  [7, 9, 4], // 辰時 07:00-08:59
  [9, 11, 5], // 巳時 09:00-10:59
  [11, 13, 6], // 午時 11:00-12:59
  [13, 15, 7], // 未時 13:00-14:59
  [15, 17, 8], // 申時 15:00-16:59
  [17, 19, 9], // 酉時 17:00-18:59
  [19, 21, 10], // 戌時 19:00-20:59
  [21, 23, 11], // 亥時 21:00-22:59
]
