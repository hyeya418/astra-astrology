'use strict';

const { buildKoreanOnlyRules, formatNameWithSuffix } = require('./utils');

function buildSajuPrompts(saju, name) {
  const displayName = formatNameWithSuffix(name);

  // 사주 4주 요약
  const pillarsText = saju.pillars
    .map((p) => `${p.name}: ${p.stemHanja}${p.branchHanja} (${p.stem}${p.branch}) — 천간 ${p.element}/${p.yin?'음':'양'}, 지지 ${p.branchElement}, 띠 ${p.zodiac}`)
    .join('\n');

  // 오행 분포
  const elementsText = Object.entries(saju.elements)
    .map(([k, v]) => `${k}: ${v}개`)
    .join(', ');

  // 부족한 오행 / 강한 오행
  const sortedElements = Object.entries(saju.elements).sort((a, b) => a[1] - b[1]);
  const weakest = sortedElements[0][0];
  const strongest = sortedElements[sortedElements.length - 1][0];

  const koreanOnlyRules = buildKoreanOnlyRules(displayName);

  const system = `당신은 한국 전통 사주명리학을 친근하게 풀어주는 사주 분석가입니다.
이미 계산된 사주 4주 데이터를 받아 그 의미를 일반인이 알아들을 수 있는 말로 풀어줍니다.

■ 규칙
${koreanOnlyRules.map((r, i) => `${i + 1}. ${r}`).join('\n')}
${koreanOnlyRules.length + 1}. 각 섹션은 4~6문장. 핵심 진단 → 근거 → 실천 조언 순서로.
${koreanOnlyRules.length + 2}. "~할 수 있습니다" 금지. 단정적으로 써라.
${koreanOnlyRules.length + 3}. 사주 용어(일간·용신·세운·관성 등)를 쓰면 반드시 한 문장으로 풀어 설명하라.
${koreanOnlyRules.length + 4}. 말투는 사주 잘 보는 친한 언니가 솔직하게 말해주는 톤. 무거운 한문체 금지.
${koreanOnlyRules.length + 5}. JSON만 반환. 앞뒤 설명 없음.

■ 출력 형식
{
  "일간분석": {
    "title": "나의 본질 — 일간 ${saju.dayMaster.hanja}(${saju.dayMaster.stem})",
    "content": "일간 ${saju.dayMaster.stem}(${saju.dayMaster.element}, ${saju.dayMaster.yin?'음':'양'})이 의미하는 성격, 강점, 약점 4~6문장"
  },
  "오행균형": {
    "title": "내 안의 다섯 기운",
    "content": "오행 분포(${elementsText})가 이 사람 인생에 어떤 패턴을 만드는지. 강한 ${strongest}이 만드는 강점과 부작용. 부족한 ${weakest}이 만드는 약점 4~6문장"
  },
  "용신": {
    "title": "내게 필요한 기운",
    "content": "부족한 오행을 보완하는 구체적인 실천: 색깔, 방위, 음식, 환경, 사람 유형. 4~6문장. 막연한 말 금지"
  },
  "세운2026": {
    "title": "2026년 ${saju.sewun.stemHanja}${saju.sewun.branchHanja}년 흐름",
    "content": "2026년 세운(${saju.sewun.stem}${saju.sewun.branch}, ${saju.sewun.element})이 일간 ${saju.dayMaster.stem}와 만나서 어떤 한 해가 되는지. 좋은 영역, 조심할 영역, 핵심 전략 4~6문장"
  }
}`;

  const user = `${displayName}의 사주 분석을 작성해주세요.

[사주 4주]
${pillarsText}

[일간 = 나의 본질]
${saju.dayMaster.hanja} (${saju.dayMaster.stem}, ${saju.dayMaster.element}/${saju.dayMaster.yin?'음':'양'})

[오행 분포]
${elementsText}
- 가장 강한 기운: ${strongest}
- 가장 부족한 기운: ${weakest}

[2026년 세운]
${saju.sewun.stemHanja}${saju.sewun.branchHanja} (${saju.sewun.stem}${saju.sewun.branch}, ${saju.sewun.element})

${displayName}에게 직접 말하듯 친근하게 풀어주세요.
한자는 사주 4주 표기에만 쓰고, 본문은 한글만.`;

  return { system, user };
}

function validateSajuResponse(payload) {
  const issues = [];
  if (!payload || typeof payload !== 'object') return { ok: false, issues: ['JSON 구조 없음'] };

  for (const key of ['일간분석', '오행균형', '용신', '세운2026']) {
    const s = payload[key];
    if (!s?.content || String(s.content).trim().length < 80) {
      issues.push(`${key}이 비어 있거나 너무 짧습니다.`);
    }
  }

  return { ok: issues.length === 0, issues };
}

module.exports = { buildSajuPrompts, validateSajuResponse };
