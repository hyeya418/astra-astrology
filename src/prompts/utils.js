'use strict';

const SIGN_NAMES_KO = {
  Aries: '양자리',
  Taurus: '황소자리',
  Gemini: '쌍둥이자리',
  Cancer: '게자리',
  Leo: '사자자리',
  Virgo: '처녀자리',
  Libra: '천칭자리',
  Scorpio: '전갈자리',
  Sagittarius: '사수자리',
  Capricorn: '염소자리',
  Aquarius: '물병자리',
  Pisces: '물고기자리',
};

const PLANET_NAMES_KO = {
  Sun: '태양',
  Moon: '달',
  Mercury: '수성',
  Venus: '금성',
  Mars: '화성',
  Jupiter: '목성',
  Saturn: '토성',
  Uranus: '천왕성',
  Neptune: '해왕성',
  Pluto: '명왕성',
};

const ASPECT_NAMES_KO = {
  Conjunction: '만남',
  Opposition: '마주봄',
  Square: '충돌',
  Trine: '조화',
  Sextile: '도움',
};

function toKoreanSign(sign) {
  return SIGN_NAMES_KO[sign] || sign || '미상';
}

function toKoreanPlanet(name) {
  return PLANET_NAMES_KO[name] || name || '미상';
}

function toKoreanAspect(name) {
  return ASPECT_NAMES_KO[name] || name || '미상';
}

function formatDegree(value) {
  return typeof value === 'number' ? `${value.toFixed(1)}도` : '미상';
}

function formatPlanetPosition(planet, options = {}) {
  if (!planet) return '미상';

  const sign = toKoreanSign(planet.sign);
  const degreeText = options.includeDegree ? ` ${formatDegree(planet.degree)}` : '';
  const houseText = planet.house ? `, ${planet.house}하우스` : '';
  const retrogradeText = options.includeRetrograde
    ? ` (${planet.retrograde ? '역행' : '순행'})`
    : '';

  return `${sign}${degreeText}${houseText}${retrogradeText}`;
}

function formatHouseSign(house) {
  if (!house) return '미상';
  return toKoreanSign(house.sign);
}

function formatNameWithSuffix(name) {
  const cleaned = String(name || '').trim();
  if (!cleaned) return '이분';

  const withoutSpaces = cleaned.replace(/\s+/g, '');
  const lastTwo = withoutSpaces.slice(-2) || withoutSpaces;
  return `${lastTwo}님`;
}

function buildKoreanOnlyRules(subjectLabel = '이분') {
  return [
    `${subjectLabel}을 부를 때는 입력된 이름의 마지막 두 글자에 "님"을 붙인 호칭만 사용하세요. 예: "김지혜"는 "지혜님"으로 부르세요.`,
    '모든 문장은 자연스러운 한국어로만 작성하세요.',
    '한자, 영어, 일본어, 로마자, 알파벳, 영문 약자를 절대 섞지 마세요.',
    '행성명, 별자리명, 각도 이름도 모두 한글 표현으로 바꾸어 쓰세요.',
    '외국어 단어가 떠오르더라도 반드시 쉬운 한국어 표현으로 풀어 쓰세요.',
    '응답을 다 쓴 뒤 외국어 글자나 한자가 한 글자라도 남아 있으면 전부 한국어로 다시 고쳐 쓰세요.',
  ];
}

module.exports = {
  buildKoreanOnlyRules,
  formatDegree,
  formatHouseSign,
  formatNameWithSuffix,
  formatPlanetPosition,
  toKoreanAspect,
  toKoreanPlanet,
  toKoreanSign,
};
