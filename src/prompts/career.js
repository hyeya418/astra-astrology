'use strict';

const { getSignRuler } = require('../helpers');
const {
  buildKoreanOnlyRules,
  formatHouseSign,
  formatNameWithSuffix,
  formatPlanetPosition,
  toKoreanPlanet,
} = require('./utils');

/**
 * Build prompts for career analysis.
 */
function buildCareerPrompts(chart, name) {
  const mercury = chart.planets.find((p) => p.name === 'Mercury');
  const saturn = chart.planets.find((p) => p.name === 'Saturn');
  const mars = chart.planets.find((p) => p.name === 'Mars');
  const jupiter = chart.planets.find((p) => p.name === 'Jupiter');
  const displayName = formatNameWithSuffix(name);

  const house10 = chart.houses.find((h) => h.house === 10);
  const house10Ruler = house10 ? getSignRuler(house10.sign) : null;
  const house10RulerPlanet = house10Ruler
    ? chart.planets.find((p) => p.name === house10Ruler)
    : null;

  const rules = [
    ...buildKoreanOnlyRules(displayName),
    `${displayName}의 평소 일하는 방식, 오래 가져가기 좋은 방향, 장기적으로 성장하는 패턴을 설명하세요.`,
    '"오늘", "요즘", "최근", "현재 시기", "지금은" 같은 시기 표현은 쓰지 마세요.',
    '점성술 용어를 길게 설명하지 말고, 현실적인 직업 조언에 집중하세요.',
    '반드시 JSON만 반환하세요.',
  ];

  const system = `당신은 성향 기반 진로 가이드입니다.
사용자의 차트를 참고해 일 스타일과 잘 맞는 방향을 쉽게 설명해주세요.
이 분석은 일시적인 흐름이 아니라 장기적인 커리어 성향을 설명하는 탭입니다.

반드시 지킬 규칙:
${rules.map((rule, index) => `${index + 1}. ${rule}`).join('\n')}

출력 형식:
{
  "title": "커리어 로드맵",
  "strengths": "타고난 강점 설명",
  "workStyle": "일하는 방식과 소통 스타일 설명",
  "bestRole": "잘 맞는 역할이나 직업 방향",
  "warning": "지치기 쉬운 패턴이나 주의점",
  "longterm": "장기적으로 성장하는 방식"
}`;

  const user = `${displayName}의 커리어 분석 참고 정보:

- 이름 호칭: ${displayName}
- 수성: ${formatPlanetPosition(mercury, { includeRetrograde: true })}
- 10하우스: ${formatHouseSign(house10)}
- 10하우스의 주인 행성: ${house10Ruler ? toKoreanPlanet(house10Ruler) : '미상'}${house10RulerPlanet ? ` / ${formatPlanetPosition(house10RulerPlanet)}` : ''}
- 토성: ${formatPlanetPosition(saturn, { includeRetrograde: true })}
- 화성: ${formatPlanetPosition(mars, { includeRetrograde: true })}
- 목성: ${formatPlanetPosition(jupiter)}

이 정보를 바탕으로 ${displayName}이 어떤 방식으로 일할 때 강점을 발휘하는지, 어떤 직업 방향이 잘 맞는지 쉬운 한국어로 설명해주세요.
반드시 장기적인 커리어 성향 기준으로만 설명하고, 당장의 운세처럼 들리는 표현은 쓰지 마세요.
한자나 영어 표현은 쓰지 마세요.`;

  return { system, user };
}

module.exports = { buildCareerPrompts };
