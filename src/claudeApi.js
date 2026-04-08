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
  const { validator, repairInstruction, temperature = 0.8 } = options;

  async function request(messages, requestTemperature) {
    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: requestTemperature,
      max_tokens: 4096,
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

  async function attempt() {
    return request([
      { role: 'system', content: system },
      { role: 'user', content: user },
    ], temperature);
  }

  try {
    return await attempt();
  } catch (err) {
    try {
      const messages = [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ];

      if (err.validationIssues) {
        messages.push({
          role: 'user',
          content: `방금 응답은 아래 이유로 다시 써야 합니다.

- ${err.validationIssues.join('\n- ')}

${repairInstruction || '같은 JSON 형식을 유지하되, 더 구체적이고 번역투 없는 한국어로 처음부터 다시 작성하세요.'}

이전 응답:
${JSON.stringify(err.sanitized)}`,
        });
      }

      return await request(messages, 0.55);
    } catch (retryErr) {
      throw new Error(`Groq API JSON parse failed after retry: ${retryErr.message}`);
    }
  }
}

module.exports = { callClaude, sanitizeKoreanText, sanitizeResponsePayload };
