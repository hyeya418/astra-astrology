'use strict';

const {
  buildKoreanOnlyRules,
  formatNameWithSuffix,
  toKoreanAspect,
  toKoreanPlanet,
  toKoreanSign,
} = require('./utils');

function buildDailyPrompts(chart, transits, name) {
  const displayName = formatNameWithSuffix(name);

  const sun = chart.planets.find((p) => p.name === 'Sun');
  const moon = chart.planets.find((p) => p.name === 'Moon');
  const venus = chart.planets.find((p) => p.name === 'Venus');
  const mars = chart.planets.find((p) => p.name === 'Mars');

  const aspectText = (t) =>
    `${toKoreanPlanet(t.transitPlanet)} ${toKoreanAspect(t.aspect)} ${toKoreanPlanet(t.natalPlanet)}`;

  const harmony = transits.transits
    .filter((t) => t.energy === 'harmony').slice(0, 5)
    .map(aspectText).join(' / ') || '없음';

  const tension = transits.transits
    .filter((t) => t.energy === 'tension').slice(0, 5)
    .map(aspectText).join(' / ') || '없음';

  const koreanOnlyRules = buildKoreanOnlyRules(displayName);

  const system = `당신은 오늘 하루의 에너지를 친근하게 알려주는 일일 운세 분석가입니다.
오늘의 행성 트랜짓 데이터를 이 사람의 나탈 차트와 비교해서 오늘 하루를 짧고 구체적으로 알려주세요.

■ 규칙
${koreanOnlyRules.map((r, i) => `${i + 1}. ${r}`).join('\n')}
${koreanOnlyRules.length + 1}. 각 섹션은 2~3문장으로 짧고 핵심만. 길게 쓰지 마라.
${koreanOnlyRules.length + 2}. "~할 수 있습니다" "~일 수 있어요" 금지. 단정적으로 써라.
${koreanOnlyRules.length + 3}. 오늘 날짜의 트랜짓 데이터만 보고 써라. 인생 전체 흐름 언급 금지.
${koreanOnlyRules.length + 4}. 말투는 친한 언니처럼 가볍고 솔직하게. 이모지 1~2개씩 자연스럽게 써도 좋다.
${koreanOnlyRules.length + 5}. JSON만 반환. 앞뒤 설명 없음.

■ 출력 형식
{
  "에너지": {
    "icon": "⚡",
    "title": "오늘의 에너지",
    "content": "오늘 전반적인 에너지와 분위기 2~3문장"
  },
  "집중": {
    "icon": "🎯",
    "title": "오늘 집중할 것",
    "content": "오늘 잘 풀리는 영역과 활용법 2~3문장"
  },
  "조심": {
    "icon": "⚠️",
    "title": "오늘 조심할 것",
    "content": "오늘 주의할 점과 이유 2~3문장"
  },
  "한줄요약": "오늘을 한 문장으로 + 어울리는 이모지"
}`;

  const user = `오늘(${transits.date}) ${displayName}의 하루 운세를 알려주세요.

나탈 차트 핵심:
- 태양: ${sun ? `${toKoreanSign(sun.sign)} ${sun.house}하우스` : '미상'}
- 달: ${moon ? `${toKoreanSign(moon.sign)} ${moon.house}하우스` : '미상'}
- 금성: ${venus ? `${toKoreanSign(venus.sign)} ${venus.house}하우스` : '미상'}
- 화성: ${mars ? `${toKoreanSign(mars.sign)} ${mars.house}하우스` : '미상'}

오늘 트랜짓:
- 도움: ${harmony}
- 긴장: ${tension}

${displayName}에게 직접 말하듯이, 오늘 하루 어떤 에너지인지 짧고 구체적으로 알려주세요.
한자·영어 단어 금지. 행성 이름은 한국어로(태양·달·수성·금성·화성·목성·토성·천왕성·해왕성·명왕성).`;

  return { system, user };
}

function validateDailyResponse(payload) {
  const issues = [];
  if (!payload || typeof payload !== 'object') return { ok: false, issues: ['JSON 구조 없음'] };

  for (const key of ['에너지', '집중', '조심']) {
    const s = payload[key];
    if (!s?.content || String(s.content).trim().length < 20) {
      issues.push(`${key} 섹션이 비어 있거나 너무 짧습니다.`);
    }
  }
  if (!payload['한줄요약'] || String(payload['한줄요약']).trim().length < 5) {
    issues.push('한줄요약이 없습니다.');
  }

  return { ok: issues.length === 0, issues };
}

module.exports = { buildDailyPrompts, validateDailyResponse };
