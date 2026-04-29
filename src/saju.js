'use strict';

// ─── 천간 (10 Heavenly Stems) ───────────────────────────────────────────────
const STEMS = ['갑','을','병','정','무','기','경','신','임','계'];
const STEMS_HANJA = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const STEM_ELEMENT = ['목','목','화','화','토','토','금','금','수','수'];
const STEM_YIN    = [false,true,false,true,false,true,false,true,false,true];

// ─── 지지 (12 Earthly Branches) ─────────────────────────────────────────────
const BRANCHES = ['자','축','인','묘','진','사','오','미','신','유','술','해'];
const BRANCHES_HANJA = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const BRANCH_ELEMENT = ['수','토','목','목','토','화','화','토','금','금','토','수'];
const BRANCH_ZODIAC  = ['쥐','소','호랑이','토끼','용','뱀','말','양','원숭이','닭','개','돼지'];

// 월지: 인(2)월부터 시작 (인묘진사오미신유술해자축)
// 절기 기준 월별 월지 인덱스 (0=자, 1=축, 2=인 ...)
const MONTH_BRANCH_IDX = [10,11,0,1,2,3,4,5,6,7,8,9]; // 실제 계산에서 절기로 보정

// 절기 기준 월지 (1월부터): 소한~대한 사이=축월, 입춘 이후=인월...
// 절(節)만 사용 (중기 제외)
// 각 달의 절기 시작 대략 날짜 (평년 기준)
const JIE_DATES = [
  { month: 1,  day: 6  }, // 소한 → 축월
  { month: 2,  day: 4  }, // 입춘 → 인월
  { month: 3,  day: 6  }, // 경칩 → 묘월
  { month: 4,  day: 5  }, // 청명 → 진월
  { month: 5,  day: 6  }, // 입하 → 사월
  { month: 6,  day: 6  }, // 망종 → 오월
  { month: 7,  day: 7  }, // 소서 → 미월
  { month: 8,  day: 7  }, // 입추 → 신월
  { month: 9,  day: 8  }, // 백로 → 유월
  { month: 10, day: 8  }, // 한로 → 술월
  { month: 11, day: 7  }, // 입동 → 해월
  { month: 12, day: 7  }, // 대설 → 자월
];

// 절기 이름 (인월부터 12개)
const JIE_NAMES = ['입춘','경칩','청명','입하','망종','소서','입추','백로','한로','입동','대설','소한'];

// 월지 인덱스 (인월=2 부터 시작, JIE_DATES 순서에 맞춤)
const JIE_BRANCH_IDX = [1,2,3,4,5,6,7,8,9,10,11,0]; // 소한→축, 입춘→인, ...

// 월간 계산표: 년간 인덱스 % 5 → 인월(첫번째 월)의 천간 인덱스
const MONTH_STEM_START = [2, 4, 6, 8, 0]; // 갑기년=병인, 을경년=무인, 병신년=경인, 정임년=임인, 무계년=갑인

// 시지: 자시(23-1시)부터 2시간씩
const HOUR_BRANCH_START = 23; // 자시 시작 시각

// 시간 천간 계산표: 일간 인덱스 % 5 → 자시(첫번째 시)의 천간 인덱스
const HOUR_STEM_START = [0, 2, 4, 6, 8]; // 갑기일=갑자, 을경일=병자, 병신일=무자, 정임일=경자, 무계일=임자

/**
 * 일주 계산: Julian Day Number 기반
 * 기준점: 1900년 1월 1일 = 甲戌일 (stem=0, branch=10 → 갑술, idx=10 in 60-cycle)
 * 실제로는 JDN mod 60 으로 계산
 */
function calcJDN(year, month, day) {
  // Gregorian to JDN
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y +
    Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

/**
 * 60갑자 인덱스 → { stemIdx, branchIdx }
 */
function idx60ToStemBranch(idx60) {
  return {
    stemIdx:   idx60 % 10,
    branchIdx: idx60 % 12,
  };
}

/**
 * 년주 계산
 * 입춘(2월 4일) 이전이면 전년도 기준
 */
function calcYearPillar(year, month, day) {
  let y = year;
  // 입춘 이전이면 전년도
  if (month < 2 || (month === 2 && day < 4)) {
    y -= 1;
  }
  const stemIdx   = ((y - 4) % 10 + 10) % 10;
  const branchIdx = ((y - 4) % 12 + 12) % 12;
  return makePillar('년주', stemIdx, branchIdx);
}

/**
 * 월주 계산
 * 절기 기준으로 월지 결정, 월간은 년간에 따라 결정
 */
function calcMonthPillar(year, month, day, yearStemIdx) {
  // 어느 절기 구간에 속하는지 찾기
  let jieIdx = -1;
  for (let i = JIE_DATES.length - 1; i >= 0; i--) {
    const jd = JIE_DATES[i];
    if (month > jd.month || (month === jd.month && day >= jd.day)) {
      jieIdx = i;
      break;
    }
  }
  if (jieIdx === -1) jieIdx = 11; // 1월 소한 이전 → 전년 대설 (자월)

  const branchIdx = JIE_BRANCH_IDX[jieIdx];
  // 인월(branchIdx=2)이 기준, 몇 번째 월인지
  const monthOffset = ((branchIdx - 2) + 12) % 12;
  const stemStartIdx = MONTH_STEM_START[yearStemIdx % 5];
  const stemIdx = (stemStartIdx + monthOffset) % 10;

  const pillar = makePillar('월주', stemIdx, branchIdx);
  pillar.solarTerm = JIE_NAMES[jieIdx];
  return pillar;
}

/**
 * 일주 계산
 * JDN 기준점: JDN 2415021 = 1900-01-01 = 甲戌 (idx60 = 10)
 */
function calcDayPillar(year, month, day) {
  const jdn = calcJDN(year, month, day);
  const REF_JDN  = 2415021; // 1900-01-01
  const REF_IDX60 = 10;      // 甲戌 = stem0+branch10 → idx60=10
  const diff = ((jdn - REF_JDN) % 60 + 60) % 60;
  const idx60 = (REF_IDX60 + diff) % 60;
  const { stemIdx, branchIdx } = idx60ToStemBranch(idx60);
  return makePillar('일주', stemIdx, branchIdx);
}

/**
 * 시주 계산
 * 자시: 23~01시, 축시: 01~03시, ...
 */
function calcHourPillar(hour, dayStemIdx) {
  // 23시는 자시(다음날 기준이지만 같은 날로 처리)
  const h = hour === 23 ? 0 : hour;
  const branchIdx = Math.floor((h + 1) / 2) % 12;
  const stemStartIdx = HOUR_STEM_START[dayStemIdx % 5];
  const stemIdx = (stemStartIdx + branchIdx) % 10;
  return makePillar('시주', stemIdx, branchIdx);
}

function makePillar(name, stemIdx, branchIdx) {
  return {
    name,
    stem:        STEMS[stemIdx],
    branch:      BRANCHES[branchIdx],
    stemHanja:   STEMS_HANJA[stemIdx],
    branchHanja: BRANCHES_HANJA[branchIdx],
    element:     STEM_ELEMENT[stemIdx],
    yin:         STEM_YIN[stemIdx],
    branchElement: BRANCH_ELEMENT[branchIdx],
    zodiac:      BRANCH_ZODIAC[branchIdx],
    stemIdx,
    branchIdx,
  };
}

/**
 * 오행 분포 계산 (천간 4개 + 지지 4개 = 8개 기준)
 */
function calcElements(pillars) {
  const count = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  for (const p of pillars) {
    count[p.element] = (count[p.element] || 0) + 1;
    count[p.branchElement] = (count[p.branchElement] || 0) + 1;
  }
  return count;
}

/**
 * 메인 사주 계산 함수
 */
function calcSaju(input) {
  const { year, month, day, hour = 12, name = '' } = input;

  const yearPillar  = calcYearPillar(year, month, day);
  const monthPillar = calcMonthPillar(year, month, day, yearPillar.stemIdx);
  const dayPillar   = calcDayPillar(year, month, day);
  const hourPillar  = calcHourPillar(hour, dayPillar.stemIdx);

  const pillars = [yearPillar, monthPillar, dayPillar, hourPillar];
  const elements = calcElements(pillars);

  // 일간 (나의 본질)
  const dayMaster = {
    stem:    dayPillar.stem,
    hanja:   dayPillar.stemHanja,
    element: dayPillar.element,
    yin:     dayPillar.yin,
  };

  // 2026년 세운
  const sewunYear = 2026;
  const sewunStemIdx   = ((sewunYear - 4) % 10 + 10) % 10;
  const sewunBranchIdx = ((sewunYear - 4) % 12 + 12) % 12;
  const sewun = {
    year: sewunYear,
    stem: STEMS[sewunStemIdx],
    branch: BRANCHES[sewunBranchIdx],
    stemHanja: STEMS_HANJA[sewunStemIdx],
    branchHanja: BRANCHES_HANJA[sewunBranchIdx],
    element: STEM_ELEMENT[sewunStemIdx],
  };

  return {
    pillars,
    dayMaster,
    elements,
    sewun,
    meta: { input: { year, month, day, hour, name }, calculatedAt: new Date().toISOString() },
  };
}

module.exports = { calcSaju };
