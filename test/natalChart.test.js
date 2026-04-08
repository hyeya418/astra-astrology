'use strict';

require('dotenv').config();

const { calcNatalChart } = require('../src/natalChart');
const { calcTransits } = require('../src/transit');
const { calcSynastry } = require('../src/synastry');
const { callClaude } = require('../src/claudeApi');
const { buildPersonaPrompts } = require('../src/prompts/persona');

// Test birth data: 1995-04-18 14:58, Gwangmyeong-si, Gyeonggi-do
const TEST_INPUT = {
  year: 1995, month: 4, day: 18,
  hour: 14, minute: 58, second: 0,
  lat: 37.4784,
  lon: 126.8644,
  timezone: 9,
};

function assert(condition, message) {
  if (!condition) {
    throw new Error(`FAIL: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runTests() {
  let passed = 0;
  let failed = 0;

  console.log('\n=== Natal Chart Test Suite ===\n');

  // ── Test 1: calcNatalChart ──────────────────────────────────────────
  console.log('[1] calcNatalChart');
  try {
    const chart = calcNatalChart(TEST_INPUT);

    assert(Array.isArray(chart.planets), 'planets is an array');
    assert(chart.planets.length >= 12, `planets count >= 12 (got ${chart.planets.length})`);
    assert(Array.isArray(chart.houses), 'houses is an array');
    assert(chart.houses.length === 12, `houses count === 12 (got ${chart.houses.length})`);
    assert(Array.isArray(chart.aspects), 'aspects is an array');
    assert(chart.aspects.length > 0, `aspects not empty (got ${chart.aspects.length})`);
    assert(chart.angles.ascendant, 'ascendant exists');
    assert(chart.angles.mc, 'mc exists');
    assert(chart.meta.houseSystem === 'Placidus', 'house system is Placidus');

    // Verify specific planets exist
    const planetNames = chart.planets.map(p => p.name);
    ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'NorthNode', 'Lilith'].forEach(name => {
      assert(planetNames.includes(name), `${name} present`);
    });

    // Verify Sun position (should be ~27° Aries for Apr 18, 1995)
    const sun = chart.planets.find(p => p.name === 'Sun');
    assert(sun.sign === 'Aries', `Sun in Aries (got ${sun.sign})`);
    assert(sun.degree > 20 && sun.degree < 35, `Sun degree ~27° (got ${sun.degree})`);

    // Verify ASC sign
    console.log(`  → ASC: ${chart.angles.ascendant.sign} ${chart.angles.ascendant.degree.toFixed(2)}°`);
    console.log(`  → MC:  ${chart.angles.mc.sign} ${chart.angles.mc.degree.toFixed(2)}°`);
    console.log(`  → Sun: ${sun.sign} ${sun.degree.toFixed(2)}° H${sun.house}`);

    const moon = chart.planets.find(p => p.name === 'Moon');
    console.log(`  → Moon: ${moon.sign} ${moon.degree.toFixed(2)}° H${moon.house}`);
    console.log(`  → Aspects: ${chart.aspects.length}`);

    passed++;
  } catch (err) {
    console.error(`  ✗ ${err.message}`);
    failed++;
  }

  // ── Test 2: calcTransits ───────────────────────────────────────────
  console.log('\n[2] calcTransits');
  try {
    const chart = calcNatalChart(TEST_INPUT);
    const transits = calcTransits(chart);

    assert(transits.date, `transit date exists (${transits.date})`);
    assert(Array.isArray(transits.transits), 'transits is an array');
    assert(transits.transits.length > 0, `transits not empty (${transits.transits.length} found)`);
    assert(transits.transits[0].transitPlanet, 'transit has transitPlanet');
    assert(transits.transits[0].natalPlanet, 'transit has natalPlanet');
    assert(['harmony', 'tension', 'neutral'].includes(transits.transits[0].energy), 'transit energy is valid');

    console.log(`  → Today (${transits.date}): ${transits.transits.length} transits`);
    const tension = transits.transits.filter(t => t.energy === 'tension').length;
    const harmony = transits.transits.filter(t => t.energy === 'harmony').length;
    console.log(`  → Tension: ${tension}, Harmony: ${harmony}, Neutral: ${transits.transits.length - tension - harmony}`);

    passed++;
  } catch (err) {
    console.error(`  ✗ ${err.message}`);
    failed++;
  }

  // ── Test 3: calcSynastry ──────────────────────────────────────────
  console.log('\n[3] calcSynastry');
  try {
    const chart1 = calcNatalChart(TEST_INPUT);
    // Use a different date for chart2
    const chart2 = calcNatalChart({ ...TEST_INPUT, year: 1990, month: 8, day: 15 });
    const synastry = calcSynastry(chart1, chart2);

    assert(Array.isArray(synastry), 'synastry is an array');
    assert(synastry.length > 0, `synastry not empty (${synastry.length} aspects)`);
    assert(synastry[0].person1Planet, 'synastry has person1Planet');
    assert(synastry[0].person2Planet, 'synastry has person2Planet');

    console.log(`  → Synastry aspects: ${synastry.length}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${err.message}`);
    failed++;
  }

  // ── Test 4: Groq API - Persona analysis ─────────────────────────
  console.log('\n[4] Groq API - Persona analysis');
  if (!process.env.GROQ_API_KEY) {
    console.log('  ⚠ GROQ_API_KEY not set — skipping Groq API test');
  } else {
    try {
      const chart = calcNatalChart(TEST_INPUT);
      const { system, user } = buildPersonaPrompts(chart);
      const result = await callClaude(system, user);

      assert(result.title, 'result has title');
      assert(result.mask, 'result has mask');
      assert(result.inner, 'result has inner');
      assert(result.gap, 'result has gap');
      assert(result.advice, 'result has advice');

      console.log(`  → Title: ${result.title}`);
      console.log(`  → Advice: ${result.advice}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${err.message}`);
      failed++;
    }
  }

  // ── Summary ───────────────────────────────────────────────────────
  console.log(`\n${'='.repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('All tests passed! ✓');
  }
}

runTests().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
