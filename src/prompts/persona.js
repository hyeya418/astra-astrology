'use strict';

/**
 * Build prompts for "나의 사회적 가면 vs 실제 속마음" analysis.
 * Analyzes: ASC sign, Moon sign+house, Sun sign
 */
function buildPersonaPrompts(chart) {
  const asc = chart.angles.ascendant;
  const moon = chart.planets.find(p => p.name === 'Moon');
  const sun = chart.planets.find(p => p.name === 'Sun');

  const chartSummary = {
    ascendant: asc ? `${asc.sign} ${asc.degree.toFixed(1)}°` : 'unknown',
    moon: moon ? `${moon.sign} ${moon.degree.toFixed(1)}° in House ${moon.house}` : 'unknown',
    sun: sun ? `${sun.sign} ${sun.degree.toFixed(1)}° in House ${sun.house}` : 'unknown',
  };

  const system = `당신은 서양 점성술 전문가이자 심리 분석가입니다.
사용자의 나탈 차트를 분석하여 사회적 가면(페르소나)과 내면의 실제 자아를 심층 분석합니다.
반드시 순수한 JSON만 반환하세요. 마크다운, 코드블록, 설명 텍스트 없이 JSON 객체만 출력하세요.

출력 형식:
{
  "title": "겉모습 vs 속마음",
  "mask": "ASC 기반 사회적 겉모습 설명 (2-3문장)",
  "inner": "Moon 기반 내면의 속마음 설명 (2-3문장)",
  "gap": "두 자아 사이의 간극과 방어기제 분석 (2-3문장)",
  "advice": "한 줄 위로의 메시지"
}`;

  const user = `다음 나탈 차트 데이터로 분석해주세요:

- 상승궁(ASC): ${chartSummary.ascendant}
- 달(Moon): ${chartSummary.moon}
- 태양(Sun): ${chartSummary.sun}

사람들이 처음 보는 ${chartSummary.ascendant} 상승궁의 겉모습,
${chartSummary.moon}에 있는 달이 보여주는 진짜 감정과 내면의 필요,
그리고 둘 사이의 간극에서 오는 방어기제를 분석하세요.
따뜻하고 공감적인 톤으로 작성하되, 심리적으로 날카롭게 분석하세요.`;

  return { system, user };
}

module.exports = { buildPersonaPrompts };
