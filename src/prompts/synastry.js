'use strict';

/**
 * Build prompts for synastry analysis.
 */
function buildSynastryPrompts(chart1, chart2, synastryAspects) {
  const tensionAspects = synastryAspects
    .filter((a) => ['Square', 'Opposition'].includes(a.aspect))
    .slice(0, 8)
    .map((a) => `사람1 ${a.person1Planet} / 사람2 ${a.person2Planet} / 각도 차이 ${a.orb}도`)
    .join('\n');

  const harmonyAspects = synastryAspects
    .filter((a) => ['Trine', 'Sextile', 'Conjunction'].includes(a.aspect))
    .slice(0, 8)
    .map((a) => `사람1 ${a.person1Planet} / 사람2 ${a.person2Planet} / 각도 차이 ${a.orb}도`)
    .join('\n');

  const criticalPairs = [];

  const marsMoon = synastryAspects.find(
    (a) => a.person2Planet === 'Mars' && a.person1Planet === 'Moon' && ['Square', 'Opposition'].includes(a.aspect),
  );
  if (marsMoon) {
    criticalPairs.push('사람2의 화성과 사람1의 달이 부딪히기 쉬운 배치가 있어 감정 충돌 가능성이 높습니다.');
  }

  const saturnSun = synastryAspects.find(
    (a) => a.person2Planet === 'Saturn' && a.person1Planet === 'Sun' && ['Square', 'Opposition', 'Conjunction'].includes(a.aspect),
  );
  if (saturnSun) {
    criticalPairs.push('사람2가 사람1을 답답하게 느끼게 하거나, 관계가 무겁게 흘러갈 가능성이 있습니다.');
  }

  const p1Sun = chart1.planets.find((p) => p.name === 'Sun');
  const p1Moon = chart1.planets.find((p) => p.name === 'Moon');
  const p1Venus = chart1.planets.find((p) => p.name === 'Venus');
  const p1Mars = chart1.planets.find((p) => p.name === 'Mars');

  const p2Sun = chart2.planets.find((p) => p.name === 'Sun');
  const p2Moon = chart2.planets.find((p) => p.name === 'Moon');
  const p2Venus = chart2.planets.find((p) => p.name === 'Venus');
  const p2Mars = chart2.planets.find((p) => p.name === 'Mars');

  const system = `당신은 두 사람의 관계 분위기를 쉽게 설명해주는 관계 분석가입니다.
점성술 데이터는 참고만 하고, 최종 결과는 점성술을 모르는 사람도 바로 이해할 수 있는 쉬운 한국어로 작성하세요.
이 분석은 오늘의 관계 운세가 아니라, 두 사람 사이의 기본적인 관계 패턴을 설명하는 탭입니다.

반드시 지킬 규칙:
1. 영어 행성명이나 영어 점성술 용어를 쓰지 마세요.
2. 태양, 달, 금성, 화성처럼 한글 이름만 사용하세요.
3. 두 사람이 함께 있을 때 반복되기 쉬운 기본 패턴을 설명하세요.
4. "오늘", "요즘", "최근", "현재 시기", "지금은" 같은 시기 표현은 쓰지 마세요.
5. 겁주는 말보다 현실적이고 따뜻한 설명을 하세요.
6. 반드시 JSON만 반환하세요.

출력 형식:
{
  "title": "관계 분석 리포트",
  "compatibility": 0,
  "redFlags": ["주의할 점 1", "주의할 점 2"],
  "greenFlags": ["좋은 점 1", "좋은 점 2"],
  "verdict": "관계에 대한 한 줄 정리"
}`;

  const user = `관계 분석 참고 정보:

[사람 1]
- 태양: ${p1Sun ? p1Sun.sign : '미상'}
- 달: ${p1Moon ? `${p1Moon.sign} ${p1Moon.house}하우스` : '미상'}
- 금성: ${p1Venus ? p1Venus.sign : '미상'}
- 화성: ${p1Mars ? p1Mars.sign : '미상'}
- 상승궁: ${chart1.angles.ascendant ? chart1.angles.ascendant.sign : '미상'}

[사람 2]
- 태양: ${p2Sun ? p2Sun.sign : '미상'}
- 달: ${p2Moon ? `${p2Moon.sign} ${p2Moon.house}하우스` : '미상'}
- 금성: ${p2Venus ? p2Venus.sign : '미상'}
- 화성: ${p2Mars ? p2Mars.sign : '미상'}
- 상승궁: ${chart2.angles.ascendant ? chart2.angles.ascendant.sign : '미상'}

[긴장되는 흐름]
${tensionAspects || '없음'}

[잘 맞는 흐름]
${harmonyAspects || '없음'}

[특별히 주의할 점]
${criticalPairs.length > 0 ? criticalPairs.join('\n') : '없음'}

영어 행성명 없이, 두 사람의 관계에서 좋은 점과 조심할 점을 쉬운 한국어로 설명해주세요.
반드시 두 사람 사이의 기본 패턴만 설명하고, 오늘이나 최근 흐름처럼 들리는 표현은 쓰지 마세요.`;

  return { system, user };
}

module.exports = { buildSynastryPrompts };
