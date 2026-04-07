'use strict';

/**
 * Build a single prompt that returns all 7 fortune sections at once.
 * 총운 / 금전운 / 직업운 / 연애결혼운 / 건강운 / 인간관계가족운 / 대운
 */
function buildFortunePrompts(chart, transits) {
  const sun = chart.planets.find(p => p.name === 'Sun');
  const moon = chart.planets.find(p => p.name === 'Moon');
  const mercury = chart.planets.find(p => p.name === 'Mercury');
  const venus = chart.planets.find(p => p.name === 'Venus');
  const mars = chart.planets.find(p => p.name === 'Mars');
  const jupiter = chart.planets.find(p => p.name === 'Jupiter');
  const saturn = chart.planets.find(p => p.name === 'Saturn');
  const asc = chart.angles.ascendant;
  const mc = chart.angles.midheaven;

  // Key houses
  const house2 = chart.planets.filter(p => p.house === 2).map(p => `${p.name}(${p.sign})`).join(', ') || '없음';
  const house5 = chart.planets.filter(p => p.house === 5).map(p => `${p.name}(${p.sign})`).join(', ') || '없음';
  const house6 = chart.planets.filter(p => p.house === 6).map(p => `${p.name}(${p.sign})`).join(', ') || '없음';
  const house7 = chart.planets.filter(p => p.house === 7).map(p => `${p.name}(${p.sign})`).join(', ') || '없음';
  const house8 = chart.planets.filter(p => p.house === 8).map(p => `${p.name}(${p.sign})`).join(', ') || '없음';
  const house10 = chart.planets.filter(p => p.house === 10).map(p => `${p.name}(${p.sign})`).join(', ') || '없음';

  // Top transits by energy
  const harmonyTransits = transits.transits
    .filter(t => t.energy === 'harmony')
    .slice(0, 5)
    .map(t => `${t.transitPlanet} ${t.aspect} 출생${t.natalPlanet}`)
    .join(', ');

  const tensionTransits = transits.transits
    .filter(t => t.energy === 'tension')
    .slice(0, 5)
    .map(t => `${t.transitPlanet} ${t.aspect} 출생${t.natalPlanet}`)
    .join(', ');

  const system = `당신은 서양 점성술을 기반으로 한국식 운세 리포트를 작성하는 전문가입니다.
나탈 차트와 현재 트랜싯을 종합하여 7가지 운세 섹션을 분석합니다.
각 섹션은 서로 연결된 하나의 통합 리포트처럼 일관된 흐름으로 작성하세요.
반드시 순수한 JSON만 반환하세요. 마크다운, 코드블록, 설명 없이 JSON만 출력하세요.

출력 형식:
{
  "총운": {
    "keyword": "핵심 키워드 2-3단어",
    "content": "전반적인 운세 흐름 분석 (3-4문장, 다른 섹션과 연결되는 큰 그림)",
    "advice": "한 줄 핵심 조언"
  },
  "금전운": {
    "keyword": "핵심 키워드 2-3단어",
    "content": "금전, 재물, 투자 관련 분석 (2-3문장)",
    "advice": "한 줄 재물 조언"
  },
  "직업운": {
    "keyword": "핵심 키워드 2-3단어",
    "content": "직업, 커리어, 명예 관련 분석 (2-3문장)",
    "advice": "한 줄 커리어 조언"
  },
  "연애결혼운": {
    "keyword": "핵심 키워드 2-3단어",
    "content": "연애, 결혼, 파트너십 관련 분석 (2-3문장)",
    "advice": "한 줄 연애 조언"
  },
  "건강운": {
    "keyword": "핵심 키워드 2-3단어",
    "content": "건강, 체력, 주의할 부분 분석 (2-3문장)",
    "advice": "한 줄 건강 조언"
  },
  "인간관계가족운": {
    "keyword": "핵심 키워드 2-3단어",
    "content": "인간관계, 가족, 친구, 협력 관련 분석 (2-3문장)",
    "advice": "한 줄 관계 조언"
  },
  "대운": {
    "keyword": "핵심 키워드 2-3단어",
    "content": "Saturn 사이클과 목성 주기를 바탕으로 한 중장기 인생 흐름 (3-4문장, 현재 어떤 인생 사이클에 있는지)",
    "advice": "한 줄 인생 방향 조언"
  }
}`;

  const user = `다음 나탈 차트와 현재 트랜싯으로 7가지 운세를 분석해주세요.

【나탈 차트】
- 태양(Sun): ${sun ? `${sun.sign} ${sun.degree.toFixed(1)}° / ${sun.house}하우스` : '미상'}
- 달(Moon): ${moon ? `${moon.sign} ${moon.degree.toFixed(1)}° / ${moon.house}하우스` : '미상'}
- 수성(Mercury): ${mercury ? `${mercury.sign} / ${mercury.house}하우스` : '미상'}
- 금성(Venus): ${venus ? `${venus.sign} / ${venus.house}하우스` : '미상'}
- 화성(Mars): ${mars ? `${mars.sign} / ${mars.house}하우스` : '미상'}
- 목성(Jupiter): ${jupiter ? `${jupiter.sign} / ${jupiter.house}하우스` : '미상'}
- 토성(Saturn): ${saturn ? `${saturn.sign} / ${saturn.house}하우스` : '미상'}
- 상승궁(ASC): ${asc ? `${asc.sign} ${asc.degree.toFixed(1)}°` : '미상'}
- 중천(MC): ${mc ? `${mc.sign} ${mc.degree.toFixed(1)}°` : '미상'}
- 2하우스 행성: ${house2}
- 5하우스 행성: ${house5}
- 6하우스 행성: ${house6}
- 7하우스 행성: ${house7}
- 8하우스 행성: ${house8}
- 10하우스 행성: ${house10}

【현재 트랜싯 (${transits.date})】
- 상승 에너지: ${harmonyTransits || '없음'}
- 긴장 에너지: ${tensionTransits || '없음'}

각 섹션이 독립적이지 않고 하나의 일관된 스토리로 읽히도록 작성해주세요.
따뜻하고 공감적이되, 구체적이고 날카롭게 분석해주세요.`;

  return { system, user };
}

module.exports = { buildFortunePrompts };
