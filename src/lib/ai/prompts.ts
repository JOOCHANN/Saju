// Claude API 사주 분석 프롬프트 생성
import type { SajuResult } from '@/lib/saju'

export const SAJU_SYSTEM_PROMPT = `당신은 30년 경력의 사주 명리학 전문가입니다.
사주팔자(四柱八字)를 바탕으로 한국 전통 명리학 이론(음양오행, 십신, 십이운성 등)을 적용해
사용자의 성격, 적성, 건강, 대인관계, 인생 흐름을 한국어로 명확하고 공감가는 언어로 해설합니다.

작성 원칙:
- 전문 용어는 처음 언급할 때만 괄호로 설명하고, 이후엔 쉬운 표현 사용
- 단정적 예언 대신 가능성·경향·흐름으로 서술 (예: "~하는 경향이 있습니다", "~할 수 있습니다")
- 부정적 특성도 성장 기회로 긍정적으로 재프레이밍
- 섹션은 마크다운 ## 헤딩으로 구분
- 총 분량: 600~900자`

/**
 * 사주 분석 API 요청용 사용자 메시지를 생성합니다.
 */
export function buildSajuUserMessage(result: SajuResult): string {
  const { fourPillars: fp, dayMaster, elementBalance, tenGods } = result

  const pillarLine = (label: string, p: typeof fp.year) =>
    `${label}: ${p.stem}${p.branch}(${p.stemKorean}${p.branchKorean}) — 천간 ${p.stemElement}${p.yinYang}, 지지 ${p.branchElement}`

  const elemLine = Object.entries(elementBalance)
    .map(([e, n]) => `${e} ${n}개`)
    .join(' / ')

  const hourInfo = fp.hour
    ? pillarLine('시주', fp.hour)
    : '시주: 미입력'

  return `아래 사주를 분석해주세요.

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

---
위 사주를 바탕으로 다음 순서로 분석해주세요:

## 타고난 성격과 기질
## 강점과 재능
## 직업·적성 방향
## 대인관계와 연애
## 건강과 주의사항
## 올해의 흐름과 조언`
}
