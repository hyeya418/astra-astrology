'use strict';

/**
 * Build prompts for "관계 레드플래그 감별기" analysis.
 * Analyzes synastry aspects between two charts, focusing on tensions and harmonies.
 */
function buildSynastryPrompts(chart1, chart2, synastryAspects) {
  // Key aspects for red/green flags
  const tensionAspects = synastryAspects
    .filter(a => ['Square', 'Opposition'].includes(a.aspect))
    .slice(0, 8)
    .map(a => `P1 ${a.person1Planet} ${a.aspect} P2 ${a.person2Planet} (orb: ${a.orb}°)`)
    .join('\n');

  const harmonyAspects = synastryAspects
    .filter(a => ['Trine', 'Sextile', 'Conjunction'].includes(a.aspect))
    .slice(0, 8)
    .map(a => `P1 ${a.person1Planet} ${a.aspect} P2 ${a.person2Planet} (orb: ${a.orb}°)`)
    .join('\n');

  // Highlight specific critical pairs
  const criticalPairs = [];

  // Person2's Mars vs Person1's Moon (감정 충돌)
  const marsMoon = synastryAspects.find(a =>
    a.person2Planet === 'Mars' && a.person1Planet === 'Moon' &&
    ['Square', 'Opposition'].includes(a.aspect)
  );
  if (marsMoon) {
    criticalPairs.push(`⚠️ P2 화성 ${marsMoon.aspect} P1 달: 감정 충돌 가능성 높음 (orb: ${marsMoon.orb}°)`);
  }

  // Person2's Saturn vs Person1's Sun (억압 관계)
  const saturnSun = synastryAspects.find(a =>
    a.person2Planet === 'Saturn' && a.person1Planet === 'Sun' &&
    ['Square', 'Opposition', 'Conjunction'].includes(a.aspect)
  );
  if (saturnSun) {
    criticalPairs.push(`⚠️ P2 토성 ${saturnSun.aspect} P1 태양: 억압/제한 관계 가능성 (orb: ${saturnSun.orb}°)`);
  }

  // Person1's chart summary
  const p1Sun = chart1.planets.find(p => p.name === 'Sun');
  const p1Moon = chart1.planets.find(p => p.name === 'Moon');
  const p1Venus = chart1.planets.find(p => p.name === 'Venus');
  const p1Mars = chart1.planets.find(p => p.name === 'Mars');

  // Person2's chart summary
  const p2Sun = chart2.planets.find(p => p.name === 'Sun');
  const p2Moon = chart2.planets.find(p => p.name === 'Moon');
  const p2Venus = chart2.planets.find(p => p.name === 'Venus');
  const p2Mars = chart2.planets.find(p => p.name === 'Mars');

  const system = `당신은 서양 점성술 관계 분석 전문가입니다.
두 사람의 나탈 차트 시너스트리를 분석하여 관계의 레드플래그와 그린플래그를 냉정하게 판정합니다.
단호하고 냉정한 톤으로 작성하세요. 필요하다면 "삭제해라" 수준의 직구도 가능합니다.
반드시 순수한 JSON만 반환하세요. 마크다운, 코드블록, 설명 텍스트 없이 JSON 객체만 출력하세요.

출력 형식:
{
  "title": "관계 레드플래그 리포트",
  "compatibility": 숫자 (0-100 상성 점수, 숫자만),
  "redFlags": ["레드플래그 항목 1", "레드플래그 항목 2", ...],
  "greenFlags": ["그린플래그 항목 1", "그린플래그 항목 2", ...],
  "verdict": "최종 한 줄 판정 (단호하게)"
}`;

  const user = `두 사람의 시너스트리 분석 데이터:

[사람 1 기본 정보]
- 태양: ${p1Sun ? p1Sun.sign : 'unknown'}
- 달: ${p1Moon ? p1Moon.sign + ' ' + p1Moon.house + '하우스' : 'unknown'}
- 금성: ${p1Venus ? p1Venus.sign : 'unknown'}
- 화성: ${p1Mars ? p1Mars.sign : 'unknown'}
- 상승궁: ${chart1.angles.ascendant ? chart1.angles.ascendant.sign : 'unknown'}

[사람 2 기본 정보]
- 태양: ${p2Sun ? p2Sun.sign : 'unknown'}
- 달: ${p2Moon ? p2Moon.sign + ' ' + p2Moon.house + '하우스' : 'unknown'}
- 금성: ${p2Venus ? p2Venus.sign : 'unknown'}
- 화성: ${p2Mars ? p2Mars.sign : 'unknown'}
- 상승궁: ${chart2.angles.ascendant ? chart2.angles.ascendant.sign : 'unknown'}

[긴장 어스펙트 - Red Flags 후보]
${tensionAspects || '없음'}

[조화 어스펙트 - Green Flags 후보]
${harmonyAspects || '없음'}

[특별 주의 포인트]
${criticalPairs.length > 0 ? criticalPairs.join('\n') : '특별한 위험 패턴 없음'}

총 시너스트리 어스펙트: ${synastryAspects.length}개

이 데이터를 바탕으로 두 사람의 관계 상성을 냉정하게 분석하세요.
레드플래그는 구체적인 문제 패턴을 설명하고, 그린플래그는 시너지 포인트를 명시하세요.`;

  return { system, user };
}

module.exports = { buildSynastryPrompts };
