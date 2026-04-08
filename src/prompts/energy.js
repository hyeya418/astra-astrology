'use strict';

const {
  buildKoreanOnlyRules,
  formatNameWithSuffix,
  formatPlanetPosition,
  toKoreanAspect,
  toKoreanPlanet,
  toKoreanSign,
} = require('./utils');

/**
 * Build prompts for today's energy analysis.
 * Uses natal chart + today's transits.
 */
function buildEnergyPrompts(chart, transits, name) {
  const sun = chart.planets.find((p) => p.name === 'Sun');
  const moon = chart.planets.find((p) => p.name === 'Moon');
  const asc = chart.angles.ascendant;
  const displayName = formatNameWithSuffix(name);

  const formatTransit = (transit) => (
    `${toKoreanPlanet(transit.transitPlanet)}${transit.transitRetrograde ? ' 역행' : ''} `
    + `${toKoreanAspect(transit.aspect)} `
    + `${toKoreanPlanet(transit.natalPlanet)} `
    + `(차이 ${transit.orb}도)`
  );

  const tensionTransits = transits.transits
    .filter((t) => t.energy === 'tension')
    .slice(0, 5)
    .map(formatTransit)
    .join('\n');

  const harmonyTransits = transits.transits
    .filter((t) => t.energy === 'harmony')
    .slice(0, 5)
    .map(formatTransit)
    .join('\n');

  const neutralTransits = transits.transits
    .filter((t) => t.energy === 'neutral')
    .slice(0, 3)
    .map(formatTransit)
    .join('\n');

  const rules = [
    ...buildKoreanOnlyRules(displayName),
    '개발자 비유나 기계 비유를 쓰지 마세요.',
    '"오늘은 예민할 수 있어요", "사람들과 부딪히기 쉬워요", "혼자 정리하는 시간이 도움 돼요"처럼 일상어로 설명하세요.',
    '불안감을 지나치게 키우지 말고, 현실적이고 부드럽게 설명하세요.',
    '반드시 "오늘", "오늘은", "오늘 하루" 같은 표현만 사용하세요.',
    '"지금", "요즘", "최근", "현재 시기", "당분간" 같은 표현은 쓰지 마세요.',
    'summary는 한 문장으로 쓰세요.',
    'detail은 3문장 이하로 쓰세요.',
    'advice의 각 항목은 짧고 쉬운 행동 문장으로 쓰세요.',
    '반드시 JSON만 반환하세요.',
  ];

  const system = `당신은 오늘의 분위기를 쉽게 풀어주는 친절한 라이프 가이드입니다.
점성술 데이터는 내부 참고용으로만 사용하고, 최종 답변은 점성술을 전혀 모르는 사람도 바로 이해할 수 있는 쉬운 한국어로 작성하세요.
이 분석은 오직 오늘 하루의 흐름만 설명하는 탭입니다.

반드시 지킬 규칙:
${rules.map((rule, index) => `${index + 1}. ${rule}`).join('\n')}

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
- 이름 호칭: ${displayName}
- 태양: ${formatPlanetPosition(sun)}
- 달: ${formatPlanetPosition(moon)}
- 상승궁: ${asc ? toKoreanSign(asc.sign) : '미상'}

긴장 성향 흐름:
${tensionTransits || '없음'}

도움이 되는 흐름:
${harmonyTransits || '없음'}

중립 흐름:
${neutralTransits || '없음'}

총 흐름 수: ${transits.transits.length}

위 데이터를 참고해서 ${displayName}의 오늘 분위기를 쉬운 말로 설명해주세요.
반드시 오늘 하루 기준으로만 설명하고, 요즘이나 현재 시기 전체를 말하는 듯한 표현은 쓰지 마세요.
사용자는 점성술 용어를 모른다고 가정하고, 일상에서 바로 이해되는 표현만 써주세요.
한자나 영어 표현은 섞지 마세요.`;

  return { system, user };
}

module.exports = { buildEnergyPrompts };
