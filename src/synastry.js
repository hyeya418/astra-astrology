'use strict';

const { findAspect } = require('./helpers');

/**
 * Calculate synastry aspects between two natal charts.
 * Compares every planet in chart1 against every planet in chart2 (one-directional).
 *
 * @param {object} chart1 - Natal chart for person 1
 * @param {object} chart2 - Natal chart for person 2
 * @returns {Array} Array of synastry aspect objects
 */
function calcSynastry(chart1, chart2) {
  const aspects = [];

  for (const p1 of chart1.planets) {
    for (const p2 of chart2.planets) {
      const asp = findAspect(p1.longitude, p2.longitude, p1.name, p2.name);
      if (asp) {
        aspects.push({
          person1Planet: p1.name,
          person2Planet: p2.name,
          aspect: asp.aspect,
          angle: asp.angle,
          orb: asp.orb,
        });
      }
    }
  }

  // Also compare chart1 angles (ASC) against chart2 planets
  if (chart1.angles.ascendant) {
    const ascLon = chart1.angles.ascendant.longitude;
    for (const p2 of chart2.planets) {
      const asp = findAspect(ascLon, p2.longitude, 'ASC1', p2.name);
      if (asp) {
        aspects.push({
          person1Planet: 'ASC',
          person2Planet: p2.name,
          aspect: asp.aspect,
          angle: asp.angle,
          orb: asp.orb,
        });
      }
    }
  }

  aspects.sort((a, b) => a.orb - b.orb);
  return aspects;
}

module.exports = { calcSynastry };
