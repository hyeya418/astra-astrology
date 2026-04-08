'use strict';

const Groq = require('groq-sdk');

let _client = null;

function getClient() {
  if (!_client) {
    _client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _client;
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
        { role: 'user',   content: user },
      ],
      temperature: 0.8,
      max_tokens: 4096,
    });

    const text = completion.choices[0].message.content.trim();

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
    try {
      return await attempt();
    } catch (retryErr) {
      throw new Error(`Groq API JSON parse failed after retry: ${retryErr.message}`);
    }
  }
}

module.exports = { callClaude };
