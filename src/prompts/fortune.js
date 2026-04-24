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
  const find = (n) => chart.planets.find((p) => p.name === n);
  const pos = (n) => formatPlanetPosition(find(n), { includeRetrograde: true });

  const asc = chart.angles.ascendant;
  const mc = chart.angles.mc;
  const displayName = formatNameWithSuffix(name);

  const house = (n) => chart.planets
    .filter((p) => p.house === n)
    .map((p) => `${toKoreanPlanet(p.name)}(${toKoreanSign(p.sign)})`)
    .join(', ') || '없음';

  const harmonyStr = transits.transits
    .filter((t) => t.energy === 'harmony').slice(0, 4)
    .map((t) => `${toKoreanPlanet(t.transitPlanet)} ${toKoreanAspect(t.aspect)} ${toKoreanPlanet(t.natalPlanet)}`)
    .join(' / ') || '없음';

  const tensionStr = transits.transits
    .filter((t) => t.energy === 'tension').slice(0, 4)
    .map((t) => `${toKoreanPlanet(t.transitPlanet)} ${toKoreanAspect(t.aspect)} ${toKoreanPlanet(t.natalPlanet)}`)
    .join(' / ') || '없음';

  const topAspects = chart.aspects.slice(0, 8)
    .map((a) => `${toKoreanPlanet(a.planet1)} ${toKoreanAspect(a.aspect)} ${toKoreanPlanet(a.planet2)}`)
    .join(', ') || '없음';

  // 섹션별 전담 렌즈 + 금지 (한 줄 압축)
  const LENSES = `인생변곡점: 토성·천왕성 → "언제 삶이 통째로 뒤집히나?" / 금지: 직업세부·금전수치·연애
10년흐름: 목성 12년 사이클 → "10년 단위 에너지 색깔?" / 금지: 특정연도·월·위기사건
직업재능: 10H·MC·6H → "어떤 환경에서 빛나나?" / 금지: 시기·연도·연애·금전
조심할시기: 12H·토성스퀘어 → "에너지 낮아지는 반복 패턴?" / 금지: 기회·상승기·칭찬
금전흐름: 2H·8H·목성 → "돈 쌓이고 새는 패턴?" / 금지: 연애·직업역량·건강
연애흐름: 5H·7H·금성 → "어떤 사람과 어디서 막히나?" / 금지: 금전·직업·건강
월별예측: 트랜짓만 → "2026년 달별 분위기?" / 금지: 차트 재해석·앞 섹션 반복`;

  const system = `당신은 출생 차트로 인생 전체를 분석하는 인생 데이터 분석가입니다.
친한 언니처럼 솔직하고 다정하게, 핵심 먼저 → 근거 순으로 써주세요.

■ 핵심 규칙
1. 7개 섹션은 서로 다른 렌즈다. 한 섹션에서 쓴 내용은 다른 섹션에서 절대 반복하지 않는다.
2. 각 섹션은 아래 지정된 렌즈와 금지 영역을 엄수한다.
3. 한자·영어 단어 사용 금지. 자연스러운 한국어만.
4. 출력에 "10H", "6H", "2H", "MC", "ASC" 같은 차트 기호 사용 금지. 독자가 점성술을 모른다고 가정하고 써라.
5. "괜찮아요" "자신을 믿고" "천천히 가도" 같은 빈말 금지.
6. 나이·연도·월 등 구체적 시기 반드시 포함.
7. advice는 생활에서 바로 쓸 수 있는 것(색·음식·시간대·습관).
8. JSON만 반환. 앞뒤 설명 없음.
9. 본문 작성 전, 내부적으로 7섹션 핵심이 서로 겹치지 않는지 확인 후 작성.

■ 섹션별 렌즈
${LENSES}

■ 출력 형식
{"인생변곡점":{"title":"내 인생의 큰 파도","keyword":"키워드2~3개","content":"5문장 이상","advice":"한 문장"},"10년흐름":{"title":"나의 10년 인생 지도","keyword":"키워드2~3개","content":"5문장 이상","advice":"한 문장"},"직업재능":{"title":"내가 빛나는 자리","keyword":"키워드2~3개","content":"5문장 이상","advice":"한 문장"},"조심할시기":{"title":"마음 일기예보","keyword":"키워드2~3개","content":"5문장 이상","advice":"한 문장"},"금전흐름":{"title":"차곡차곡 재물운","keyword":"키워드2~3개","content":"5문장 이상. 2025~2030 연도별 포함","advice":"한 문장"},"연애흐름":{"title":"사랑이 머무는 계절","keyword":"키워드2~3개","content":"5문장 이상. 2025~2030 연도별 포함","advice":"한 문장"},"월별예측":{"title":"2026년 가이드","keyword":"키워드2~3개","content":"상반기·하반기 흐름 + 좋은 달 2개·조심할 달 2개. 6문장 이상","advice":"한 문장"}}`;

  const user = `${displayName}의 인생 분석 리포트를 JSON으로 작성해주세요.

태양: ${pos('Sun')} / 달: ${pos('Moon')} / 수성: ${pos('Mercury')}
금성: ${pos('Venus')} / 화성: ${pos('Mars')} / 목성: ${pos('Jupiter')}
토성: ${pos('Saturn')} / 천왕성: ${pos('Uranus')} / 해왕성: ${pos('Neptune')}
상승궁: ${asc ? `${toKoreanSign(asc.sign)} ${formatDegree(asc.degree)}` : '미상'} / 중천: ${mc ? `${toKoreanSign(mc.sign)} ${formatDegree(mc.degree)}` : '미상'}

하우스: 2H(${house(2)}) 5H(${house(5)}) 6H(${house(6)}) 7H(${house(7)}) 8H(${house(8)}) 10H(${house(10)}) 12H(${house(12)})
각도: ${topAspects}
트랜짓(${transits.date}): 도움(${harmonyStr}) / 긴장(${tensionStr})

호칭: ${displayName} / 한자·영어 금지 / 각 섹션 전담 렌즈 엄수`;

  return { system, user };
}

const REQUIRED_SECTIONS = ['인생변곡점', '10년흐름', '직업재능', '조심할시기', '금전흐름', '연애흐름', '월별예측'];
const BANNED_PATTERNS = [/괜찮아요/, /천천히\s*가도/, /자신을\s*믿고/, /따뜻한\s*사랑을\s*받을/, /자격이\s*충분/];

function splitSentences(text) {
  return String(text || '').split(/(?<=[.!?다요])\s+/).map((s) => s.trim()).filter(Boolean);
}

function findOverlappingPhrases(a, b) {
  const W = 8;
  const found = [];
  for (let i = 0; i <= a.length - W; i++) {
    const chunk = a.slice(i, i + W);
    if (/^[은는이가을를에의도만으로와과]/.test(chunk)) continue;
    if (b.includes(chunk)) found.push(chunk);
  }
  return found;
}

function validateFortuneResponse(payload) {
  const issues = [];
  if (!payload || typeof payload !== 'object') return { ok: false, issues: ['JSON 구조 없음'] };

  const contents = {};
  for (const key of REQUIRED_SECTIONS) {
    const s = payload[key];
    if (!s || typeof s !== 'object') { issues.push(`${key} 섹션 없음`); continue; }
    const content = String(s.content || '').trim();
    if (!String(s.title || '').trim()) issues.push(`${key} 제목 없음`);
    if (content.length < 120) issues.push(`${key} 내용 너무 짧음`);
    if (splitSentences(content).length < 4) issues.push(`${key} 문장 수 부족`);
    if (BANNED_PATTERNS.some((p) => p.test(content))) issues.push(`${key} 빈말 표현 있음`);
    if (!/(나이|년|월|시기|대|살)/.test(content)) issues.push(`${key} 구체적 시기 없음`);
    contents[key] = content;
  }

  const keys = Object.keys(contents);
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      if (findOverlappingPhrases(contents[keys[i]], contents[keys[j]]).length >= 3) {
        issues.push(`[중복] ${keys[i]} ↔ ${keys[j]} 내용 겹침`);
      }
    }
  }

  return { ok: issues.length === 0, issues };
}

module.exports = { buildFortunePrompts, validateFortuneResponse };
