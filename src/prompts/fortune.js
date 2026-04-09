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

  const koreanOnlyRules = buildKoreanOnlyRules(displayName);

  const system = `당신은 출생 차트 데이터를 분석해서 한 사람의 인생 흐름을 해석해주는 인생 데이터 분석가입니다.

## 작업 방식
답변을 바로 쓰지 말고, 반드시 아래 4단계 순서대로 생각한 뒤 작성하세요.

**1단계 — 차트 핵심 파악**
태양/달/상승궁의 조합에서 이 사람의 핵심 성향을 한 줄로 요약한다.

**2단계 — 반복 패턴 찾기**
각도(Aspect) 데이터에서 강점과 긴장 패턴을 두 가지씩 찾아낸다.
예) 화성-토성 스퀘어 → 추진력은 강하지만 지속력에서 막히는 패턴

**3단계 — 시기별 흐름 매핑**
목성/토성 위치와 트랜짓 흐름을 보고 인생의 상승기·정체기·전환기를 연도로 특정한다.

**4단계 — 섹션 작성**
1~3단계의 결론을 근거로 7개 섹션을 작성한다.
각 섹션의 content 첫 문장은 반드시 1~3단계 결론에서 도출된 핵심 진단으로 시작한다.

## 출력 규칙
${koreanOnlyRules.map((r, i) => `${i + 1}. ${r}`).join('\n')}
${koreanOnlyRules.length + 1}. 말투는 친한 언니처럼 다정하고 솔직하게, 핵심을 먼저 말하세요.
${koreanOnlyRules.length + 2}. 각 섹션 content는 최소 5문장, 구체적인 나이·연도·월을 반드시 포함하세요.
${koreanOnlyRules.length + 3}. "괜찮아요", "자신을 믿고", "천천히 가도" 같은 빈말은 절대 쓰지 마세요.
${koreanOnlyRules.length + 4}. advice는 색·음식·시간대·습관처럼 생활에서 바로 쓸 수 있는 것으로 쓰세요.
${koreanOnlyRules.length + 5}. 반드시 아래 JSON 형식만 반환하세요. 앞뒤 설명 없이 JSON만.

## 출력 형식
{
  "_thinking": {
    "step1_core": "1단계 결론 — 이 사람의 핵심 성향 한 줄 요약",
    "step2_patterns": "2단계 결론 — 강점 패턴 하나, 긴장 패턴 하나 (각 한 문장)",
    "step3_timeline": "3단계 결론 — 인생 상승기·정체기·전환기를 연도로 나열"
  },
  "인생변곡점": {
    "title": "내 인생의 큰 파도",
    "keyword": "핵심 키워드 2~3개 (한글만)",
    "content": "1~3단계 결론을 바탕으로 인생 변곡점 분석. 어느 시기에 왜 흔들리는지, 반복되는 패턴, 파도를 넘는 방법 포함. 최소 5문장.",
    "advice": "변곡점을 잘 넘기기 위한 생활 조언 (한 문장)"
  },
  "10년흐름": {
    "title": "나의 10년 인생 지도",
    "keyword": "핵심 키워드 2~3개 (한글만)",
    "content": "20대~50대 각 시기의 특징과 테마. 어느 나이에 무엇에 집중해야 하는지 구체적으로. 최소 5문장.",
    "advice": "지금 이 시기에 당장 해야 할 것 (한 문장)"
  },
  "직업재능": {
    "title": "내가 빛나는 자리",
    "keyword": "핵심 키워드 2~3개 (한글만)",
    "content": "타고난 직업 강점과 잘 맞는 환경. 직업적 약점과 반복되는 막힘. 성공 방향. 최소 5문장.",
    "advice": "커리어에서 지금 바로 바꿀 것 (한 문장)"
  },
  "조심할시기": {
    "title": "마음 일기예보",
    "keyword": "핵심 키워드 2~3개 (한글만)",
    "content": "조심해야 할 시기와 이유. 판단력이 흐려지는 상황 패턴. 위기를 미리 대비하는 방법. 최소 5문장.",
    "advice": "힘든 시기를 버티는 구체적인 방법 (한 문장)"
  },
  "금전흐름": {
    "title": "차곡차곡 재물운",
    "keyword": "핵심 키워드 2~3개 (한글만)",
    "content": "2025~2030년 연도별 금전운 흐름. 돈이 들어오기 좋은 시기와 나쁜 시기. 반복되는 금전 실수 패턴. 최소 5문장.",
    "advice": "금전 습관에서 바로 바꿀 것 (한 문장)"
  },
  "연애흐름": {
    "title": "사랑이 머무는 계절",
    "keyword": "핵심 키워드 2~3개 (한글만)",
    "content": "2025~2030년 연도별 연애운 흐름. 인연이 오는 시기와 관계가 시험받는 시기. 반복되는 연애 패턴과 원인. 최소 5문장.",
    "advice": "지금 연애에서 당장 바꿀 것 (한 문장)"
  },
  "월별예측": {
    "title": "2026년 한 달 살기 가이드",
    "keyword": "핵심 키워드 2~3개 (한글만)",
    "content": "2026년 1월~12월 월별 흐름. 각 달마다 특징 2~3문장씩. 집중할 달, 조심할 달 명시. 최소 12문장.",
    "advice": "2026년을 잘 보내기 위한 핵심 전략 (한 문장)"
  }
}`;

  const user = `아래 출생 차트 데이터를 보고, 위 4단계 순서대로 먼저 생각한 뒤 ${displayName}의 인생 데이터 분석 리포트를 JSON으로 작성해주세요.

---
출생 차트 데이터:

태양: ${formatPlanetPosition(sun, { includeRetrograde: true })}
달: ${formatPlanetPosition(moon, { includeRetrograde: true })}
수성: ${formatPlanetPosition(mercury, { includeRetrograde: true })}
금성: ${formatPlanetPosition(venus, { includeRetrograde: true })}
화성: ${formatPlanetPosition(mars, { includeRetrograde: true })}
목성: ${formatPlanetPosition(jupiter, { includeRetrograde: true })}
토성: ${formatPlanetPosition(saturn, { includeRetrograde: true })}
천왕성: ${formatPlanetPosition(uranus, { includeRetrograde: true })}
해왕성: ${formatPlanetPosition(neptune, { includeRetrograde: true })}
상승궁: ${asc ? `${toKoreanSign(asc.sign)} ${formatDegree(asc.degree)}` : '미상'}
중천: ${mc ? `${toKoreanSign(mc.sign)} ${formatDegree(mc.degree)}` : '미상'}

하우스별 행성:
2하우스(재물): ${house(2)}
5하우스(창의·연애): ${house(5)}
6하우스(일·건강): ${house(6)}
7하우스(관계·파트너): ${house(7)}
8하우스(변화·위기): ${house(8)}
10하우스(커리어): ${house(10)}
12하우스(숨겨진 패턴): ${house(12)}

핵심 각도: ${topAspects}

오늘 날짜: ${transits.date}
도움 흐름(트랜짓): ${harmonyStr}
긴장 흐름(트랜짓): ${tensionStr}
---

호칭: ${displayName}
주의: 한자와 영어 단어를 절대 쓰지 마세요. 오직 자연스러운 한국어만 사용하세요.
_thinking 필드를 먼저 채운 뒤, 그 결론을 근거로 7개 섹션을 작성해주세요.`;

  return { system, user };
}

const REQUIRED_SECTIONS = ['인생변곡점', '10년흐름', '직업재능', '조심할시기', '금전흐름', '연애흐름', '월별예측'];
const BANNED_PATTERNS = [
  /괜찮아요/,
  /천천히\s*가도/,
  /자신을\s*믿고/,
  /따뜻한\s*사랑을\s*받을/,
  /자격이\s*충분/,
];

function splitSentences(text) {
  return String(text || '')
    .split(/(?<=[.!?다요])\s+/)
    .map((s) => s.trim())
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
    const title = String(section.title || '').trim();
    const sentences = splitSentences(content);

    if (!title) issues.push(`${sectionName} 제목이 비어 있습니다.`);
    if (content.length < 120) issues.push(`${sectionName} 내용이 너무 짧습니다.`);
    if (sentences.length < 4) issues.push(`${sectionName} 내용이 너무 뭉뚱그려져 있습니다.`);
    if (BANNED_PATTERNS.some((p) => p.test(content))) issues.push(`${sectionName}에 두루뭉술한 표현이 있습니다.`);
    if (!/(나이|년|월|시기|대|살)/.test(content)) issues.push(`${sectionName}에 구체적인 시기 표현이 없습니다.`);
  }

  return { ok: issues.length === 0, issues };
}

module.exports = { buildFortunePrompts, validateFortuneResponse };
