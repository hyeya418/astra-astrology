'use strict';

const express = require('express');
const router = express.Router();

const { calcNatalChart } = require('../src/natalChart');
const { calcTransits } = require('../src/transit');
const { calcSynastry } = require('../src/synastry');
const { callClaude } = require('../src/claudeApi');
const { buildPersonaPrompts } = require('../src/prompts/persona');
const { buildEnergyPrompts } = require('../src/prompts/energy');
const { buildCareerPrompts } = require('../src/prompts/career');
const { buildSynastryPrompts } = require('../src/prompts/synastry');

// Helper: extract birth data from request body with defaults
function extractBirthData(body) {
  const {
    year, month, day,
    hour = 0, minute = 0, second = 0,
    lat, lon,
    timezone = 0,
  } = body;

  if (!year || !month || !day || lat == null || lon == null) {
    throw new Error('Required fields: year, month, day, lat, lon');
  }

  return { year, month, day, hour, minute, second, lat, lon, timezone };
}

// POST /chart/natal
router.post('/natal', (req, res) => {
  try {
    const input = extractBirthData(req.body);
    const chart = calcNatalChart(input);
    res.json({ success: true, data: chart });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /chart/analyze/persona
router.post('/analyze/persona', async (req, res) => {
  try {
    const input = extractBirthData(req.body);
    const chart = calcNatalChart(input);
    const { system, user } = buildPersonaPrompts(chart);
    const result = await callClaude(system, user);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /chart/analyze/energy
router.post('/analyze/energy', async (req, res) => {
  try {
    const input = extractBirthData(req.body);
    const chart = calcNatalChart(input);
    const transits = calcTransits(chart);
    const { system, user } = buildEnergyPrompts(chart, transits);
    const result = await callClaude(system, user);
    res.json({ success: true, data: result, transits });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /chart/analyze/career
router.post('/analyze/career', async (req, res) => {
  try {
    const input = extractBirthData(req.body);
    const chart = calcNatalChart(input);
    const { system, user } = buildCareerPrompts(chart);
    const result = await callClaude(system, user);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /chart/analyze/synastry
// Body: { person1: { year, month, day, ... }, person2: { year, month, day, ... } }
router.post('/analyze/synastry', async (req, res) => {
  try {
    const { person1, person2 } = req.body;
    if (!person1 || !person2) {
      return res.status(400).json({ success: false, error: 'Required: person1 and person2 birth data' });
    }

    const input1 = extractBirthData(person1);
    const input2 = extractBirthData(person2);

    const chart1 = calcNatalChart(input1);
    const chart2 = calcNatalChart(input2);
    const synastryAspects = calcSynastry(chart1, chart2);

    const { system, user } = buildSynastryPrompts(chart1, chart2, synastryAspects);
    const result = await callClaude(system, user);

    res.json({ success: true, data: result, synastryAspects: synastryAspects.slice(0, 20) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
