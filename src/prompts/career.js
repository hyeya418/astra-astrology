'use strict';

const { getSignRuler } = require('../helpers');

/**
 * Build prompts for "커리어 로드맵" analysis.
 * Analyzes: Mercury (sign+house), 10th house (sign+ruler), Saturn (sign+house), Mars (sign+house)
 */
function buildCareerPrompts(chart) {
  const mercury = chart.planets.find(p => p.name === 'Mercury');
  const saturn = chart.planets.find(p => p.name === 'Saturn');
  const mars = chart.planets.find(p => p.name === 'Mars');
  const jupiter = chart.planets.find(p => p.name === 'Jupiter');

  // 10th house
  const house10 = chart.houses.find(h => h.house === 10);
  const house10Ruler = house10 ? getSignRuler(house10.sign) : null;
  const house10RulerPlanet = house10Ruler
    ? chart.planets.find(p => p.name === house10Ruler)
    : null;

  const system = `당신은 점성술 기반 직업 컨설턴트입니다.
나탈 차트의 커리어 관련 행성들을 분석하여 구체적이고 실용적인 커리어 로드맵을 제시합니다.
단호하고 직접적인 톤으로 작성하세요. 애매한 표현 없이 명확하게 강점과 약점, 방향성을 제시하세요.
반드시 순수한 JSON만 반환하세요. 마크다운, 코드블록, 설명 텍스트 없이 JSON 객체만 출력하세요.

출력 형식:
{
  "title": "커리어 로드맵",
  "strengths": "타고난 강점 영역 설명 (2-3문장)",
  "workStyle": "일하는 방식과 소통 스타일 분석 (2-3문장)",
  "bestRole": "가장 잘 맞는 역할/직군 (구체적으로 3-5가지 예시 포함)",
  "warning": "이 방향은 피해라 — 에너지 낭비 영역 (1-2문장)",
  "longterm": "Saturn 기반 장기 성장 방향 (2-3문장, 언제 꽃피우는지 포함)"
}`;

  const user = `나탈 차트 커리어 분석 데이터:

수성(Mercury) - 사고방식/소통:
${mercury ? `${mercury.sign} ${mercury.house}하우스 (${mercury.retrograde ? '역행' : '순행'})` : 'unknown'}

10하우스(커리어 방향성):
${house10 ? `${house10.sign}자리` : 'unknown'}
10하우스 지배성: ${house10Ruler || 'unknown'}${house10RulerPlanet ? ` → ${house10RulerPlanet.sign} ${house10RulerPlanet.house}하우스` : ''}

토성(Saturn) - 장기 성장:
${saturn ? `${saturn.sign} ${saturn.house}하우스 (${saturn.retrograde ? '역행' : '순행'})` : 'unknown'}

화성(Mars) - 실행 에너지:
${mars ? `${mars.sign} ${mars.house}하우스 (${mars.retrograde ? '역행' : '순행'})` : 'unknown'}

목성(Jupiter) - 확장/기회:
${jupiter ? `${jupiter.sign} ${jupiter.house}하우스` : 'unknown'}

이 데이터를 바탕으로 이 사람에게 가장 잘 맞는 커리어 로드맵을 분석하세요.
구체적인 직군명을 언급하고, 언제 어떤 방향으로 성장해야 하는지 명확하게 제시하세요.`;

  return { system, user };
}

module.exports = { buildCareerPrompts };
