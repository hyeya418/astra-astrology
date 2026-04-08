'use strict';

const { GoogleGenerativeAI } = require('@google/generative-ai');

let _client = null;

function getClient() {
  if (!_client) {
    _client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return _client;
}

/**
 * Call Gemini API and parse JSON response.
 * Retries once if JSON parsing fails.
 *
 * @param {string} system - System prompt
 * @param {string} user - User prompt
 * @returns {object} Parsed JSON result
 */
async function callClaude(system, user) {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: system,
  });

  async function attempt() {
    const result = await model.generateContent(user);
    const text = result.response.text().trim();

    // Strip markdown code blocks if present
    const jsonText = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    return JSON.parse(jsonText);
  }

  try {
    return await attempt();
  } catch (err) {
    // Retry once
    try {
      return await attempt();
    } catch (retryErr) {
      throw new Error(`Gemini API JSON parse failed after retry: ${retryErr.message}`);
    }
  }
}

module.exports = { callClaude };
