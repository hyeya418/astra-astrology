'use strict';

// Swiss Ephemeris planet IDs
const PLANET_IDS = {
  Sun: 0,
  Moon: 1,
  Mercury: 2,
  Venus: 3,
  Mars: 4,
  Jupiter: 5,
  Saturn: 6,
  Uranus: 7,
  Neptune: 8,
  Pluto: 9,
  NorthNode: 10,  // SE_MEAN_NODE
  Lilith: 12,     // SE_MEAN_APOG (Black Moon Lilith)
  Chiron: 15,     // SE_CHIRON
};

const PLANET_NAMES = Object.keys(PLANET_IDS);

// Zodiac signs
const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

// Sign rulers (for house ruler calculation)
const SIGN_RULERS = {
  Aries: 'Mars',
  Taurus: 'Venus',
  Gemini: 'Mercury',
  Cancer: 'Moon',
  Leo: 'Sun',
  Virgo: 'Mercury',
  Libra: 'Venus',
  Scorpio: 'Pluto',
  Sagittarius: 'Jupiter',
  Capricorn: 'Saturn',
  Aquarius: 'Uranus',
  Pisces: 'Neptune',
};

// Aspect definitions: { angle, orb, name }
const ASPECTS = [
  { name: 'Conjunction', angle: 0, orb: 8 },
  { name: 'Opposition', angle: 180, orb: 8 },
  { name: 'Square', angle: 90, orb: 7 },
  { name: 'Trine', angle: 120, orb: 7 },
  { name: 'Sextile', angle: 60, orb: 5 },
];

// Sun and Moon get full orb; other pairs get -1° reduction
const MAJOR_PLANETS_FOR_ORB = ['Sun', 'Moon'];

// Swiss Ephemeris flags
const SEFLG_MOSEPH = 4;     // Moshier ephemeris (built-in, no files needed)
const SEFLG_SPEED = 256;    // Include speed in result
const CALC_FLAG = SEFLG_MOSEPH | SEFLG_SPEED;

const SE_GREG_CAL = 1;      // Gregorian calendar flag

// Placidus house system char code
const HOUSE_SYSTEM = 'P'.charCodeAt(0);

// ascmc array indices
const ASC_IDX = 0;
const MC_IDX = 1;
const VERTEX_IDX = 3;

module.exports = {
  PLANET_IDS,
  PLANET_NAMES,
  SIGNS,
  SIGN_RULERS,
  ASPECTS,
  MAJOR_PLANETS_FOR_ORB,
  CALC_FLAG,
  SE_GREG_CAL,
  HOUSE_SYSTEM,
  ASC_IDX,
  MC_IDX,
  VERTEX_IDX,
};
