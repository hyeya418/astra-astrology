import { motion } from 'framer-motion';

const PLANET_SYMBOLS = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  NorthNode: '☊', Lilith: '⚸', Chiron: '⚷',
};

const PLANET_KO = {
  Sun: '태양', Moon: '달', Mercury: '수성', Venus: '금성', Mars: '화성',
  Jupiter: '목성', Saturn: '토성', Uranus: '천왕성', Neptune: '해왕성',
  Pluto: '명왕성', NorthNode: '노스노드', Lilith: '릴리스', Chiron: '카이론',
};

export default function PlanetCard({ planet, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="card"
      style={{
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        transition: 'background var(--transition)',
      }}
      whileHover={{ background: 'rgba(255,255,255,0.07)' }}
    >
      <div style={{
        width: 40, height: 40,
        borderRadius: '50%',
        background: 'rgba(167,139,250,0.1)',
        border: '1px solid rgba(167,139,250,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.25rem',
        flexShrink: 0,
        color: planet.retrograde ? '#a78bfa' : '#f0ece4',
      }}>
        {PLANET_SYMBOLS[planet.name] ?? planet.name[0]}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          fontFamily: 'var(--font-display)', fontSize: '1rem',
        }}>
          <span>{planet.name}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            {PLANET_KO[planet.name]}
          </span>
          {planet.retrograde && (
            <span style={{
              fontSize: '0.7rem', color: '#a78bfa',
              border: '1px solid rgba(167,139,250,0.4)',
              borderRadius: 4, padding: '1px 5px',
              letterSpacing: '0.05em',
            }}>
              ℞ 역행
            </span>
          )}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          {planet.sign} {planet.degree.toFixed(1)}°
          <span style={{
            marginLeft: '0.75rem',
            color: 'rgba(201,168,76,0.7)',
            fontSize: '0.8rem',
          }}>
            {planet.house}하우스
          </span>
        </div>
      </div>
    </motion.div>
  );
}
