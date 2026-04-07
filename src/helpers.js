'use strict';

const { SIGNS, SIGN_RULERS, ASPECTS, MAJOR_PLANETS_FOR_ORB } = require('./constants');

/**
 * Convert ecliptic longitude to sign and degree within sign
 */
function longitudeToSign(longitude) {
  const normalized = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  const degree = normalized - signIndex * 30;
  return {
    sign: SIGNS[signIndex],
    degree: parseFloat(degree.toFixed(4)),
    longitude: parseFloat(normalized.toFixed(4)),
  };
}

/**
 * Get house number (1-12) for a given longitude, given house cusps array (1-indexed)
 */
function getHouseNumber(longitude, cusps) {
  const lon = ((longitude % 360) + 360) % 360;
  for (let h = 1; h <= 12; h++) {
    const start = ((cusps[h] % 360) + 360) % 360;
    const end = ((cusps[h % 12 + 1] % 360) + 360) % 360;
    if (start <= end) {
      if (lon >= start && lon < end) return h;
    } else {
      // House crosses 0°
      if (lon >= start || lon < end) return h;
    }
  }
  return 1; // fallback
}

/**
 * Calculate angular distance between two longitudes (0-180)
 */
function angularDistance(lon1, lon2) {
  let diff = Math.abs(((lon1 - lon2) % 360 + 360) % 360);
  if (diff > 180) diff = 360 - diff;
  return diff;
}

/**
 * Find aspect between two planetary longitudes
 * Returns aspect object or null
 */
function findAspect(lon1, lon2, planet1, planet2) {
  const dist = angularDistance(lon1, lon2);

  // Determine orb modifier: -1 if neither planet is Sun or Moon
  const orbModifier = (
    MAJOR_PLANETS_FOR_ORB.includes(planet1) ||
    MAJOR_PLANETS_FOR_ORB.includes(planet2)
  ) ? 0 : -1;

  for (const asp of ASPECTS) {
    const maxOrb = asp.orb + orbModifier;
    const orb = Math.abs(dist - asp.angle);
    if (orb <= maxOrb) {
      return {
        aspect: asp.name,
        angle: asp.angle,
        orb: parseFloat(orb.toFixed(4)),
      };
    }
  }
  return null;
}

/**
 * Get Part of Fortune longitude
 * Day chart: ASC + Moon - Sun
 * Night chart: ASC - Moon + Sun
 * Simplified: use day formula (ASC + Moon - Sun)
 */
function calcPartOfFortune(ascLon, moonLon, sunLon) {
  const pof = ((ascLon + moonLon - sunLon) % 360 + 360) % 360;
  return pof;
}

/**
 * Get sign ruler
 */
function getSignRuler(sign) {
  return SIGN_RULERS[sign] || null;
}

/**
 * Format decimal longitude as degrees°minutes'
 */
function formatDegrees(longitude) {
  const deg = Math.floor(longitude);
  const min = Math.floor((longitude - deg) * 60);
  return `${deg}°${min}'`;
}

module.exports = {
  longitudeToSign,
  getHouseNumber,
  angularDistance,
  findAspect,
  calcPartOfFortune,
  getSignRuler,
  formatDegrees,
};
