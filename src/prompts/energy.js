'use strict';

/**
 * Build prompts for today's energy analysis.
 * Uses natal chart + today's transits.
 */
function buildEnergyPrompts(chart, transits) {
  const sun = chart.planets.find((p) => p.name === 'Sun');
  const moon = chart.planets.find((p) => p.name === 'Moon');
  const asc = chart.angles.ascendant;

  const tensionTransits = transits.transits
    .filter((t) => t.energy === 'tension')
    .slice(0, 5)
    .map((t) => `${t.transitPlanet}${t.transitRetrograde ? 'R' : ''} ${t.aspect} natal ${t.natalPlanet} (orb: ${t.orb}deg)`)
    .join('\n');

  const harmonyTransits = transits.transits
    .filter((t) => t.energy === 'harmony')
    .slice(0, 5)
    .map((t) => `${t.transitPlanet}${t.transitRetrograde ? 'R' : ''} ${t.aspect} natal ${t.natalPlanet} (orb: ${t.orb}deg)`)
    .join('\n');

  const neutralTransits = transits.transits
    .filter((t) => t.energy === 'neutral')
    .slice(0, 3)
    .map((t) => `${t.transitPlanet} ${t.aspect} natal ${t.natalPlanet} (orb: ${t.orb}deg)`)
    .join('\n');

  const system = `당신은 오늘의 분위기를 쉽게 풀어주는 친절한 라이프 가이드입니다.
점성술 데이터는 내부 참고용으로만 사용하고, 최종 답변은 점성술을 전혀 모르는 사람도 바로 이해할 수 있는 쉬운 한국어로 작성하세요.

반드시 지킬 규칙:
1. Opposition, Square, Conjunction, transit 같은 점성술 용어를 그대로 쓰지 마세요.
2. CPU, 리부팅, 시스템 오류, 업데이트 같은 개발자 비유를 쓰지 마세요.
3. "오늘은 예민할 수 있어요", "사람들과 부딪히기 쉬워요", "혼자 정리하는 시간이 도움 돼요"처럼 일상어로 설명하세요.
4. 불안감을 지나치게 키우지 말고, 현실적이고 부드럽게 설명하세요.
5. summary는 한 문장으로 쓰세요.
6. detail은 3문장 이하로 쓰세요.
7. advice의 각 항목은 짧고 쉬운 행동 문장으로 쓰세요.
8. 영어 섞지 말고 자연스러운 한국어만 쓰세요.

반드시 JSON만 반환하세요.

출력 형식:
{
  "title": "오늘의 에너지",
  "level": "high | medium | low | chaos",
  "summary": "오늘 하루 분위기를 쉬운 말로 한 줄 요약",
  "detail": "왜 이런 분위기인지 쉬운 일상어로 설명",
  "advice": {
    "do": ["하면 좋은 행동 1", "하면 좋은 행동 2", "하면 좋은 행동 3"],
    "dont": ["피하면 좋은 행동 1", "피하면 좋은 행동 2", "피하면 좋은 행동 3"]
  }
}`;

  const user = `오늘 날짜: ${transits.date}

기본 성향 참고:
- 태양: ${sun ? `${sun.sign} ${sun.house}house` : 'unknown'}
- 달: ${moon ? `${moon.sign} ${moon.house}house` : 'unknown'}
- 상승궁: ${asc ? asc.sign : 'unknown'}

긴장 성향 트랜짓:
${tensionTransits || 'none'}

도움이 되는 트랜짓:
${harmonyTransits || 'none'}

중립 트랜짓:
${neutralTransits || 'none'}

총 트랜짓 수: ${transits.transits.length}

위 데이터를 참고해서 오늘의 분위기를 쉬운 말로 설명해주세요.
사용자는 점성술 용어와 개발 용어를 모른다고 가정하고, 일상에서 바로 이해되는 표현만 써주세요.`;

  return { system, user };
}

module.exports = { buildEnergyPrompts };
