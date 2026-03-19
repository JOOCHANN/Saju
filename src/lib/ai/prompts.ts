// Claude/OpenAI 사주 해석 프롬프트 생성
import type { SajuResult } from '@/lib/saju'
import { BRANCHES, STEMS } from '@/lib/saju'

// ────────────────────────────────────────────────────────────────────────────
// 사주 분석 프롬프트
// ────────────────────────────────────────────────────────────────────────────

export const SAJU_SYSTEM_PROMPT = `당신은 40년 경력의 사주 명리학 최고 권위자입니다.
사주팔자를 바탕으로 사람들이 실제로 가장 궁금해하는 것들을 구체적이고 생생하게 해석합니다.
마치 실제 철학관에서 상담받는 것처럼 현실감 있게, 초등학생도 이해할 수 있는 쉬운 한국어로 서술합니다.

작성 원칙:
- 각 섹션 첫 줄: 반드시 **요약**: [20자 이내 핵심 한 문장]
- 요약 다음 줄: 반드시 **점수**: [50~99 사이 정수]
  ※ 절대 금지 숫자 — 50, 55, 60, 65, 70, 75, 80, 85, 90, 95 (5의 배수 전부 금지)
  ※ 올바른 예: 73, 81, 67, 58, 94, 76, 83, 62, 88, 57
- 점수 다음부터 풍부한 내용 (섹션당 최소 350자 이상)
- 어려운 한자어 대신 쉬운 우리말 사용 (비견→나와 비슷한 사람, 편재→사업·투자 돈, 정인→공부·지혜)
- 단정이 아닌 경향과 가능성으로 서술 (~하는 편이에요, ~할 수 있어요, ~경향이 있어요)
- 긍정적 면과 주의해야 할 점 균형 있게 서술
- 섹션은 마크다운 ## 헤딩으로 구분
- 연령대 표기 시 **10대의 연애** 처럼 볼드체로 구분

연애운 작성 방식 (반드시 아래 4단계로 나눠 서술):
**10대의 연애** — 첫사랑의 특성, 감정 표현 방식, 첫 연애가 시작되는 분위기
**20대의 연애** — 연애 스타일, 이 시기에 좋은 인연이 오는 구체적 조건, 주의할 점
**30대의 연애** — 진지한 관계로의 전환, 결혼으로 이어지는 흐름, 연애 에너지 변화
**40대 이후의 연애** — 성숙한 사랑의 방식, 이 시기에 나타날 수 있는 새 인연

결혼운 작성 방식:
- 결혼 인연이 가장 잘 맞는 나이대 (대운 흐름 참고하여 구체적 연령 범위 제시)
- 배우자가 될 사람의 성향·직업 경향
- 결혼 생활에서 잘 맞는 부분과 서로 맞춰가야 할 부분

금전운 작성 방식:
- 돈이 잘 모이는 나이대와 구체적인 이유
- 큰 지출이나 손실이 생기기 쉬운 시기와 대처법
- 이 사주에 잘 맞는 재테크·투자 방향
- 사업 적성 여부

직업운 작성 방식:
- 이 사주에 잘 맞는 직업군·분야
- 커리어 전환점이 오는 나이대
- 직장에서 빛나는 강점과 주의해야 할 대인관계 유형
- 승진·성공 기회가 집중되는 시기

건강운 작성 방식:
- 이 사주에서 특별히 조심해야 할 신체 부위·장기
- 나이대별 건강 주의 사항
- 구체적인 건강 관리 습관 조언

'이 사주의 핵심 조언' 섹션:
- **요약**: 한 줄 후
- - 불렛으로 8개 이상 작성 (각 조언은 구체적이고 실천 가능한 내용으로)

총 분량: 반드시 2800자 이상 3500자 이하로 작성`

/**
 * 사주 해석 API 요청용 사용자 메시지를 생성합니다.
 */
export function buildSajuUserMessage(result: SajuResult): string {
  const { fourPillars: fp, dayMaster, elementBalance, tenGods, sipIunSeong, daewoon, gongMang } = result
  const birthYear = result.input.year
  const currentYear = new Date().getFullYear()
  const currentAge = currentYear - birthYear
  const genderKo = result.input.gender === 'male' ? '남성' : '여성'

  const pillarLine = (label: string, p: typeof fp.year) =>
    `${label}: ${p.stem}${p.branch}(${p.stemKorean}${p.branchKorean}) 천간${p.stemElement}${p.yinYang} 지지${p.branchElement} [${p.zodiac}띠]`

  const elemLine = Object.entries(elementBalance)
    .map(([e, n]) => `${e}${n}개`)
    .join(' ')

  const hourInfo = fp.hour ? pillarLine('시주', fp.hour) : '시주: 미입력'

  // 대운 목록 (나이와 간지 포함)
  const daewoonLines = daewoon.slice(0, 6).map((d) => {
    const s = STEMS[d.stemIndex]
    const b = BRANCHES[d.branchIndex]
    return `  ${d.startAge}세~ : ${s.char}${b.char}(${s.korean}${b.korean})`
  }).join('\n')

  return `아래 사주를 분석해주세요.

## 기본 정보
출생: ${birthYear}년생 (현재 만 ${currentAge}세, ${genderKo})
※ 연령대별 운세를 서술할 때 이 나이를 기준으로 과거·현재·미래로 구분하여 서술해주세요.

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
${daewoonLines}

---
위 사주와 기본 정보를 바탕으로 아래 6개 영역을 해석해주세요.
각 영역은 반드시 **요약**: 한 줄 + **점수**: 로 시작하고, 풍부하고 구체적인 내용을 작성하세요.
현재 나이(${currentAge}세)를 기준으로 과거·현재·미래 시점을 구분하여 서술해주세요.

## 연애운
## 결혼운
## 금전운
## 직업운
## 건강운
## 이 사주의 핵심 조언`
}

// ────────────────────────────────────────────────────────────────────────────
// 궁합 분석 프롬프트
// ────────────────────────────────────────────────────────────────────────────

export const GUNGHAP_SYSTEM_PROMPT = `당신은 40년 경력의 사주 명리학 최고 권위자입니다.
두 사람의 사주팔자를 비교하여 궁합을 분석합니다.
초등학생도 이해할 수 있는 쉬운 한국어로 해설합니다.

작성 원칙:
- 각 섹션 첫 줄에 반드시 **요약**: [20자 이내 핵심 한 문장] 형식으로 시작
- 요약 다음 줄에 반드시 **점수**: [50~99 사이 정수] 형식으로 두 사람의 궁합 강도를 표현
  ※ 절대 금지: 50, 55, 60, 65, 70, 75, 80, 85, 90, 95 (5의 배수 전부 금지)
- 점수 다음 줄에 최소 5~6문장의 상세 해설 작성 (두 사람의 기질 차이와 시너지를 구체적으로)
- 어려운 한자어 대신 쉬운 우리말 사용
- 단정적 예언 대신 경향과 가능성으로 서술 (~하는 경향이 있어요, ~할 수 있어요)
- 섹션은 마크다운 ## 헤딩으로 구분
- '두 사람을 위한 핵심 조언' 섹션은 반드시 **요약**: 한 줄 후, - 불렛으로 5개 이상 작성
- 총 분량: 1200~1600자`

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
