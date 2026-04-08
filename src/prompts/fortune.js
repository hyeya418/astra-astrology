'use strict';

function buildFortunePrompts(chart, transits) {
  const sun    = chart.planets.find(p => p.name === 'Sun');
  const moon   = chart.planets.find(p => p.name === 'Moon');
  const mercury= chart.planets.find(p => p.name === 'Mercury');
  const venus  = chart.planets.find(p => p.name === 'Venus');
  const mars   = chart.planets.find(p => p.name === 'Mars');
  const jupiter= chart.planets.find(p => p.name === 'Jupiter');
  const saturn = chart.planets.find(p => p.name === 'Saturn');
  const uranus = chart.planets.find(p => p.name === 'Uranus');
  const neptune= chart.planets.find(p => p.name === 'Neptune');
  const asc    = chart.angles.ascendant;
  const mc     = chart.angles.midheaven;

  const signKo = {
    Aries:'양자리', Taurus:'황소자리', Gemini:'쌍둥이자리', Cancer:'게자리',
    Leo:'사자자리', Virgo:'처녀자리', Libra:'천칭자리', Scorpio:'전갈자리',
    Sagittarius:'사수자리', Capricorn:'염소자리', Aquarius:'물병자리', Pisces:'물고기자리',
  };
  const ko = (p) => p ? `${signKo[p.sign] ?? p.sign} ${p.house}하우스${p.retrograde ? ' (역행)' : ''}` : '미상';

  const house = (n) => chart.planets.filter(p => p.house === n).map(p => {
    const nameKo = { Sun:'태양', Moon:'달', Mercury:'수성', Venus:'금성', Mars:'화성',
      Jupiter:'목성', Saturn:'토성', Uranus:'천왕성', Neptune:'해왕성', Pluto:'명왕성' };
    return `${nameKo[p.name] ?? p.name}(${signKo[p.sign] ?? p.sign})`;
  }).join(', ') || '없음';

  const harmonyStr = transits.transits.filter(t => t.energy === 'harmony').slice(0, 5)
    .map(t => {
      const nKo = { Sun:'태양', Moon:'달', Mercury:'수성', Venus:'금성', Mars:'화성',
        Jupiter:'목성', Saturn:'토성', Uranus:'천왕성', Neptune:'해왕성', Pluto:'명왕성' };
      const aspKo = { Trine:'삼각', Sextile:'육각', Conjunction:'합', Opposition:'대립', Square:'사각' };
      return `${nKo[t.transitPlanet]??t.transitPlanet} ${aspKo[t.aspect]??t.aspect} 출생 ${nKo[t.natalPlanet]??t.natalPlanet}`;
    }).join(' / ') || '없음';

  const tensionStr = transits.transits.filter(t => t.energy === 'tension').slice(0, 5)
    .map(t => {
      const nKo = { Sun:'태양', Moon:'달', Mercury:'수성', Venus:'금성', Mars:'화성',
        Jupiter:'목성', Saturn:'토성', Uranus:'천왕성', Neptune:'해왕성', Pluto:'명왕성' };
      const aspKo = { Trine:'삼각', Sextile:'육각', Conjunction:'합', Opposition:'대립', Square:'사각' };
      return `${nKo[t.transitPlanet]??t.transitPlanet} ${aspKo[t.aspect]??t.aspect} 출생 ${nKo[t.natalPlanet]??t.natalPlanet}`;
    }).join(' / ') || '없음';

  const topAspects = chart.aspects.slice(0, 10).map(a => {
    const nKo = { Sun:'태양', Moon:'달', Mercury:'수성', Venus:'금성', Mars:'화성',
      Jupiter:'목성', Saturn:'토성', Uranus:'천왕성', Neptune:'해왕성', Pluto:'명왕성' };
    const aspKo = { Trine:'삼각', Sextile:'육각', Conjunction:'합', Opposition:'대립', Square:'사각' };
    return `${nKo[a.planet1]??a.planet1} ${aspKo[a.aspect]??a.aspect} ${nKo[a.planet2]??a.planet2}`;
  }).join(', ');

  const system = `당신은 서양 점성술을 기반으로 따뜻하고 친근한 한국어로 운세를 풀어주는 전문가예요.
마치 오랜 친구처럼 편안하게 이야기해주되, 인생을 깊이 이해하는 지혜로운 사람처럼 진심 어린 조언을 건네주세요.

반드시 지킬 규칙:
1. 영어 단어를 절대 쓰지 마세요. 행성 이름, 별자리 이름, 어스펙트 이름 모두 한국어로만 써주세요.
2. "~입니다/~합니다" 딱딱한 말투 대신 "~이에요/~해요/~거든요/~랍니다" 친근한 말투로 써주세요.
3. 각 섹션 내용은 충분히 길고 풍부하게 써주세요. content는 최소 5~6문장 이상이어야 해요.
4. 비유와 은유를 풍부하게 사용해서 읽는 재미가 있게 해주세요.
5. 분석 이유를 쉬운 말로 설명해주고, 왜 그런 성향이 나오는지 점성술적 근거를 녹여주세요.
6. advice는 막연한 말이 아니라 실생활에서 바로 실천할 수 있는 구체적인 행동을 제안해주세요.
7. 7개 섹션이 하나의 일관된 이야기처럼 연결되게 써주세요. 총운에서 언급한 큰 흐름이 각 섹션에 녹아들어야 해요.
8. 반드시 순수한 JSON만 반환하세요. 마크다운이나 설명 텍스트 없이 JSON만 출력하세요.

출력 형식:
{
  "총운": {
    "title": "이 사람의 전체 운세를 상징하는 시적이고 독창적인 제목 (20자 이내)",
    "keyword": "핵심 키워드 2~3단어",
    "content": "전체 운세의 큰 그림. 이 사람의 에너지가 올해 어떤 방향으로 흐르는지, 어떤 기회와 과제가 있는지, 인생의 어떤 사이클에 있는지 풍부하게 설명해주세요. 비유를 들어 생생하게, 최소 5~6문장.",
    "advice": "지금 당장 실천할 수 있는 구체적인 조언 1~2가지"
  },
  "금전운": {
    "title": "금전운을 상징하는 시적인 제목",
    "keyword": "핵심 키워드 2~3단어",
    "content": "재물 흐름, 돈을 버는 방식, 투자 성향, 주의할 점을 구체적으로 풀어주세요. 2하우스와 8하우스 행성, 목성과 금성의 영향을 녹여서 설명해주세요. 최소 5~6문장.",
    "advice": "재물 관련 구체적인 실천 조언"
  },
  "직업운": {
    "title": "직업운을 상징하는 시적인 제목",
    "keyword": "핵심 키워드 2~3단어",
    "content": "타고난 직업적 재능, 일하는 방식, 커리어 방향, 지금 시기에 집중해야 할 것을 풀어주세요. 10하우스와 중천, 토성과 화성의 영향을 녹여서 설명해주세요. 최소 5~6문장.",
    "advice": "커리어 관련 구체적인 실천 조언"
  },
  "연애결혼운": {
    "title": "연애운을 상징하는 시적인 제목",
    "keyword": "핵심 키워드 2~3단어",
    "content": "사랑하는 방식, 이상형, 관계에서의 패턴, 현재 연애/결혼 흐름을 따뜻하게 풀어주세요. 7하우스와 5하우스 행성, 금성의 영향을 녹여서 설명해주세요. 최소 5~6문장.",
    "advice": "연애 관련 구체적인 실천 조언"
  },
  "건강운": {
    "title": "건강운을 상징하는 시적인 제목",
    "keyword": "핵심 키워드 2~3단어",
    "content": "몸과 마음의 건강 패턴, 주의해야 할 부분, 에너지를 보충하는 방법을 구체적으로 알려주세요. 6하우스 행성과 상승궁, 현재 트랜싯 흐름을 녹여서 설명해주세요. 최소 5~6문장.",
    "advice": "건강 관련 구체적인 실천 조언"
  },
  "인간관계가족운": {
    "title": "인간관계를 상징하는 시적인 제목",
    "keyword": "핵심 키워드 2~3단어",
    "content": "사람들과 어울리는 방식, 가족과의 관계, 친구와 동료 관계, 지금 주의해야 할 인간관계 패턴을 따뜻하게 풀어주세요. 달과 4하우스, 3하우스의 영향을 녹여서 설명해주세요. 최소 5~6문장.",
    "advice": "인간관계 관련 구체적인 실천 조언"
  },
  "대운": {
    "title": "지금 인생의 큰 흐름을 상징하는 시적인 제목",
    "keyword": "핵심 키워드 2~3단어",
    "content": "지금 어떤 인생의 계절을 보내고 있는지, 토성과 목성의 큰 주기 안에서 어떤 위치에 있는지, 앞으로 3~5년 안에 어떤 변화가 기다리고 있는지 깊이 있게 풀어주세요. 지금 이 시기가 인생에서 어떤 의미를 가지는지도 써주세요. 최소 6~7문장.",
    "advice": "지금 이 시기를 잘 보내기 위한 가장 중요한 조언"
  }
}`;

  const user = `다음 나탈 차트 정보로 7가지 운세 리포트를 써주세요.
모든 내용은 한국어로만 작성하고, 영어 단어는 절대 쓰지 마세요.
친한 친구에게 말하듯 따뜻하고 친근하게, 그리고 충분히 길고 풍부하게 써주세요.

【나탈 차트】
- 태양: ${ko(sun)}
- 달: ${ko(moon)}
- 수성: ${ko(mercury)}
- 금성: ${ko(venus)}
- 화성: ${ko(mars)}
- 목성: ${ko(jupiter)}
- 토성: ${ko(saturn)}
- 천왕성: ${ko(uranus)}
- 해왕성: ${ko(neptune)}
- 상승궁: ${asc ? `${signKo[asc.sign] ?? asc.sign} ${asc.degree.toFixed(1)}도` : '미상'}
- 중천: ${mc ? `${signKo[mc.sign] ?? mc.sign} ${mc.degree.toFixed(1)}도` : '미상'}

【하우스별 행성】
- 2하우스(재물): ${house(2)}
- 5하우스(연애/창의): ${house(5)}
- 6하우스(건강/일상): ${house(6)}
- 7하우스(파트너십): ${house(7)}
- 8하우스(변화/공동재산): ${house(8)}
- 10하우스(커리어/명예): ${house(10)}
- 12하우스(잠재의식): ${house(12)}

【주요 어스펙트 (행성 간 각도)】
${topAspects || '없음'}

【오늘(${transits.date}) 하늘의 흐름】
- 힘을 주는 흐름: ${harmonyStr}
- 긴장을 주는 흐름: ${tensionStr}

이 모든 정보를 바탕으로 7개 섹션을 하나의 이야기처럼 자연스럽게 연결해서 써주세요.
각 title은 이 사람만을 위한 독창적인 비유여야 해요.
영어 단어 하나도 쓰지 말고, 친근하고 따뜻하게, 충분히 길고 풍부하게 부탁드려요!`;

  return { system, user };
}

module.exports = { buildFortunePrompts };
