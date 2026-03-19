// Claude/OpenAI 사주 해석 프롬프트 생성
import type { SajuResult } from '@/lib/saju'

export const SAJU_SYSTEM_PROMPT = `당신은 30년 경력의 사주 명리학 전문가입니다.
사주팔자를 바탕으로 연애, 결혼, 금전, 직업, 건강 영역을 초등학생도 이해할 수 있는 쉬운 한국어로 해설합니다.

작성 원칙:
- 각 섹션 첫 줄에 반드시 **요약**: [20자 이내 핵심 한 문장] 형식으로 시작
- 요약 다음 줄에 최소 5~6문장의 상세 해설을 작성 (구체적인 상황 예시 포함)
- 어려운 한자어 대신 쉬운 우리말 사용 (비견→나와 비슷한 사람, 편재→사업 돈, 정인→공부·지혜)
- 단정적 예언 대신 경향과 가능성으로 서술 (~하는 경향이 있어요, ~할 수 있어요)
- 긍정적 특성과 주의해야 할 점을 균형 있게 서술
- 섹션은 마크다운 ## 헤딩으로 구분
- '이 사주의 핵심 조언' 섹션은 반드시 **요약**: 한 줄 후, - 불렛으로 6개 이상 작성
- 총 분량: 1200~1600자`

/**
 * 사주 해석 API 요청용 사용자 메시지를 생성합니다.
 */
export function buildSajuUserMessage(result: SajuResult): string {
  const { fourPillars: fp, dayMaster, elementBalance, tenGods, sipIunSeong, daewoon, gongMang } = result

  const pillarLine = (label: string, p: typeof fp.year) =>
    `${label}: ${p.stem}${p.branch}(${p.stemKorean}${p.branchKorean}) 천간${p.stemElement}${p.yinYang} 지지${p.branchElement} [${p.zodiac}띠]`

  const elemLine = Object.entries(elementBalance)
    .map(([e, n]) => `${e}${n}개`)
    .join(' ')

  const hourInfo = fp.hour
    ? pillarLine('시주', fp.hour)
    : '시주: 미입력'

  const daewoon0 = daewoon[0]
  const daewoonSummary = daewoon
    .slice(0, 4)
    .map((d) => `${d.startAge}세~`)
    .join(' ')

  return `아래 사주를 해석해주세요.

## 사주팔자
${pillarLine('연주', fp.year)}
${pillarLine('월주', fp.month)}
${pillarLine('일주', fp.day)}
${hourInfo}

## 일간 (이 사람의 핵심 기질)
${dayMaster.stem}(${dayMaster.stemKorean}) — ${dayMaster.element} ${dayMaster.yinYang}

## 오행 분포
${elemLine}

## 십신 구성
연주: ${tenGods.year} / 월주: ${tenGods.month}${tenGods.hour ? ` / 시주: ${tenGods.hour}` : ''}

## 십이운성
연: ${sipIunSeong.year} / 월: ${sipIunSeong.month} / 일: ${sipIunSeong.day}${sipIunSeong.hour ? ` / 시: ${sipIunSeong.hour}` : ''}

## 공망
지지 인덱스: ${gongMang.join(', ')}

## 대운 흐름
${daewoonSummary}${daewoon0 ? ` (첫 대운 ${daewoon0.startAge}세부터)` : ''}

---
위 사주를 바탕으로 아래 6개 영역을 해석해주세요.
각 영역은 반드시 **요약**: 한 줄로 시작하고, 최소 5~6문장의 상세 내용을 작성하세요.
구체적인 조언과 주의사항을 쉬운 말로 풍부하게 써주세요.

## 연애운
## 결혼운
## 금전운
## 직업운
## 건강운
## 이 사주의 핵심 조언`
}
