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
    '말투는 다정하되 흐리지 말고, 핵심을 먼저 말한 뒤 설명을 붙이세요.',
    '각 섹션의 content는 최소 5문장 이상으로 작성하세요.',
    '각 섹션의 첫 문장은 해당 영역의 핵심 상태를 한 문장으로 단정적으로 요약하세요.',
    '둘째 문장부터는 왜 이런 흐름이 생기는지 원인과 근거를 쉬운 한국어로 설명하세요.',
    '중간에는 반복되는 문제 패턴, 약점, 감정 습관, 막히는 지점을 구체적으로 설명하세요.',
    '마지막에는 바로 적용할 수 있는 해결책을 두 가지 이상 자연스럽게 녹여 쓰세요.',
    '비유를 쓰더라도 강한 한 문장 비유만 사용하고, 흔한 위로 문구처럼 쓰지 마세요.',
    'advice는 색, 음식, 운동, 시간대, 인간관계 태도, 일 습관처럼 생활 단위의 실천 행동으로 쓰세요.',
    '"많이 쉬세요", "긍정적으로 생각하세요", "괜찮아요" 같은 빈말은 쓰지 마세요.',
    '일곱 섹션이 하나의 리포트처럼 자연스럽게 이어지게 쓰세요.',
    '반드시 JSON만 반환하세요.',
  ];

  const system = `당신은 출생 차트와 현재 흐름을 바탕으로 삶의 여러 영역을 따뜻하고 깊이 있게 해석해주는 점성술 리포트 작성자입니다.
점성술 데이터는 내부 참고용으로만 사용하고, 최종 답변은 점성술을 모르는 사람도 편하게 읽을 수 있는 쉬운 한국어로 작성하세요.

반드시 지킬 규칙:
${rules.map((rule, index) => `${index + 1}. ${rule}`).join('\n')}

출력 형식:
{
  "총운": { "title": "전체 흐름 제목", "keyword": "핵심 키워드 2~3개", "content": "핵심 진단, 원인, 반복 패턴, 해결책이 모두 들어간 본문", "advice": "바로 실천할 수 있는 생활 조언" },
  "금전운": { "title": "금전 흐름 제목", "keyword": "핵심 키워드 2~3개", "content": "돈 문제의 성향, 막히는 패턴, 해결 방식이 담긴 본문", "advice": "금전 습관 조언" },
  "직업운": { "title": "직업 흐름 제목", "keyword": "핵심 키워드 2~3개", "content": "일의 강점과 막히는 지점, 돌파법이 담긴 본문", "advice": "업무 습관 조언" },
  "연애결혼운": { "title": "관계 흐름 제목", "keyword": "핵심 키워드 2~3개", "content": "관계 패턴, 감정 습관, 해결책이 담긴 본문", "advice": "관계 행동 조언" },
  "건강운": { "title": "건강 흐름 제목", "keyword": "핵심 키워드 2~3개", "content": "몸과 마음의 패턴, 무너지는 지점, 관리법이 담긴 본문", "advice": "생활 관리 조언" },
  "인간관계사회운": { "title": "사회적 관계 제목", "keyword": "핵심 키워드 2~3개", "content": "사람 사이에서 반복되는 태도와 해결책이 담긴 본문", "advice": "대인관계 조언" },
  "미래운": { "title": "앞으로의 흐름 제목", "keyword": "핵심 키워드 2~3개", "content": "앞으로의 성장 방향과 필요한 태도가 담긴 본문", "advice": "미래 준비 조언" }
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
특히 title과 keyword도 한글로만 작성해주세요.
해석이 두루뭉술하면 안 됩니다. 각 섹션마다 반드시 아래 흐름이 들어가야 합니다.
- 첫 문장: 핵심 진단
- 다음 문장들: 왜 그런지에 대한 원인 설명
- 중간: 반복되는 문제 패턴이나 약점
- 마지막: 바로 할 수 있는 해결책

좋은 문장 예시:
- ${displayName}은 겉으로 단단해 보여도, 실제로는 혼자 책임을 다 떠안는 쪽으로 기울기 쉽습니다.
- 불씨가 약한 사람은 의욕이 없는 게 아니라, 몸과 마음을 데우는 방식이 남들보다 더 필요합니다.

피해야 할 문장 예시:
- ${displayName}은 따뜻한 사랑을 받을 자격이 충분한 분입니다.
- 지금은 자신을 믿고 천천히 가도 괜찮아요.`;

  return { system, user };
}

const REQUIRED_SECTIONS = ['총운', '금전운', '직업운', '연애결혼운', '건강운', '인간관계사회운', '미래운'];
const BANNED_PATTERNS = [
  /한\s*면에서는/,
  /다른\s*면에서는/,
  /여러\s*가지\s*상황/,
  /삶의\s*여러\s*가지\s*상황/,
  /돌아보는\s*시간/,
  /중요한\s*계기/,
  /선택이\s*가능/,
  /미래를\s*결정/,
  /가치관과\s*목표/,
  /괜찮아요/,
  /천천히\s*가도/,
  /자신을\s*믿고/,
  /현재\s+[은을를이가에의와과도만로]/,
  /무엇이\s+으로/,
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
      issues.push(`${sectionName}에 번역투이거나 두루뭉술한 표현이 들어 있습니다.`);
    }

    if (!/(구체적|바로|실제로|습관|행동|정리|줄이|늘리|피하|선택|기준|루틴|운동|시간|관계|돈|일)/.test(content + advice)) {
      issues.push(`${sectionName}에 실천 가능한 해결책이 부족합니다.`);
    }
  }

  return { ok: issues.length === 0, issues };
}

module.exports = { buildFortunePrompts, validateFortuneResponse };
