'use strict';

const Groq = require('groq-sdk');

let _client = null;

function getClient() {
  if (!_client) {
    _client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _client;
}

function sanitizeKoreanText(text) {
  if (typeof text !== 'string') return text;

  return text
    .replace(/[A-Za-z]+/g, ' ')
    .replace(/[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF]/g, ' ')
    .replace(/[\u3040-\u30FF\u31F0-\u31FF]/g, ' ')
    .replace(/[^\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F0-9\s.,!?~:;()%\-\[\]{}"'&/]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,!?~:;)%\]\}])/g, '$1')
    .replace(/([\[\{(])\s+/g, '$1')
    .trim();
}

function sanitizeResponsePayload(value, keyPath = []) {
  if (Array.isArray(value)) {
    return value.map((item, index) => sanitizeResponsePayload(item, keyPath.concat(index)));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, sanitizeResponsePayload(nestedValue, keyPath.concat(key))]),
    );
  }

  if (typeof value !== 'string') {
    return value;
  }

  const currentKey = String(keyPath[keyPath.length - 1] || '');
  if (currentKey === 'level') {
    return value;
  }

  return sanitizeKoreanText(value);
}

/**
 * Call Groq API and parse JSON response.
 * Retries once if JSON parsing fails.
 */
async function callClaude(system, user, options = {}) {
  const client = getClient();
  const {
    validator,
    repairInstruction,
    temperature = 0.8,
    maxAttempts = 2,
    userFacingErrorMessage = '해석을 안정적으로 생성하지 못했습니다. 잠시 후 다시 시도해주세요.',
  } = options;

  async function request(messages, requestTemperature) {
    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: requestTemperature,
      max_tokens: 3500,
    });

    const text = completion.choices[0].message.content.trim();

    const jsonText = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsed = JSON.parse(jsonText);
    const sanitized = sanitizeResponsePayload(parsed);

    if (typeof validator === 'function') {
      const validation = validator(sanitized);
      if (validation && validation.ok === false) {
        const reason = Array.isArray(validation.issues)
          ? validation.issues.join(' / ')
          : '응답 품질 검증 실패';
        const error = new Error(reason);
        error.validationIssues = validation.issues || [reason];
        error.sanitized = sanitized;
        throw error;
      }
    }

    return sanitized;
  }

  let messages = [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
  let currentTemperature = temperature;
  let lastError = null;
  let lastSanitizedResponse = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await request(messages, currentTemperature);
      lastSanitizedResponse = response;
      return response;
    } catch (err) {
      lastError = err;
      if (err.sanitized) {
        lastSanitizedResponse = err.sanitized;
      }

      if (attempt >= maxAttempts) {
        break;
      }

      if (err.validationIssues) {
        messages.push({
          role: 'user',
          content: `방금 응답은 아래 이유로 다시 써야 합니다.

- ${err.validationIssues.join('\n- ')}

${repairInstruction || '같은 JSON 형식을 유지하되, 더 구체적이고 번역투 없는 한국어로 처음부터 다시 작성하세요.'}

이전 응답:
${JSON.stringify(err.sanitized)}`,
        });
      } else {
        messages.push({
          role: 'user',
          content: `${repairInstruction || '같은 JSON 형식을 유지하되, 더 구체적이고 자연스러운 한국어로 처음부터 다시 작성하세요.'}

이전 응답에는 형식 또는 문장 품질 문제가 있었습니다. 이번에는 JSON 형식을 정확히 지키고, 번역투 없이 자연스러운 한국어로만 다시 작성하세요.`,
        });
      }

      currentTemperature = 0.55;
    }
  }

  if (lastSanitizedResponse) {
    console.warn('Groq response validation failed; returning best-effort response:', lastError?.message || 'unknown error');
    return lastSanitizedResponse;
  }

  console.error('Groq response generation failed:', lastError?.message || 'unknown error');
  throw new Error(userFacingErrorMessage);
}

module.exports = { callClaude, sanitizeKoreanText, sanitizeResponsePayload };
