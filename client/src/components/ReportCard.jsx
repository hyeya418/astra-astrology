import { motion } from 'framer-motion';

function getAdviceLabel(key) {
  if (key === 'do') return '\uD558\uBA74 \uC88B\uC740 \uAC83';
  if (key === 'dont') return '\uD53C\uD558\uBA74 \uC88B\uC740 \uAC83';
  return key;
}

// Loading spinner
export function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '3rem' }}>
      <svg
        width="48" height="48" viewBox="0 0 48 48"
        style={{ animation: 'spin-slow 2.5s linear infinite' }}
      >
        <polygon
          points="24,4 28,18 42,18 31,27 35,42 24,33 13,42 17,27 6,18 20,18"
          fill="none"
          stroke="var(--gold)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', letterSpacing: '0.1em' }}>
        별자리를 읽는 중...
      </span>
    </div>
  );
}

function renderContent(content) {
  if (content == null) return null;

  if (typeof content === 'string' || typeof content === 'number') {
    return (
      <p style={{
        color: 'var(--text)',
        lineHeight: 1.75,
        fontSize: '0.95rem',
      }}>
        {content}
      </p>
    );
  }

  if (Array.isArray(content)) {
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {content.map((item, index) => (
          <li
            key={index}
            style={{
              color: 'var(--text)',
              lineHeight: 1.7,
              fontSize: '0.95rem',
              paddingLeft: '1rem',
              position: 'relative',
            }}
          >
            <span style={{ position: 'absolute', left: 0, color: 'var(--gold)' }}>{'\u2022'}</span>
            {String(item)}
          </li>
        ))}
      </ul>
    );
  }

  if (typeof content === 'object') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {Object.entries(content).map(([key, value]) => (
          <div key={key}>
            <div style={{
              fontSize: '0.78rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: '0.45rem',
            }}>
              {getAdviceLabel(key)}
            </div>
            {renderContent(value)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <p style={{
      color: 'var(--text)',
      lineHeight: 1.75,
      fontSize: '0.95rem',
    }}>
      {String(content)}
    </p>
  );
}

function Section({ label, content, accent }) {
  if (!content) return null;
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{
        fontSize: '0.7rem',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: accent ?? 'var(--gold)',
        marginBottom: '0.5rem',
        fontFamily: 'var(--font-body)',
      }}>
        {label}
      </div>
      {renderContent(content)}
    </div>
  );
}

// Persona report
export function PersonaReport({ data }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: '2rem' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', marginBottom: '1.75rem', color: 'var(--gold)' }}>
        {data.title}
      </h2>
      <Section label="사회적 가면" content={data.mask} />
      <Section label="내면의 속마음" content={data.inner} accent="var(--violet)" />
      <Section label="간극과 방어기제" content={data.gap} />
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem 1.25rem',
        background: 'rgba(201,168,76,0.06)',
        border: '1px solid rgba(201,168,76,0.2)',
        borderRadius: 8,
        color: 'var(--gold)',
        fontFamily: 'var(--font-display)',
        fontSize: '1.05rem',
        fontStyle: 'italic',
      }}>
        "{data.advice}"
      </div>
    </motion.div>
  );
}

// Energy report
export function EnergyReport({ data }) {
  const levelColor = {
    high: '#4ade80',
    medium: 'var(--gold)',
    low: 'var(--violet)',
    chaos: 'var(--red)',
  }[data.level] ?? 'var(--text)';

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--gold)' }}>
            {data.title}
          </h2>
          <span style={{
            display: 'inline-block', marginTop: '0.4rem',
            padding: '2px 10px',
            border: `1px solid ${levelColor}`,
            borderRadius: 20,
            color: levelColor,
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            {data.level}
          </span>
        </div>
      </div>
      <div style={{
        padding: '1rem 1.25rem',
        background: 'rgba(167,139,250,0.06)',
        border: '1px solid rgba(167,139,250,0.2)',
        borderRadius: 8,
        marginBottom: '1.5rem',
        fontFamily: 'var(--font-display)',
        fontSize: '1.1rem',
        color: 'var(--violet)',
        fontStyle: 'italic',
      }}>
        {data.summary}
      </div>
      <Section label="오늘의 에너지 분석" content={data.detail} />
      <Section label="오늘의 가이드" content={data.advice} accent="var(--violet)" />
    </motion.div>
  );
}

// Career report
export function CareerReport({ data }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: '2rem' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', marginBottom: '1.75rem', color: 'var(--gold)' }}>
        {data.title}
      </h2>
      <Section label="타고난 강점" content={data.strengths} />
      <Section label="일하는 방식" content={data.workStyle} accent="var(--violet)" />
      <Section label="최적 직군" content={data.bestRole} />
      <Section label="피해야 할 방향 ⚠️" content={data.warning} accent="var(--red)" />
      <Section label="장기 성장 방향" content={data.longterm} accent="var(--violet)" />
    </motion.div>
  );
}

// Synastry report
export function SynastryReport({ data }) {
  const score = Number(data.compatibility) || 0;
  const scoreColor = score >= 70 ? '#4ade80' : score >= 40 ? 'var(--gold)' : 'var(--red)';

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--gold)' }}>
          {data.title}
        </h2>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', color: scoreColor, lineHeight: 1 }}>
            {score}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>SCORE</div>
        </div>
      </div>

      {data.redFlags?.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '0.75rem' }}>
            🚩 레드플래그
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {data.redFlags.map((flag, i) => (
              <li key={i} style={{
                padding: '0.6rem 0.9rem',
                background: 'rgba(248,113,113,0.06)',
                border: '1px solid rgba(248,113,113,0.2)',
                borderRadius: 6,
                color: 'var(--text)',
                fontSize: '0.9rem',
              }}>
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.greenFlags?.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#4ade80', marginBottom: '0.75rem' }}>
            ✅ 그린플래그
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {data.greenFlags.map((flag, i) => (
              <li key={i} style={{
                padding: '0.6rem 0.9rem',
                background: 'rgba(74,222,128,0.06)',
                border: '1px solid rgba(74,222,128,0.2)',
                borderRadius: 6,
                color: 'var(--text)',
                fontSize: '0.9rem',
              }}>
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{
        padding: '1rem 1.25rem',
        background: 'rgba(201,168,76,0.06)',
        border: '1px solid rgba(201,168,76,0.25)',
        borderRadius: 8,
        fontFamily: 'var(--font-display)',
        fontSize: '1.1rem',
        color: 'var(--gold)',
        fontStyle: 'italic',
      }}>
        최종 판정: {data.verdict}
      </div>
    </motion.div>
  );
}
