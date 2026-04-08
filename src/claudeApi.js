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
async function callClaude(system, user) {
  const client = getClient();

  async function attempt() {
    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.8,
      max_tokens: 4096,
    });

    const text = completion.choices[0].message.content.trim();

    const jsonText = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsed = JSON.parse(jsonText);
    return sanitizeResponsePayload(parsed);
  }

  try {
    return await attempt();
  } catch (err) {
    try {
      return await attempt();
    } catch (retryErr) {
      throw new Error(`Groq API JSON parse failed after retry: ${retryErr.message}`);
    }
  }
}

module.exports = { callClaude, sanitizeKoreanText, sanitizeResponsePayload };
