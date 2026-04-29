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
  const jupiter = chart.planets.find((p) => p.name === 'Jupiter');
  const mercury = chart.planets.find((p) => p.name === 'Mercury');
  const saturn = chart.planets.find((p) => p.name === 'Saturn');

  const aspectText = (t) =>
    `${toKoreanPlanet(t.transitPlanet)} ${toKoreanAspect(t.aspect)} ${toKoreanPlanet(t.natalPlanet)}`;

  const harmony = transits.transits
    .filter((t) => t.energy === 'harmony').slice(0, 6)
    .map(aspectText).join(' / ') || '없음';

  const tension = transits.transits
    .filter((t) => t.energy === 'tension').slice(0, 6)
    .map(aspectText).join(' / ') || '없음';

  const koreanOnlyRules = buildKoreanOnlyRules(displayName);

  const system = `당신은 오늘 하루의 운세를 친근하게 알려주는 일일 운세 분석가입니다.
오늘의 행성 트랜짓 데이터를 이 사람의 나탈 차트와 비교해서 6가지 운세를 짧고 구체적으로 알려주세요.

■ 규칙
${koreanOnlyRules.map((r, i) => `${i + 1}. ${r}`).join('\n')}
${koreanOnlyRules.length + 1}. 각 운세는 2~3문장으로 짧고 핵심만. 길게 쓰지 마라.
${koreanOnlyRules.length + 2}. "~할 수 있습니다" "~일 수 있어요" 금지. 단정적으로 써라.
${koreanOnlyRules.length + 3}. 오늘 트랜짓 데이터를 근거로 써라. 근거 없이 막연하게 쓰지 마라.
${koreanOnlyRules.length + 4}. 각 운세마다 오늘의 점수를 1~5 사이로 매겨라 (1=나쁨, 3=보통, 5=좋음).
${koreanOnlyRules.length + 5}. 말투는 친한 친구처럼 가볍고 솔직하게.
${koreanOnlyRules.length + 6}. 한자·영어 단어 금지. 행성 이름은 한국어로.
${koreanOnlyRules.length + 7}. JSON만 반환. 앞뒤 설명 없음.

■ 출력 형식
{
  "한줄요약": "오늘을 한 문장으로 + 어울리는 이모지",
  "총운": { "score": 1~5, "content": "2~3문장" },
  "재물운": { "score": 1~5, "content": "2~3문장" },
  "연애운": { "score": 1~5, "content": "2~3문장" },
  "사업운": { "score": 1~5, "content": "2~3문장" },
  "건강운": { "score": 1~5, "content": "2~3문장" },
  "학업운": { "score": 1~5, "content": "2~3문장" }
}`;

  const user = `오늘(${transits.date}) ${displayName}의 운세를 알려주세요.

나탈 차트 핵심:
- 태양: ${sun ? `${toKoreanSign(sun.sign)} ${sun.house}하우스` : '미상'}
- 달: ${moon ? `${toKoreanSign(moon.sign)} ${moon.house}하우스` : '미상'}
- 수성: ${mercury ? `${toKoreanSign(mercury.sign)} ${mercury.house}하우스` : '미상'}
- 금성: ${venus ? `${toKoreanSign(venus.sign)} ${venus.house}하우스` : '미상'}
- 화성: ${mars ? `${toKoreanSign(mars.sign)} ${mars.house}하우스` : '미상'}
- 목성: ${jupiter ? `${toKoreanSign(jupiter.sign)} ${jupiter.house}하우스` : '미상'}
- 토성: ${saturn ? `${toKoreanSign(saturn.sign)} ${saturn.house}하우스` : '미상'}

오늘 트랜짓:
- 도움: ${harmony}
- 긴장: ${tension}

${displayName}에게 직접 말하듯이 오늘 6가지 운세를 짧고 솔직하게 알려주세요.`;

  return { system, user };
}

function validateDailyResponse(payload) {
  const issues = [];
  if (!payload || typeof payload !== 'object') return { ok: false, issues: ['JSON 구조 없음'] };

  for (const key of ['총운', '재물운', '연애운', '사업운', '건강운', '학업운']) {
    const s = payload[key];
    if (!s?.content || String(s.content).trim().length < 20) {
      issues.push(`${key}이 비어 있거나 너무 짧습니다.`);
    }
  }
  if (!payload['한줄요약'] || String(payload['한줄요약']).trim().length < 5) {
    issues.push('한줄요약이 없습니다.');
  }

  return { ok: issues.length === 0, issues };
}

module.exports = { buildDailyPrompts, validateDailyResponse };
