import { motion } from 'framer-motion';

const ASPECT_COLOR = {
  Trine: 'var(--violet)',
  Sextile: 'var(--violet)',
  Conjunction: 'var(--gold)',
  Square: 'var(--red)',
  Opposition: 'var(--red)',
};

const ASPECT_SYMBOL = {
  Conjunction: '☌',
  Opposition: '☍',
  Square: '□',
  Trine: '△',
  Sextile: '⚹',
};

export default function AspectGrid({ aspects }) {
  if (!aspects || aspects.length === 0) {
    return <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>어스펙트 데이터 없음</p>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
        <thead>
          <tr>
            {['행성 1', '어스펙트', '행성 2', '각도', 'Orb'].map(h => (
              <th key={h} style={{
                padding: '0.6rem 0.75rem',
                textAlign: 'left',
                color: 'var(--text-muted)',
                fontWeight: 400,
                fontSize: '0.75rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                borderBottom: '1px solid var(--border)',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {aspects.map((asp, i) => {
            const color = ASPECT_COLOR[asp.aspect] || 'var(--text-muted)';
            return (
              <motion.tr
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              >
                <td style={{ padding: '0.55rem 0.75rem', color: 'var(--text)' }}>{asp.planet1}</td>
                <td style={{ padding: '0.55rem 0.75rem' }}>
                  <span style={{
                    color,
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    fontWeight: 500,
                  }}>
                    <span style={{ fontSize: '1rem' }}>{ASPECT_SYMBOL[asp.aspect] ?? ''}</span>
                    <span style={{ fontSize: '0.8rem' }}>{asp.aspect}</span>
                  </span>
                </td>
                <td style={{ padding: '0.55rem 0.75rem', color: 'var(--text)' }}>{asp.planet2}</td>
                <td style={{ padding: '0.55rem 0.75rem', color: 'var(--text-muted)' }}>{asp.angle}°</td>
                <td style={{ padding: '0.55rem 0.75rem', color: 'var(--text-muted)' }}>
                  {(asp.orb ?? 0).toFixed(1)}°
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
