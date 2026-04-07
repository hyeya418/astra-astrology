'use strict';

/**
 * Build a single prompt that returns all 7 fortune sections in a vivid,
 * metaphor-rich Korean fortune-telling style.
 */
function buildFortunePrompts(chart, transits) {
  const sun = chart.planets.find(p => p.name === 'Sun');
  const moon = chart.planets.find(p => p.name === 'Moon');
  const mercury = chart.planets.find(p => p.name === 'Mercury');
  const venus = chart.planets.find(p => p.name === 'Venus');
  const mars = chart.planets.find(p => p.name === 'Mars');
  const jupiter = chart.planets.find(p => p.name === 'Jupiter');
  const saturn = chart.planets.find(p => p.name === 'Saturn');
  const uranus = chart.planets.find(p => p.name === 'Uranus');
  const neptune = chart.planets.find(p => p.name === 'Neptune');
  const asc = chart.angles.ascendant;
  const mc = chart.angles.midheaven;

  const house2planets = chart.planets.filter(p => p.house === 2).map(p => `${p.name}(${p.sign})`).join(', ') || '없음';
  const house5planets = chart.planets.filter(p => p.house === 5).map(p => `${p.name}(${p.sign})`).join(', ') || '없음';
  const house6planets = chart.planets.filter(p => p.house === 6).map(p => `${p.name}(${p.sign})`).join(', ') || '없음';
  const house7planets = chart.planets.filter(p => p.house === 7).map(p => `${p.name}(${p.sign})`).join(', ') || '없음';
  const house8planets = chart.planets.find(p => p.house === 8) ? chart.planets.filter(p => p.house === 8).map(p => `${p.name}(${p.sign})`).join(', ') : '없음';
  const house10planets = chart.planets.filter(p => p.house === 10).map(p => `${p.name}(${p.sign})`).join(', ') || '없음';
  const house12planets = chart.planets.filter(p => p.house === 12).map(p => `${p.name}(${p.sign})`).join(', ') || '없음';

  const harmonyTransits = transits.transits
    .filter(t => t.energy === 'harmony').slice(0, 5)
    .map(t => `${t.transitPlanet} ${t.aspect} 출생${t.natalPlanet}`).join(', ') || '없음';

  const tensionTransits = transits.transits
    .filter(t => t.energy === 'tension').slice(0, 5)
    .map(t => `${t.transitPlanet} ${t.aspect} 출생${t.natalPlanet}`).join(', ') || '없음';

  const topAspects = chart.aspects.slice(0, 8)
    .map(a => `${a.planet1} ${a.aspect} ${a.planet2} (${a.orb.toFixed(1)}°)`).join(', ');

  const system = `당신은 서양 점성술을 기반으로 한국식 운세 리포트를 작성하는 전문가입니다.
딱딱한 점성술 용어보다는 **생생한 비유와 은유, 이야기체**로 운세를 풀어냅니다.

다음 규칙을 반드시 지키세요:

1. 각 섹션은 **시적이고 감각적인 제목**으로 시작합니다 (예: "안개 낀 숲속의 비밀 정원", "파도 위의 서퍼")
2. **비유와 은유**를 풍부하게 사용하세요 (자연, 계절, 음식, 공간, 물건 등)
3. 분석 이유를 **쉬운 말로** 설명하세요 — 행성 이름을 쓸 때는 반드시 한국어 이름도 함께 (금성/Venus, 토성/Saturn 등)
4. 마지막은 **구체적이고 따뜻한 조언**으로 마무리
5. 전체 7개 섹션이 **하나의 일관된 이야기**처럼 연결되어야 합니다
6. 말투는 "~입니다/~합니다" 격식체가 아닌 "~이에요/~해요" 친근한 반말도 OK
7. 반드시 순수한 JSON만 반환하세요. 마크다운 없이 JSON 객체만 출력하세요.

출력 형식:
{
  "총운": {
    "title": "이 사람을 상징하는 시적인 제목 (15자 내외)",
    "keyword": "핵심 키워드 2-3단어",
    "content": "전체 운세의 큰 그림을 비유로 풀어낸 내용 (4-5문장). 왜 이런 분석이 나왔는지 점성술적 이유도 포함.",
    "advice": "가장 중요한 한 줄 조언 (구체적으로)"
  },
  "금전운": {
    "title": "금전운을 상징하는 시적인 제목",
    "keyword": "핵심 키워드 2-3단어",
    "content": "재물과 금전 흐름을 비유로 분석 (3-4문장). 2하우스, 8하우스, 목성/금성 영향 포함.",
    "advice": "재물 관련 구체적인 한 줄 조언"
  },
  "직업운": {
    "title": "직업운을 상징하는 시적인 제목",
    "keyword": "핵심 키워드 2-3단어",
    "content": "커리어와 사회적 역할을 비유로 분석 (3-4문장). 10하우스, MC, 토성/화성 영향 포함.",
    "advice": "커리어 관련 구체적인 한 줄 조언"
  },
  "연애결혼운": {
    "title": "연애운을 상징하는 시적인 제목",
    "keyword": "핵심 키워드 2-3단어",
    "content": "사랑과 관계를 비유로 분석 (3-4문장). 7하우스, 5하우스, 금성/화성 영향 포함.",
    "advice": "연애 관련 구체적인 한 줄 조언"
  },
  "건강운": {
    "title": "건강운을 상징하는 시적인 제목",
    "keyword": "핵심 키워드 2-3단어",
    "content": "몸과 마음의 건강을 비유로 분석 (3-4문장). 6하우스, 상승궁, 현재 트랜싯 영향 포함.",
    "advice": "건강 관련 구체적인 한 줄 조언"
  },
  "인간관계가족운": {
    "title": "인간관계를 상징하는 시적인 제목",
    "keyword": "핵심 키워드 2-3단어",
    "content": "사람들과의 관계를 비유로 분석 (3-4문장). 달/Moon, 4하우스, 3하우스 영향 포함.",
    "advice": "관계 관련 구체적인 한 줄 조언"
  },
  "대운": {
    "title": "인생 큰 흐름을 상징하는 시적인 제목",
    "keyword": "핵심 키워드 2-3단어",
    "content": "현재 인생 사이클을 비유로 분석 (4-5문장). 토성/Saturn 사이클과 목성/Jupiter 주기 기반. 지금 어떤 계절에 있는지.",
    "advice": "인생 방향 관련 구체적인 한 줄 조언"
  }
}`;

  const user = `다음 나탈 차트 데이터로 7가지 운세 리포트를 작성해주세요.

【나탈 차트 핵심 정보】
- 태양(Sun): ${sun ? `${sun.sign} ${sun.degree.toFixed(1)}° / ${sun.house}하우스` : '미상'}
- 달(Moon): ${moon ? `${moon.sign} ${moon.degree.toFixed(1)}° / ${moon.house}하우스` : '미상'}
- 수성(Mercury): ${mercury ? `${mercury.sign} / ${mercury.house}하우스` : '미상'}
- 금성(Venus): ${venus ? `${venus.sign} / ${venus.house}하우스${venus.retrograde ? ' 역행' : ''}` : '미상'}
- 화성(Mars): ${mars ? `${mars.sign} / ${mars.house}하우스${mars.retrograde ? ' 역행' : ''}` : '미상'}
- 목성(Jupiter): ${jupiter ? `${jupiter.sign} / ${jupiter.house}하우스` : '미상'}
- 토성(Saturn): ${saturn ? `${saturn.sign} / ${saturn.house}하우스${saturn.retrograde ? ' 역행' : ''}` : '미상'}
- 천왕성(Uranus): ${uranus ? `${uranus.sign} / ${uranus.house}하우스` : '미상'}
- 해왕성(Neptune): ${neptune ? `${neptune.sign} / ${neptune.house}하우스` : '미상'}
- 상승궁(ASC): ${asc ? `${asc.sign} ${asc.degree.toFixed(1)}°` : '미상'}
- 중천(MC): ${mc ? `${mc.sign} ${mc.degree.toFixed(1)}°` : '미상'}

【하우스별 행성】
- 2하우스(재물): ${house2planets}
- 5하우스(연애): ${house5planets}
- 6하우스(건강/일): ${house6planets}
- 7하우스(파트너): ${house7planets}
- 8하우스(변형/공동재산): ${house8planets}
- 10하우스(커리어): ${house10planets}
- 12하우스(숨겨진 영역): ${house12planets}

【주요 어스펙트】
${topAspects || '없음'}

【현재 트랜싯 (${transits.date} 기준)】
- 힘을 주는 흐름: ${harmonyTransits}
- 긴장을 주는 흐름: ${tensionTransits}

위 데이터를 바탕으로 7개 섹션을 하나의 일관된 스토리로 연결해서 작성해주세요.
각 섹션의 title은 이 사람만을 위한 독창적인 비유여야 합니다.
딱딱한 점성술 교과서가 아닌, 친한 언니/오빠가 봐주는 운세처럼 따뜻하고 생생하게!`;

  return { system, user };
}

module.exports = { buildFortunePrompts };
