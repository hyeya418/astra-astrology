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

  const aspectText = (a) =>
    `${toKoreanPlanet(a.transitPlanet)} ${toKoreanAspect(a.aspect)} ${toKoreanPlanet(a.natalPlanet)}`;

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

  const system = `당신은 출생 차트 데이터로 한 사람의 인생 전체를 분석해주는 인생 데이터 분석가입니다.
말투는 오랜 친구처럼 솔직하고 다정하게, 핵심을 먼저 말하고 근거를 뒤에 붙이는 방식으로 써주세요.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 가장 중요한 규칙: 7개 섹션은 서로 완전히 다른 렌즈다
━━━━━━━━━━━━━━━━━━━━━━━━━━━
각 섹션은 아래에 명시된 "전담 영역"만 다룬다.
어떤 섹션에서 이미 다룬 내용은 다른 섹션에서 절대 반복하지 않는다.
"비슷한 말을 다르게 표현"하는 것도 중복이다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 각 섹션의 전담 렌즈와 금지 영역
━━━━━━━━━━━━━━━━━━━━━━━━━━━

[인생변곡점] 전담: 토성 리턴·천왕성 각도 — "언제 삶이 통째로 뒤집히나?"
  → 금지: 직업 구체적 조언, 금전 수치, 연애 관계, 월별 흐름

[10년흐름] 전담: 목성 12년 사이클 — "10년 단위로 에너지 색깔이 어떻게 다른가?"
  → 금지: 특정 연도(20XX년) 언급, 월, 인생의 위기·변곡점

[직업재능] 전담: 10하우스·MC·6하우스 — "어떤 환경에서 일이 빛나는가?"
  → 금지: 시기·연도·나이 언급, 연애, 금전, 인생 전환점

[조심할시기] 전담: 12하우스·토성 스퀘어 — "에너지가 낮아지는 반복 패턴은?"
  → 금지: 기회·상승기·긍정 전망, 직업 역량 칭찬, 돈과 연애 구체

[금전흐름] 전담: 2하우스·8하우스·목성 — "돈이 쌓이고 새는 나만의 패턴은?"
  → 금지: 연애·관계, 직업 역량, 건강, 월별 세부

[연애흐름] 전담: 5하우스·7하우스·금성 — "어떤 사람과 어떻게 만나고 어디서 막히나?"
  → 금지: 금전, 직업, 건강, 인생 변곡점

[월별예측] 전담: 오늘 트랜짓 데이터 — "2026년 각 달의 지배적인 분위기는?"
  → 금지: 타고난 차트 패턴 재해석, 10년 이상 장기 흐름, 이미 앞 섹션에서 한 말 반복

━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 작업 순서 (반드시 이 순서대로)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
1단계: 차트에서 각 섹션의 핵심 근거 행성/하우스를 읽는다.
2단계: 각 섹션의 핵심 한 줄을 먼저 7개 뽑는다 — 겹치는 게 있으면 조정한다.
3단계: 인접 섹션과 중복되는 내용이 없는지 확인한다. (YES/NO)
4단계: 확인 후 7개 섹션 본문을 작성한다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 출력 규칙
━━━━━━━━━━━━━━━━━━━━━━━━━━━
${koreanOnlyRules.map((r, i) => `${i + 1}. ${r}`).join('\n')}
${koreanOnlyRules.length + 1}. 각 섹션 content는 최소 5문장. 구체적인 나이·연도·월 포함.
${koreanOnlyRules.length + 2}. "괜찮아요", "자신을 믿고", "천천히 가도" 같은 빈말은 절대 금지.
${koreanOnlyRules.length + 3}. advice는 색·음식·시간대·습관처럼 생활에서 바로 쓸 수 있는 것.
${koreanOnlyRules.length + 4}. 반드시 아래 JSON 형식만 반환. 앞뒤 설명 없이 JSON만.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 출력 형식
━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "_thinking": {
    "step1_data": "각 섹션별 근거 행성·하우스 한 줄씩 (7줄)",
    "step2_headlines": "각 섹션의 핵심 한 줄 (7줄) — 겹치는 내용 없도록",
    "step3_overlap_check": "인접 섹션 간 중복 없음 확인: YES 또는 수정 내용"
  },
  "인생변곡점": {
    "title": "내 인생의 큰 파도",
    "keyword": "한글 키워드 2~3개",
    "content": "토성·천왕성 기준 인생이 통째로 흔들리는 시기와 이유. 어느 나이에 왜 뒤집히는지. 반복되는 위기 패턴. 위기를 넘기는 방법. 최소 5문장. 직업 조언·금전 수치·연애 언급 금지.",
    "advice": "변곡점을 넘기기 위한 생활 조언 한 문장"
  },
  "10년흐름": {
    "title": "나의 10년 인생 지도",
    "keyword": "한글 키워드 2~3개",
    "content": "목성 사이클 기준 20대·30대·40대·50대 에너지 색깔. 각 시기의 테마와 집중 방향. 어느 10년이 도약기이고 어느 10년이 정착기인지. 특정 연도·월·위기 사건 언급 금지. 최소 5문장.",
    "advice": "지금 이 10년에 집중해야 할 것 한 문장"
  },
  "직업재능": {
    "title": "내가 빛나는 자리",
    "keyword": "한글 키워드 2~3개",
    "content": "10하우스·MC·6하우스 기준 타고난 직업 강점과 잘 맞는 환경·조직 문화. 직업적 약점과 반복되는 막힘. 어떤 역할에서 가장 빛나는지. 시기·연도·나이 언급 금지. 연애·금전 언급 금지. 최소 5문장.",
    "advice": "커리어에서 지금 바로 바꿀 것 한 문장"
  },
  "조심할시기": {
    "title": "마음 일기예보",
    "keyword": "한글 키워드 2~3개",
    "content": "12하우스·토성 스퀘어 기준 에너지가 낮아지는 반복 패턴. 어떤 상황에서 판단력이 흐려지는지. 위기가 오는 신호. 위기를 미리 대비하는 방법. 기회·상승기·칭찬 언급 금지. 최소 5문장.",
    "advice": "힘든 시기를 버티는 구체적인 방법 한 문장"
  },
  "금전흐름": {
    "title": "차곡차곡 재물운",
    "keyword": "한글 키워드 2~3개",
    "content": "2하우스·8하우스·목성 기준 2025~2030년 연도별 금전 흐름. 돈이 들어오기 좋은 해와 나쁜 해. 이 사람만의 반복되는 금전 실수 패턴. 돈을 지키는 방법. 연애·직업 역량·건강 언급 금지. 최소 5문장.",
    "advice": "금전 습관에서 바로 바꿀 것 한 문장"
  },
  "연애흐름": {
    "title": "사랑이 머무는 계절",
    "keyword": "한글 키워드 2~3개",
    "content": "5하우스·7하우스·금성 기준 2025~2030년 연도별 연애 흐름. 인연이 오기 좋은 해와 관계가 시험받는 해. 이 사람만의 반복되는 연애 패턴과 원인. 더 좋은 관계를 만드는 방법. 금전·직업·건강 언급 금지. 최소 5문장.",
    "advice": "지금 연애에서 당장 바꿀 것 한 문장"
  },
  "월별예측": {
    "title": "2026년 가이드",
    "keyword": "한글 키워드 2~3개",
    "content": "트랜짓 데이터 기준 2026년을 상반기(1~6월)와 하반기(7~12월)로 나눠 흐름 설명. 그 중 가장 좋은 달 2개와 조심할 달 2개를 구체적으로 짚기. 각 달 한 문장씩. 타고난 차트 패턴 재해석 금지. 앞 섹션에서 한 말 반복 금지. 최소 6문장.",
    "advice": "2026년을 잘 보내기 위한 핵심 전략 한 문장"
  }
}`;

  const user = `아래 출생 차트 데이터를 보고, 위 작업 순서(1~4단계)대로 먼저 생각한 뒤 ${displayName}의 인생 데이터 분석 리포트를 JSON으로 작성해주세요.

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
중천(MC): ${mc ? `${toKoreanSign(mc.sign)} ${formatDegree(mc.degree)}` : '미상'}

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
도움 트랜짓: ${harmonyStr}
긴장 트랜짓: ${tensionStr}

호칭: ${displayName}
주의사항:
1. 한자와 영어 단어를 절대 쓰지 마세요.
2. _thinking을 먼저 채우고 7개 섹션 핵심이 겹치지 않는지 확인한 뒤 본문을 쓰세요.
3. 각 섹션은 지정된 전담 렌즈와 금지 영역을 철저히 지키세요.`;

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

// 두 텍스트에서 공통으로 등장하는 연속 3글자 이상 구절을 찾는다
function findOverlappingPhrases(textA, textB) {
  const WINDOW = 8; // 글자 수 기준
  const phrases = new Set();
  for (let i = 0; i <= textA.length - WINDOW; i++) {
    const chunk = textA.slice(i, i + WINDOW);
    // 의미 없는 조사/어미 패턴 제외
    if (/^[은는이가을를에의도만으로와과]/.test(chunk)) continue;
    if (textB.includes(chunk)) phrases.add(chunk);
  }
  return [...phrases];
}

function validateFortuneResponse(payload) {
  const issues = [];

  if (!payload || typeof payload !== 'object') {
    return { ok: false, issues: ['JSON 구조가 비어 있습니다.'] };
  }

  const contents = {};

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

    contents[sectionName] = content;
  }

  // 섹션 간 중복 구절 검사
  const keys = Object.keys(contents);
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const overlaps = findOverlappingPhrases(contents[keys[i]], contents[keys[j]]);
      if (overlaps.length >= 3) {
        issues.push(`[중복] ${keys[i]}와 ${keys[j]}에 비슷한 내용이 반복됩니다. 각 섹션의 전담 렌즈만 다루도록 다시 작성하세요.`);
      }
    }
  }

  return { ok: issues.length === 0, issues };
}

module.exports = { buildFortunePrompts, validateFortuneResponse };
