// Claude API 사주 분석 프롬프트 생성
import type { SajuResult } from '@/lib/saju'

export const SAJU_SYSTEM_PROMPT = `당신은 30년 경력의 사주 명리학 전문가입니다.
사주팔자(四柱八字)를 바탕으로 한국 전통 명리학 이론(음양오행, 십신, 십이운성 등)을 적용해
연애, 결혼, 금전, 직업, 건강 등 삶의 핵심 영역을 한국어로 생생하고 공감가는 언어로 해설합니다.

작성 원칙:
- 전문 용어는 처음 언급할 때만 괄호로 설명하고, 이후엔 쉬운 표현 사용
- 단정적 예언 대신 가능성·경향·흐름으로 서술 (예: "~하는 경향이 있습니다", "~할 수 있습니다")
- 각 영역마다 구체적인 조언과 주의사항을 반드시 포함
- 부정적 경향도 어떻게 극복하면 좋은지 실질적 조언 제시
- 섹션은 마크다운 ## 헤딩으로 구분
- 총 분량: 700~1000자`

/**
 * 사주 해석 API 요청용 사용자 메시지를 생성합니다.
 */
export function buildSajuUserMessage(result: SajuResult): string {
  const { fourPillars: fp, dayMaster, elementBalance, tenGods, sipIunSeong, daewoon } = result

  const pillarLine = (label: string, p: typeof fp.year) =>
    `${label}: ${p.stem}${p.branch}(${p.stemKorean}${p.branchKorean}) — 천간 ${p.stemElement}${p.yinYang}, 지지 ${p.branchElement}`

  const elemLine = Object.entries(elementBalance)
    .map(([e, n]) => `${e} ${n}개`)
    .join(' / ')

  const hourInfo = fp.hour
    ? pillarLine('시주', fp.hour)
    : '시주: 미입력'

  const daewoon0 = daewoon[0]
  const daewoonLine = daewoon0
    ? `현재 대운: ${daewoon0.startAge}세부터 시작`
    : ''

  return `아래 사주를 해석해주세요.

## 사주팔자
${pillarLine('연주', fp.year)}
${pillarLine('월주', fp.month)}
${pillarLine('일주(일간)', fp.day)}
${hourInfo}

## 일간 (사주의 중심)
${dayMaster.stem}(${dayMaster.stemKorean}) — ${dayMaster.element} ${dayMaster.yinYang}

## 오행 분포
${elemLine}

## 십신 구성
연주: ${tenGods.year} / 월주: ${tenGods.month}${tenGods.hour ? ` / 시주: ${tenGods.hour}` : ''}

## 십이운성
연주: ${sipIunSeong.year} / 월주: ${sipIunSeong.month} / 일주: ${sipIunSeong.day}${sipIunSeong.hour ? ` / 시주: ${sipIunSeong.hour}` : ''}
${daewoonLine}

---
위 사주를 바탕으로 다음 6가지 영역을 각각 분석해주세요.
각 영역마다 이 사주가 어떤 특성을 가지는지, 조심해야 할 점은 무엇인지 구체적으로 서술하세요.

## 연애운
## 결혼운
## 금전운
## 직업운
## 건강운
## 이 사주의 핵심 조언`
}
