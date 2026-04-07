'use strict';

const { getSwe } = require('./natalChart');
const { PLANET_IDS, PLANET_NAMES, CALC_FLAG, SE_GREG_CAL } = require('./constants');
const { longitudeToSign, findAspect } = require('./helpers');

/**
 * Energy classification for transit aspects
 */
function classifyEnergy(aspectName, transitPlanet) {
  const harmonyAspects = ['Trine', 'Sextile'];
  const tensionAspects = ['Square', 'Opposition'];

  if (tensionAspects.includes(aspectName)) return 'tension';
  if (harmonyAspects.includes(aspectName)) return 'harmony';
  // Conjunction: depends on planet — benefics are harmony, malefics tension, neutrals neutral
  if (aspectName === 'Conjunction') {
    const benefics = ['Venus', 'Jupiter', 'Sun', 'Moon'];
    const malefics = ['Saturn', 'Mars', 'Pluto'];
    if (benefics.includes(transitPlanet)) return 'harmony';
    if (malefics.includes(transitPlanet)) return 'tension';
    return 'neutral';
  }
  return 'neutral';
}

/**
 * Calculate today's transit planets and compare them to a natal chart.
 *
 * @param {object} natalChart - Result from calcNatalChart()
 * @returns {object} { date, transits }
 */
function calcTransits(natalChart) {
  const swe = getSwe();
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  const day = now.getUTCDate();
  const hour = now.getUTCHours() + now.getUTCMinutes() / 60;

  const julianDay = swe.swe_julday(year, month, day, hour, SE_GREG_CAL);

  // Get today's planet positions
  const transitPositions = [];
  for (const name of PLANET_NAMES) {
    const id = PLANET_IDS[name];
    const result = swe.swe_calc_ut(julianDay, id, CALC_FLAG);
    if (result.returnCode < 0 || (result.xx[0] === 0 && result.xx[3] === 0 && result.error && result.error.includes('not found'))) {
      continue;
    }
    transitPositions.push({
      name,
      longitude: result.xx[0],
      retrograde: result.xx[3] < 0,
    });
  }

  // Compare each transit planet to each natal planet
  const transits = [];
  for (const transit of transitPositions) {
    for (const natal of natalChart.planets) {
      const asp = findAspect(transit.longitude, natal.longitude, transit.name, natal.name);
      if (asp) {
        transits.push({
          transitPlanet: transit.name,
          natalPlanet: natal.name,
          aspect: asp.aspect,
          orb: asp.orb,
          energy: classifyEnergy(asp.aspect, transit.name),
          transitRetrograde: transit.retrograde,
        });
      }
    }
  }

  // Sort by orb (tightest first)
  transits.sort((a, b) => a.orb - b.orb);

  const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

  return { date: dateStr, transits };
}

module.exports = { calcTransits };
