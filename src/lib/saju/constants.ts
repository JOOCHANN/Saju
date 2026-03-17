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
