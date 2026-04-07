import { useState } from 'react';
import { motion } from 'framer-motion';

const CX = 250;
const CY = 250;
const R_OUTER = 220;   // outer edge
const R_SIGN = 195;    // sign band outer
const R_SIGN_IN = 165; // sign band inner
const R_HOUSE = 155;   // house number area
const R_PLANET = 125;  // planet placement

const SIGNS = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
];
const SIGN_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];

const PLANET_SYMBOLS = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  NorthNode: '☊', Lilith: '⚸', Chiron: '⚷',
};

// Convert ecliptic longitude to SVG angle
// ASC is at 9-o'clock (180° in SVG). Zodiac goes counter-clockwise.
function lonToAngle(lon, ascLon) {
  const rel = ((lon - ascLon) % 360 + 360) % 360;
  return 180 - rel; // SVG angle
}

function polarToXY(cx, cy, r, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToXY(cx, cy, r, startAngle);
  const end = polarToXY(cx, cy, r, endAngle);
  const largeArc = ((endAngle - startAngle + 360) % 360) > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export default function ChartWheel({ chart }) {
  const [activeplanet, setActivePlanet] = useState(null);

  if (!chart) return null;

  const ascLon = chart.angles?.ascendant?.longitude ?? 0;
  const planets = chart.planets ?? [];
  const houses = chart.houses ?? [];

  // Deduplicate planets by clustering close longitudes
  const placed = [];
  const planetPositions = planets.map(p => {
    let lon = p.longitude;
    // Nudge if too close to existing planet
    const nearby = placed.filter(pp => Math.abs(((pp - lon + 180 + 360) % 360) - 180) < 8);
    if (nearby.length > 0) lon += nearby.length * 9;
    placed.push(lon);
    return { ...p, displayLon: lon };
  });

  const activePlanetData = activeplanet
    ? planets.find(p => p.name === activeplanet)
    : null;

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 500, margin: '0 auto' }}>
      <motion.div
        initial={{ rotate: -360, opacity: 0, scale: 0.8 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        <svg
          viewBox="0 0 500 500"
          style={{ width: '100%', height: 'auto', display: 'block' }}
          aria-label="Natal chart wheel"
        >
          <defs>
            <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1a1025" />
              <stop offset="100%" stopColor="#0a0a0f" />
            </radialGradient>
          </defs>

          {/* Background */}
          <circle cx={CX} cy={CY} r={R_OUTER} fill="url(#bgGrad)" stroke="rgba(201,168,76,0.25)" strokeWidth="1" />

          {/* Sign band */}
          <circle cx={CX} cy={CY} r={R_SIGN} fill="none" stroke="rgba(201,168,76,0.2)" strokeWidth="0.5" />
          <circle cx={CX} cy={CY} r={R_SIGN_IN} fill="none" stroke="rgba(201,168,76,0.2)" strokeWidth="0.5" />

          {/* House cusps + numbers */}
          {houses.map((h, i) => {
            const angle = lonToAngle(h.cusp, ascLon);
            const lineEnd = polarToXY(CX, CY, R_SIGN_IN, angle);
            const lineStart = polarToXY(CX, CY, R_OUTER, angle);
            const numPos = polarToXY(CX, CY, R_HOUSE, angle - 15);
            const isAngle = [1, 4, 7, 10].includes(h.house);
            return (
              <g key={h.house}>
                <line
                  x1={lineStart.x} y1={lineStart.y}
                  x2={lineEnd.x} y2={lineEnd.y}
                  stroke={isAngle ? 'rgba(201,168,76,0.6)' : 'rgba(201,168,76,0.2)'}
                  strokeWidth={isAngle ? 1.5 : 0.8}
                />
                <text
                  x={numPos.x} y={numPos.y}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="10"
                  fill="rgba(240,236,228,0.35)"
                  fontFamily="DM Sans, sans-serif"
                >
                  {h.house}
                </text>
              </g>
            );
          })}

          {/* Sign symbols (every 30°, starting from 0° Aries) */}
          {SIGNS.map((sign, i) => {
            const signStartLon = i * 30; // ecliptic longitude of sign start
            const midLon = signStartLon + 15; // middle of sign
            const angle = lonToAngle(midLon, ascLon);
            const pos = polarToXY(CX, CY, (R_SIGN + R_SIGN_IN) / 2, angle);
            return (
              <text
                key={sign}
                x={pos.x} y={pos.y}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="13"
                fill="rgba(201,168,76,0.7)"
              >
                {SIGN_SYMBOLS[i]}
              </text>
            );
          })}

          {/* Inner circle */}
          <circle cx={CX} cy={CY} r={R_SIGN_IN - 10} fill="none" stroke="rgba(167,139,250,0.15)" strokeWidth="0.5" />

          {/* Planets */}
          {planetPositions.map(p => {
            const angle = lonToAngle(p.displayLon, ascLon);
            const pos = polarToXY(CX, CY, R_PLANET, angle);
            const dotPos = polarToXY(CX, CY, R_SIGN_IN - 12, angle);
            const isActive = activeplanet === p.name;
            const sym = PLANET_SYMBOLS[p.name] || p.name[0];
            return (
              <g
                key={p.name}
                style={{ cursor: 'pointer' }}
                onClick={() => setActivePlanet(isActive ? null : p.name)}
              >
                {/* Tick line from sign band to planet */}
                <line
                  x1={dotPos.x} y1={dotPos.y}
                  x2={polarToXY(CX, CY, R_SIGN_IN - 4, angle).x}
                  y2={polarToXY(CX, CY, R_SIGN_IN - 4, angle).y}
                  stroke="rgba(167,139,250,0.3)"
                  strokeWidth="0.7"
                />
                {/* Planet circle */}
                <circle
                  cx={pos.x} cy={pos.y}
                  r={isActive ? 13 : 11}
                  fill={isActive ? 'rgba(167,139,250,0.2)' : 'rgba(10,10,15,0.8)'}
                  stroke={isActive ? '#a78bfa' : 'rgba(167,139,250,0.5)'}
                  strokeWidth={isActive ? 1.5 : 1}
                />
                {/* Planet symbol */}
                <text
                  x={pos.x} y={pos.y}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={isActive ? '12' : '11'}
                  fill={p.retrograde ? '#a78bfa' : '#f0ece4'}
                  style={{ userSelect: 'none' }}
                >
                  {sym}
                </text>
                {/* Retrograde marker */}
                {p.retrograde && (
                  <text
                    x={pos.x + 9} y={pos.y - 7}
                    fontSize="7"
                    fill="#a78bfa"
                    fontFamily="DM Sans, sans-serif"
                  >
                    ℞
                  </text>
                )}
              </g>
            );
          })}

          {/* Center dot */}
          <circle cx={CX} cy={CY} r="3" fill="rgba(201,168,76,0.5)" />
        </svg>
      </motion.div>

      {/* Planet tooltip */}
      {activePlanetData && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: '1rem',
            padding: '1rem 1.25rem',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(167,139,250,0.3)',
            borderRadius: 8,
            backdropFilter: 'blur(12px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem', color: '#a78bfa' }}>
              {PLANET_SYMBOLS[activePlanetData.name] || activePlanetData.name[0]}
            </span>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
                {activePlanetData.name}
                {activePlanetData.retrograde && <span style={{ color: '#a78bfa', marginLeft: 6, fontSize: '0.85rem' }}>℞ 역행</span>}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {activePlanetData.sign} {activePlanetData.degree.toFixed(1)}° · {activePlanetData.house}하우스
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
