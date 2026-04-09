'use strict';

const {
  buildDirectReadingRules,
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
    ...buildDirectReadingRules(displayName),
    '말투는 친한 언니처럼 다정하고 솔직하게, 핵심을 먼저 말한 뒤 설명하세요.',
    '각 섹션의 content는 최소 5문장 이상으로 작성하세요.',
    '각 섹션의 첫 문장은 해당 영역의 핵심을 한 문장으로 단정적으로 요약하세요.',
    '시기와 나이를 구체적으로 언급하세요 (예: 27세~32세, 2025~2027년 등).',
    '중간에는 반복되는 패턴, 약점, 막히는 지점을 구체적으로 설명하세요.',
    '마지막에는 바로 적용할 수 있는 해결책을 두 가지 이상 자연스럽게 녹여 쓰세요.',
    'advice는 색, 음식, 운동, 시간대, 인간관계 태도, 일 습관처럼 생활 단위의 실천 행동으로 쓰세요.',
    '"많이 쉬세요", "긍정적으로 생각하세요", "괜찮아요" 같은 빈말은 쓰지 마세요.',
    '일곱 섹션이 하나의 인생 분석 리포트처럼 자연스럽게 이어지게 쓰세요.',
    '반드시 JSON만 반환하세요.',
  ];

  const system = `당신은 출생 차트 데이터를 분석해서 한 사람의 인생 흐름을 구체적으로 해석해주는 인생 데이터 분석가입니다.
점성술 데이터는 내부 참고용으로만 사용하고, 최종 답변은 점성술을 모르는 사람도 편하게 읽을 수 있는 친근한 한국어로 작성하세요.
마치 오래된 친한 언니가 솔직하게 인생 조언을 해주는 톤으로 쓰세요.

반드시 지킬 규칙:
${rules.map((rule, index) => `${index + 1}. ${rule}`).join('\n')}

출력 형식:
{
  "인생변곡점": {
    "title": "내 인생의 큰 파도",
    "keyword": "핵심 키워드 2~3개",
    "content": "인생에서 가장 큰 변화가 일어나는 시기와 사건들, 왜 그 시기에 흔들리는지, 반복되는 패턴, 파도를 넘는 방법",
    "advice": "변곡점을 잘 넘기기 위한 생활 조언"
  },
  "10년흐름": {
    "title": "나의 10년 인생 지도",
    "keyword": "핵심 키워드 2~3개",
    "content": "20대/30대/40대/50대 각 시기의 특징과 중요한 테마, 어떤 시기에 무엇에 집중해야 하는지, 나이대별 에너지 흐름",
    "advice": "지금 이 시기에 집중해야 할 것"
  },
  "직업재능": {
    "title": "내가 빛나는 자리",
    "keyword": "핵심 키워드 2~3개",
    "content": "타고난 직업적 재능과 강점, 잘 맞는 분야와 환경, 직업적 약점과 막히는 패턴, 성공적인 커리어를 위한 방향",
    "advice": "지금 당장 커리어에 적용할 수 있는 조언"
  },
  "조심할시기": {
    "title": "마음 일기예보",
    "keyword": "핵심 키워드 2~3개",
    "content": "특별히 조심해야 할 시기와 이유, 어떤 상황에서 판단력이 흐려지는지, 반복적으로 실수하는 패턴, 위기를 미리 대비하는 방법",
    "advice": "힘든 시기를 버티는 구체적인 방법"
  },
  "금전흐름": {
    "title": "차곡차곡 재물운",
    "keyword": "핵심 키워드 2~3개",
    "content": "연도별 금전운의 흐름 (2025~2030년), 돈이 들어오기 좋은 시기와 나쁜 시기, 반복되는 금전 문제 패턴, 재물운을 높이는 방법",
    "advice": "금전 습관에서 바로 바꿀 것"
  },
  "연애흐름": {
    "title": "사랑이 머무는 계절",
    "keyword": "핵심 키워드 2~3개",
    "content": "연도별 연애운 흐름 (2025~2030년), 인연이 오기 좋은 시기와 관계가 시험받는 시기, 반복되는 연애 패턴과 원인, 더 좋은 관계를 만드는 방법",
    "advice": "지금 연애에서 당장 바꿀 것"
  },
  "월별예측": {
    "title": "2026년 한 달 살기 가이드",
    "keyword": "핵심 키워드 2~3개",
    "content": "2026년 월별 흐름 예측: 1월부터 12월까지 각 달의 특징을 2~3문장씩, 어떤 달에 어떤 일에 집중하면 좋은지, 조심해야 할 달과 이유",
    "advice": "2026년을 잘 보내기 위한 핵심 전략"
  }
}`;

  const user = `다음 출생 차트 정보를 바탕으로 ${displayName}의 인생 데이터 분석 리포트를 작성해주세요.

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
- 2하우스(재물): ${house(2)}
- 5하우스(창의/연애): ${house(5)}
- 6하우스(일/건강): ${house(6)}
- 7하우스(관계/파트너): ${house(7)}
- 8하우스(변화/위기): ${house(8)}
- 10하우스(커리어): ${house(10)}
- 12하우스(숨겨진 패턴): ${house(12)}

핵심 각도:
${topAspects}

오늘 날짜: ${transits.date}
- 도움 흐름: ${harmonyStr}
- 긴장 흐름: ${tensionStr}

각 섹션은 ${displayName}에게 직접 이야기하듯 자연스럽게 작성해주세요.
특히 시기와 나이를 구체적으로 언급하고, 뜬구름 잡는 이야기 대신 실제 삶에서 일어나는 상황들로 설명해주세요.
한자와 영어를 절대 섞지 말고, 오직 자연스러운 한국어만 사용해주세요.
title과 keyword도 한글로만 작성해주세요.

좋은 문장 예시:
- ${displayName}은 30대 초반에 직업적으로 가장 큰 기회를 만나게 되는데, 이 시기를 그냥 흘려보내면 40대까지 영향을 미칩니다.
- 2027년은 금전적으로 가장 조심해야 할 해입니다. 투자나 큰 지출은 2028년 이후로 미루는 게 낫습니다.

피해야 할 문장 예시:
- ${displayName}은 따뜻한 사랑을 받을 자격이 충분한 분입니다.
- 지금은 자신을 믿고 천천히 가도 괜찮아요.`;

  return { system, user };
}

const REQUIRED_SECTIONS = ['인생변곡점', '10년흐름', '직업재능', '조심할시기', '금전흐름', '연애흐름', '월별예측'];
const BANNED_PATTERNS = [
  /괜찮아요/,
  /천천히\s*가도/,
  /자신을\s*믿고/,
  /현재\s+[은을를이가에의와과도만로]/,
  /따뜻한\s*사랑을\s*받을/,
  /자격이\s*충분/,
  /한\s*면에서는/,
  /다른\s*면에서는/,
];

function splitSentences(text) {
  return String(text || '')
    .split(/(?<=[.!?다요])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function validateFortuneResponse(payload) {
  const issues = [];

  if (!payload || typeof payload !== 'object') {
    return { ok: false, issues: ['JSON 구조가 비어 있습니다.'] };
  }

  for (const sectionName of REQUIRED_SECTIONS) {
    const section = payload[sectionName];
    if (!section || typeof section !== 'object') {
      issues.push(`${sectionName} 섹션이 없습니다.`);
      continue;
    }

    const content = String(section.content || '').trim();
    const advice = String(section.advice || '').trim();
    const title = String(section.title || '').trim();
    const sentences = splitSentences(content);

    if (!title) {
      issues.push(`${sectionName} 제목이 비어 있습니다.`);
    }

    if (content.length < 120) {
      issues.push(`${sectionName} 내용이 너무 짧습니다.`);
    }

    if (sentences.length < 4) {
      issues.push(`${sectionName} 내용이 너무 뭉뚱그려져 있습니다.`);
    }

    if (BANNED_PATTERNS.some((pattern) => pattern.test(content))) {
      issues.push(`${sectionName}에 두루뭉술한 표현이 들어 있습니다.`);
    }

    if (!/(구체적|바로|실제로|습관|행동|정리|줄이|늘리|피하|선택|기준|루틴|운동|시간|관계|돈|일|시기|나이|년|월)/.test(content + advice)) {
      issues.push(`${sectionName}에 구체적인 시기나 실천 가능한 내용이 부족합니다.`);
    }
  }

  return { ok: issues.length === 0, issues };
}

module.exports = { buildFortunePrompts, validateFortuneResponse };
