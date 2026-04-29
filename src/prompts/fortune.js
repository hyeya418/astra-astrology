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
직업재능: 10하우스·중천·6하우스 → "어떤 환경에서 빛나나?" / 금지: 시기·연도·연애·금전
조심할시기: 12하우스·토성스퀘어 → "에너지 낮아지는 반복 패턴?" / 금지: 기회·상승기·칭찬
금전흐름: 2하우스·8하우스·목성 → "돈 쌓이고 새는 패턴?" / 금지: 연애·직업역량·건강
연애흐름: 5하우스·7하우스·금성 → "어떤 사람과 어디서 막히나?" / 금지: 금전·직업·건강
월별예측: 트랜짓만 → "2026년 달별 분위기?" / 금지: 차트 재해석·앞 섹션 반복`;

  const system = `당신은 출생 차트로 인생 전체를 분석하는 인생 데이터 분석가입니다.
친한 언니처럼 솔직하고 다정하게, 핵심 먼저 → 근거 순으로 써주세요.

■ 핵심 규칙
1. 7개 섹션은 서로 다른 렌즈다. 한 섹션에서 쓴 내용은 다른 섹션에서 절대 반복하지 않는다.
2. 각 섹션은 아래 지정된 렌즈와 금지 영역을 엄수한다.
3. 한자·영어 단어 사용 금지. 자연스러운 한국어만. 행성 이름도 반드시 한국어로: 태양·달·수성·금성·화성·목성·토성·천왕성·해왕성·명왕성.
4. 출력에 "10H", "6H", "2H" 같은 약어 금지. "10하우스", "6하우스"처럼 풀어서 써라.
5. "괜찮아요" "자신을 믿고" "천천히 가도" 같은 빈말 금지.
6. "~할 수 있습니다" "~일 수 있어요" "~가능성이 있어요" 금지. 단정적으로 써라. 나쁜 예: "관계가 안정적일 수 있습니다." 좋은 예: "이 시기 관계는 빠르게 깊어집니다."
7. 연도는 반드시 1~2년 단위로 구체적으로 써라. "2025~2030년 에너지가 강해진다" 같은 5년 뭉뚱그리기 금지. 나쁜 예: "2025년부터 2030년까지 재물운이 좋습니다." 좋은 예: "2026년은 수입이 늘고, 2027년은 지출이 커지는 해입니다."
8. advice는 반드시 이 사람의 차트에서 나온 구체적인 행동으로 써라. "토요일에 시간을 내세요", "매달 10% 저축하세요" 같은 누구에게나 해당하는 말 금지. 이 사람의 행성 배치와 연결된 조언이어야 한다.
9. 말투는 오래 알고 지낸 친구가 솔직하게 말해주는 톤. "지혜님은 ~합니다" 보다 "지혜님 이거 진짜 특이한데," "솔직히 말하면," "이 부분이 핵심인데" 같은 구어체로.
10. JSON만 반환. 앞뒤 설명 없음.
11. 본문 작성 전, 내부적으로 7섹션 핵심이 서로 겹치지 않는지 확인 후 작성.
12. 결론만 던지지 말고 반드시 차트 근거로 이유를 설명하라. 나쁜 예: "2025년에 사랑이 안정적입니다." 좋은 예: "7하우스에 금성과 토성이 함께 있어요. 금성은 끌림, 토성은 책임감인데 이 둘이 같은 자리에 있다는 건 지혜님이 가볍게 만나는 걸 못 하는 사람이라는 뜻이에요. 2026년에 목성이 이 하우스를 통과하면서 진지한 관계가 구체화될 가능성이 높아집니다."

■ 섹션별 렌즈
${LENSES}

■ 출력 형식
{"인생변곡점":{"title":"내 인생의 큰 파도","keyword":"키워드2~3개","content":"5문장 이상","advice":"한 문장"},"10년흐름":{"title":"나의 10년 인생 지도","keyword":"키워드2~3개","content":"5문장 이상","advice":"한 문장"},"직업재능":{"title":"내가 빛나는 자리","keyword":"키워드2~3개","content":"5문장 이상","advice":"한 문장"},"조심할시기":{"title":"마음 일기예보","keyword":"키워드2~3개","content":"5문장 이상","advice":"한 문장"},"금전흐름":{"title":"차곡차곡 재물운","keyword":"키워드2~3개","content":"5문장 이상. 2025~2030 연도별 포함","advice":"한 문장"},"연애흐름":{"title":"사랑이 머무는 계절","keyword":"키워드2~3개","content":"5문장 이상. 2025~2030 연도별 포함","advice":"한 문장"},"월별예측":{"title":"2026년 가이드","keyword":"키워드2~3개","content":"상반기·하반기 흐름 + 좋은 달 2개·조심할 달 2개. 6문장 이상","advice":"한 문장"}}`;

  const user = `${displayName}의 인생 분석 리포트를 JSON으로 작성해주세요.

태양: ${pos('Sun')} / 달: ${pos('Moon')} / 수성: ${pos('Mercury')}
금성: ${pos('Venus')} / 화성: ${pos('Mars')} / 목성: ${pos('Jupiter')}
토성: ${pos('Saturn')} / 천왕성: ${pos('Uranus')} / 해왕성: ${pos('Neptune')}
상승궁: ${asc ? `${toKoreanSign(asc.sign)} ${formatDegree(asc.degree)}` : '미상'} / 중천: ${mc ? `${toKoreanSign(mc.sign)} ${formatDegree(mc.degree)}` : '미상'}

하우스: 2하우스(${house(2)}) 5하우스(${house(5)}) 6하우스(${house(6)}) 7하우스(${house(7)}) 8하우스(${house(8)}) 10하우스(${house(10)}) 12하우스(${house(12)})
각도: ${topAspects}
트랜짓(${transits.date}): 도움(${harmonyStr}) / 긴장(${tensionStr})

호칭: ${displayName} / 한자·영어 금지 / 각 섹션 전담 렌즈 엄수`;

  return { system, user };
}

const REQUIRED_SECTIONS = ['인생변곡점', '10년흐름', '직업재능', '조심할시기', '금전흐름', '연애흐름', '월별예측'];
const BANNED_PATTERNS = [
  /괜찮아요/,
  /천천히\s*가도/,
  /자신을\s*믿고/,
  /따뜻한\s*사랑을\s*받을/,
  /자격이\s*충분/,
  /[이가]\s*강해질\s*수\s*있습니다/,
  /[이가]\s*안정적일\s*수\s*있습니다/,
  /2025년부터\s*2030년/,
  /[요일]에\s*시간을\s*내서/,
  /매달\s*\d+%/,
];

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
