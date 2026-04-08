'use strict';

const {
  buildKoreanOnlyRules,
  formatNameWithSuffix,
  formatPlanetPosition,
  toKoreanSign,
} = require('./utils');

/**
 * Build prompts for persona analysis.
 * Analyzes: 상승궁, 달, 태양
 */
function buildPersonaPrompts(chart, name) {
  const asc = chart.angles.ascendant;
  const moon = chart.planets.find((p) => p.name === 'Moon');
  const sun = chart.planets.find((p) => p.name === 'Sun');
  const displayName = formatNameWithSuffix(name);

  const rules = [
    ...buildKoreanOnlyRules(displayName),
    `${displayName}의 평소 성향, 원래 기질, 기본 패턴을 설명하세요.`,
    '"오늘", "요즘", "최근", "현재 시기", "지금은" 같은 시기 표현은 쓰지 마세요.',
    '어렵고 단정적인 말보다 공감되는 설명을 우선하세요.',
    '반드시 JSON만 반환하세요.',
  ];

  const system = `당신은 사람의 겉모습과 내면을 부드럽고 이해하기 쉽게 풀어주는 성향 분석가입니다.
점성술 데이터는 참고용으로만 사용하고, 최종 답변은 점성술을 모르는 사람도 편하게 읽을 수 있는 쉬운 한국어로 작성하세요.
이 분석은 "타고난 성향"과 "평소 모습"을 설명하는 탭입니다.

반드시 지킬 규칙:
${rules.map((rule, index) => `${index + 1}. ${rule}`).join('\n')}

출력 형식:
{
  "title": "겉모습과 속마음",
  "mask": "겉으로 보이는 인상 설명",
  "inner": "내면의 감정과 진짜 마음 설명",
  "gap": "겉과 속의 차이, 방어적인 모습 설명",
  "advice": "자신을 이해하는 데 도움이 되는 짧은 한마디"
}`;

  const user = `다음 정보를 바탕으로 ${displayName}의 성향을 분석해주세요.

- 이름 호칭: ${displayName}
- 상승궁: ${asc ? `${toKoreanSign(asc.sign)} ${asc.degree.toFixed(1)}도` : '미상'}
- 달: ${formatPlanetPosition(moon, { includeDegree: true })}
- 태양: ${formatPlanetPosition(sun, { includeDegree: true })}

사람들이 처음 느끼는 인상, 혼자 있을 때의 감정, 겉과 속이 다르게 보일 수 있는 지점을 쉬운 말로 설명해주세요.
반드시 ${displayName}의 평소 성향 기준으로만 설명하고, 오늘이나 최근 흐름처럼 들리는 표현은 쓰지 마세요.
한자나 영어 표현 없이 자연스러운 한국어만 사용해주세요.`;

  return { system, user };
}

module.exports = { buildPersonaPrompts };
