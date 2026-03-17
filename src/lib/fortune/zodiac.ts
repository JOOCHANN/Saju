// 12간지 (띠) 상수 및 유틸리티

export interface ZodiacData {
  /** 한글 이름 */
  name: string
  /** 지지 한자 */
  branch: string
  /** 이모지 */
  emoji: string
  /** 기준 연도 (이후 +12씩 반복) */
  baseYear: number
}

// 子(쥐)부터 순서대로 12간지
export const ZODIACS: ZodiacData[] = [
  { name: '쥐', branch: '子', emoji: '🐭', baseYear: 1924 },
  { name: '소', branch: '丑', emoji: '🐮', baseYear: 1925 },
  { name: '호랑이', branch: '寅', emoji: '🐯', baseYear: 1926 },
  { name: '토끼', branch: '卯', emoji: '🐰', baseYear: 1927 },
  { name: '용', branch: '辰', emoji: '🐲', baseYear: 1928 },
  { name: '뱀', branch: '巳', emoji: '🐍', baseYear: 1929 },
  { name: '말', branch: '午', emoji: '🐴', baseYear: 1930 },
  { name: '양', branch: '未', emoji: '🐑', baseYear: 1931 },
  { name: '원숭이', branch: '申', emoji: '🐵', baseYear: 1932 },
  { name: '닭', branch: '酉', emoji: '🐔', baseYear: 1933 },
  { name: '개', branch: '戌', emoji: '🐶', baseYear: 1934 },
  { name: '돼지', branch: '亥', emoji: '🐷', baseYear: 1935 },
]

/** 출생 연도로 띠 이름 반환 */
export function getZodiacByYear(year: number): string {
  const idx = ((year - 1924) % 12 + 12) % 12
  return ZODIACS[idx].name
}

/** 띠 이름 유효성 검사 */
export function isValidZodiac(name: string): boolean {
  return ZODIACS.some((z) => z.name === name)
}

/** 대표 출생 연도 3개 반환 (최근 순) */
export function getRecentYears(zodiac: ZodiacData): number[] {
  const years: number[] = []
  let y = zodiac.baseYear
  while (y <= new Date().getFullYear() + 1) {
    years.push(y)
    y += 12
  }
  return years.slice(-3).reverse()
}
