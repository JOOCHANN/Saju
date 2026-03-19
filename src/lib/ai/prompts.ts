// Claude/OpenAI 사주 해석 프롬프트 생성
import type { SajuResult } from '@/lib/saju'

// ────────────────────────────────────────────────────────────────────────────
// 궁합 분석 프롬프트
// ────────────────────────────────────────────────────────────────────────────

export const GUNGHAP_SYSTEM_PROMPT = `당신은 30년 경력의 사주 명리학 전문가입니다.
두 사람의 사주팔자를 비교하여 궁합을 분석합니다.
초등학생도 이해할 수 있는 쉬운 한국어로 해설합니다.

작성 원칙:
- 각 섹션 첫 줄에 반드시 **요약**: [20자 이내 핵심 한 문장] 형식으로 시작
- 요약 다음 줄에 반드시 **점수**: [1~100 사이 정수] 형식으로 두 사람의 궁합 강도를 표현 (70 이상=잘 맞음, 50~69=보통, 49 이하=노력 필요)
- 점수 다음 줄에 최소 4~5문장의 상세 해설 작성 (두 사람의 기질 차이와 시너지를 구체적으로)
- 어려운 한자어 대신 쉬운 우리말 사용 (비견→나와 비슷한 사람, 편재→사업 돈)
- 단정적 예언 대신 경향과 가능성으로 서술 (~하는 경향이 있어요, ~할 수 있어요)
- 섹션은 마크다운 ## 헤딩으로 구분
- '두 사람을 위한 핵심 조언' 섹션은 반드시 **요약**: 한 줄 후, - 불렛으로 5개 이상 작성
- 총 분량: 1000~1400자`

export function buildGunghapUserMessage(result1: SajuResult, result2: SajuResult): string {
  const { fourPillars: fp1, dayMaster: dm1, elementBalance: eb1 } = result1
  const { fourPillars: fp2, dayMaster: dm2, elementBalance: eb2 } = result2

  const elemLine = (eb: typeof eb1) =>
    Object.entries(eb).map(([e, n]) => `${e}${n}개`).join(' ')

  const hour1 = fp1.hour
    ? `시주: ${fp1.hour.stem}${fp1.hour.branch}(${fp1.hour.stemKorean}${fp1.hour.branchKorean})`
    : '시주: 미입력'
  const hour2 = fp2.hour
    ? `시주: ${fp2.hour.stem}${fp2.hour.branch}(${fp2.hour.stemKorean}${fp2.hour.branchKorean})`
    : '시주: 미입력'

  return `두 사람의 궁합을 분석해주세요.

## 나 (사람1)
연주: ${fp1.year.stem}${fp1.year.branch}(${fp1.year.stemKorean}${fp1.year.branchKorean}) [${fp1.year.zodiac}띠]
월주: ${fp1.month.stem}${fp1.month.branch}(${fp1.month.stemKorean}${fp1.month.branchKorean})
일주: ${fp1.day.stem}${fp1.day.branch}(${fp1.day.stemKorean}${fp1.day.branchKorean})
${hour1}
일간: ${dm1.stem}(${dm1.stemKorean}) — ${dm1.element} ${dm1.yinYang}
오행 분포: ${elemLine(eb1)}

## 상대 (사람2)
연주: ${fp2.year.stem}${fp2.year.branch}(${fp2.year.stemKorean}${fp2.year.branchKorean}) [${fp2.year.zodiac}띠]
월주: ${fp2.month.stem}${fp2.month.branch}(${fp2.month.stemKorean}${fp2.month.branchKorean})
일주: ${fp2.day.stem}${fp2.day.branch}(${fp2.day.stemKorean}${fp2.day.branchKorean})
${hour2}
일간: ${dm2.stem}(${dm2.stemKorean}) — ${dm2.element} ${dm2.yinYang}
오행 분포: ${elemLine(eb2)}

---
위 두 사람의 사주를 비교하여 아래 5개 영역의 궁합을 분석해주세요.
각 영역은 반드시 **요약**: 한 줄 + **점수**: 로 시작하고, 두 사람의 기질 차이와 시너지를 구체적으로 서술하세요.

## 성격 궁합
## 연애 궁합
## 결혼 궁합
## 재물 궁합
## 두 사람을 위한 핵심 조언`
}

export const SAJU_SYSTEM_PROMPT = `당신은 30년 경력의 사주 명리학 전문가입니다.
사주팔자를 바탕으로 연애, 결혼, 금전, 직업, 건강 영역을 초등학생도 이해할 수 있는 쉬운 한국어로 해설합니다.

작성 원칙:
- 각 섹션 첫 줄에 반드시 **요약**: [20자 이내 핵심 한 문장] 형식으로 시작
- 요약 다음 줄에 반드시 **점수**: [1~100 사이 정수] 형식으로 해당 운의 강도를 수치로 표현 (70 이상=좋음, 50~69=보통, 49 이하=주의)
- 점수 다음 줄에 최소 5~6문장의 상세 해설을 작성 (구체적인 상황 예시 포함)
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
