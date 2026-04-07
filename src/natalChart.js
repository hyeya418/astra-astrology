'use strict';

const fs = require('fs');
const path = require('path');
const { SwissEph } = require('@fusionstrings/swisseph-wasi');
const {
  PLANET_IDS, PLANET_NAMES, CALC_FLAG, SE_GREG_CAL,
  HOUSE_SYSTEM, ASC_IDX, MC_IDX, VERTEX_IDX,
} = require('./constants');
const { longitudeToSign, getHouseNumber, findAspect, calcPartOfFortune } = require('./helpers');

// Singleton SwissEph instance — initialized once
let _swe = null;

function getSwe() {
  if (!_swe) {
    const wasmPath = path.join(
      __dirname, '..', 'node_modules', '@fusionstrings', 'swisseph-wasi', 'wasm', 'libswephe.wasm'
    );
    const wasmBytes = fs.readFileSync(wasmPath);
    const wasmModule = new WebAssembly.Module(wasmBytes);
    _swe = new SwissEph(wasmModule);
  }
  return _swe;
}

/**
 * Calculate a natal chart from birth data.
 *
 * @param {object} input - { year, month, day, hour, minute, second, lat, lon, timezone }
 * @returns {object} Full natal chart JSON
 */
function calcNatalChart(input) {
  const {
    year, month, day,
    hour = 0, minute = 0, second = 0,
    lat, lon,
    timezone = 0,
  } = input;

  const swe = getSwe();

  // Convert local time to UT
  const localHour = hour + minute / 60 + second / 3600;
  const utHour = localHour - timezone;

  // Julian Day in UT
  const julianDay = swe.swe_julday(year, month, day, utHour, SE_GREG_CAL);

  // Calculate house cusps (Placidus)
  const housesResult = swe.swe_houses(julianDay, lat, lon, HOUSE_SYSTEM);
  const cusps = housesResult.cusps;   // index 1–12
  const ascmc = housesResult.ascmc;

  const ascendant = ascmc[ASC_IDX];
  const mc = ascmc[MC_IDX];
  const vertex = ascmc[VERTEX_IDX];

  // Calculate planet positions
  const planets = [];
  for (const name of PLANET_NAMES) {
    const id = PLANET_IDS[name];
    const result = swe.swe_calc_ut(julianDay, id, CALC_FLAG);

    // Chiron or other bodies may fail without ephemeris files
    if (result.returnCode < 0 || (result.xx[0] === 0 && result.xx[3] === 0 && result.error && result.error.includes('not found'))) {
      continue;
    }

    const longitude = result.xx[0];
    const speed = result.xx[3];
    const retrograde = speed < 0;

    const { sign, degree } = longitudeToSign(longitude);
    const house = getHouseNumber(longitude, cusps);

    planets.push({
      name,
      longitude: parseFloat(longitude.toFixed(4)),
      sign,
      degree: parseFloat(degree.toFixed(4)),
      house,
      retrograde,
    });
  }

  // Build houses array
  const houses = [];
  for (let h = 1; h <= 12; h++) {
    const { sign, degree } = longitudeToSign(cusps[h]);
    houses.push({
      house: h,
      cusp: parseFloat(cusps[h].toFixed(4)),
      sign,
      degree: parseFloat(degree.toFixed(4)),
    });
  }

  // Build angles
  const ascInfo = longitudeToSign(ascendant);
  const mcInfo = longitudeToSign(mc);
  const vertexInfo = longitudeToSign(vertex);

  // Find Moon and Sun for Part of Fortune
  const sunPlanet = planets.find(p => p.name === 'Sun');
  const moonPlanet = planets.find(p => p.name === 'Moon');
  let partOfFortune = null;
  if (sunPlanet && moonPlanet) {
    const pofLon = calcPartOfFortune(ascendant, moonPlanet.longitude, sunPlanet.longitude);
    const pofInfo = longitudeToSign(pofLon);
    partOfFortune = {
      longitude: parseFloat(pofLon.toFixed(4)),
      sign: pofInfo.sign,
      degree: parseFloat(pofInfo.degree.toFixed(4)),
    };
  }

  // Calculate aspects between all planet pairs
  const aspects = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i];
      const p2 = planets[j];
      const asp = findAspect(p1.longitude, p2.longitude, p1.name, p2.name);
      if (asp) {
        aspects.push({
          planet1: p1.name,
          planet2: p2.name,
          aspect: asp.aspect,
          angle: asp.angle,
          orb: asp.orb,
        });
      }
    }
  }

  return {
    meta: {
      input: { year, month, day, hour, minute, second, lat, lon, timezone },
      julianDay: parseFloat(julianDay.toFixed(6)),
      houseSystem: 'Placidus',
      calculatedAt: new Date().toISOString(),
    },
    planets,
    houses,
    angles: {
      ascendant: {
        longitude: parseFloat(ascendant.toFixed(4)),
        sign: ascInfo.sign,
        degree: parseFloat(ascInfo.degree.toFixed(4)),
      },
      mc: {
        longitude: parseFloat(mc.toFixed(4)),
        sign: mcInfo.sign,
        degree: parseFloat(mcInfo.degree.toFixed(4)),
      },
      vertex: {
        longitude: parseFloat(vertex.toFixed(4)),
        sign: vertexInfo.sign,
        degree: parseFloat(vertexInfo.degree.toFixed(4)),
      },
      partOfFortune,
    },
    aspects,
  };
}

module.exports = { calcNatalChart, getSwe };
