'use strict';

const {
  buildKoreanOnlyRules,
  formatDegree,
  formatNameWithSuffix,
  formatPlanetPosition,
  toKoreanAspect,
  toKoreanPlanet,
  toKoreanSign,
} = require('./utils');

function buildFortunePrompts(chart, transits, name) {
  const sun = chart.planets.find((p) => p.name === 'Sun');
  const moon = chart.planets.find((p) => p.name === 'Moon');
  const mercury = chart.planets.find((p) => p.name === 'Mercury');
  const venus = chart.planets.find((p) => p.name === 'Venus');
  const mars = chart.planets.find((p) => p.name === 'Mars');
  const jupiter = chart.planets.find((p) => p.name === 'Jupiter');
  const saturn = chart.planets.find((p) => p.name === 'Saturn');
  const uranus = chart.planets.find((p) => p.name === 'Uranus');
  const neptune = chart.planets.find((p) => p.name === 'Neptune');
  const asc = chart.angles.ascendant;
  const mc = chart.angles.mc;
  const displayName = formatNameWithSuffix(name);

  const house = (n) => chart.planets
    .filter((p) => p.house === n)
    .map((p) => `${toKoreanPlanet(p.name)}(${toKoreanSign(p.sign)})`)
    .join(', ') || '없음';

  const aspectText = (aspect) => (
    `${toKoreanPlanet(aspect.transitPlanet)} ${toKoreanAspect(aspect.aspect)} ${toKoreanPlanet(aspect.natalPlanet)}`
  );

  const harmonyStr = transits.transits
    .filter((t) => t.energy === 'harmony')
    .slice(0, 5)
    .map(aspectText)
    .join(' / ') || '없음';

  const tensionStr = transits.transits
    .filter((t) => t.energy === 'tension')
    .slice(0, 5)
    .map(aspectText)
    .join(' / ') || '없음';

  const topAspects = chart.aspects
    .slice(0, 10)
    .map((a) => `${toKoreanPlanet(a.planet1)} ${toKoreanAspect(a.aspect)} ${toKoreanPlanet(a.planet2)}`)
    .join(', ') || '없음';

  const rules = [
    ...buildKoreanOnlyRules(displayName),
    '말투는 부드럽고 다정한 존댓말로 유지하세요.',
    '각 섹션의 content는 최소 5문장 이상으로 충분히 자세하게 작성하세요.',
    '비유를 쓰더라도 과장하지 말고, 읽는 사람이 바로 이해할 수 있게 설명하세요.',
    '왜 그런 흐름이 보이는지 근거를 쉬운 한국어로 함께 풀어주세요.',
    'advice는 바로 실천할 수 있는 구체적인 행동 제안으로 작성하세요.',
    '일곱 섹션이 하나의 리포트처럼 자연스럽게 이어지게 쓰세요.',
    '반드시 JSON만 반환하세요.',
  ];

  const system = `당신은 출생 차트와 현재 흐름을 바탕으로 삶의 여러 영역을 따뜻하고 깊이 있게 해석해주는 점성술 리포트 작성자입니다.
점성술 데이터는 내부 참고용으로만 사용하고, 최종 답변은 점성술을 모르는 사람도 편하게 읽을 수 있는 쉬운 한국어로 작성하세요.

반드시 지킬 규칙:
${rules.map((rule, index) => `${index + 1}. ${rule}`).join('\n')}

출력 형식:
{
  "총운": { "title": "전체 흐름 제목", "keyword": "핵심 키워드 2~3개", "content": "전체 흐름 설명", "advice": "실천 조언" },
  "금전운": { "title": "금전 흐름 제목", "keyword": "핵심 키워드 2~3개", "content": "금전 흐름 설명", "advice": "금전 조언" },
  "직업운": { "title": "직업 흐름 제목", "keyword": "핵심 키워드 2~3개", "content": "직업 흐름 설명", "advice": "직업 조언" },
  "연애결혼운": { "title": "관계 흐름 제목", "keyword": "핵심 키워드 2~3개", "content": "연애와 관계 설명", "advice": "관계 조언" },
  "건강운": { "title": "건강 흐름 제목", "keyword": "핵심 키워드 2~3개", "content": "건강 흐름 설명", "advice": "건강 조언" },
  "인간관계사회운": { "title": "사회적 관계 제목", "keyword": "핵심 키워드 2~3개", "content": "인간관계 흐름 설명", "advice": "관계 조언" },
  "미래운": { "title": "앞으로의 흐름 제목", "keyword": "핵심 키워드 2~3개", "content": "미래 방향 설명", "advice": "미래 조언" }
}`;

  const user = `다음 출생 차트 정보를 바탕으로 ${displayName}의 일곱 가지 운세 리포트를 작성해주세요.

기본 정보:
- 이름 호칭: ${displayName}
- 태양: ${formatPlanetPosition(sun, { includeRetrograde: true })}
- 달: ${formatPlanetPosition(moon, { includeRetrograde: true })}
- 수성: ${formatPlanetPosition(mercury, { includeRetrograde: true })}
- 금성: ${formatPlanetPosition(venus, { includeRetrograde: true })}
- 화성: ${formatPlanetPosition(mars, { includeRetrograde: true })}
- 목성: ${formatPlanetPosition(jupiter, { includeRetrograde: true })}
- 토성: ${formatPlanetPosition(saturn, { includeRetrograde: true })}
- 천왕성: ${formatPlanetPosition(uranus, { includeRetrograde: true })}
- 해왕성: ${formatPlanetPosition(neptune, { includeRetrograde: true })}
- 상승궁: ${asc ? `${toKoreanSign(asc.sign)} ${formatDegree(asc.degree)}` : '미상'}
- 중천: ${mc ? `${toKoreanSign(mc.sign)} ${formatDegree(mc.degree)}` : '미상'}

하우스별 주요 행성:
- 2하우스: ${house(2)}
- 5하우스: ${house(5)}
- 6하우스: ${house(6)}
- 7하우스: ${house(7)}
- 8하우스: ${house(8)}
- 10하우스: ${house(10)}
- 12하우스: ${house(12)}

핵심 각도:
${topAspects}

오늘 날짜: ${transits.date}
- 도움 흐름: ${harmonyStr}
- 긴장 흐름: ${tensionStr}

각 섹션은 ${displayName}에게 직접 이야기하듯 자연스럽게 작성해주세요.
총운에서 금전운, 직업운, 연애결혼운, 건강운, 인간관계사회운, 미래운으로 이어지는 흐름이 자연스럽게 연결되면 좋겠습니다.
한자와 영어를 절대 섞지 말고, 오직 자연스러운 한국어만 사용해주세요.
특히 title과 keyword도 한글로만 작성해주세요.`;

  return { system, user };
}

module.exports = { buildFortunePrompts };
