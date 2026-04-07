import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import StarBackground from '../components/StarBackground';
import ChartWheel from '../components/ChartWheel';
import PlanetCard from '../components/PlanetCard';
import AspectGrid from '../components/AspectGrid';

const TABS = ['차트 휠', '행성', '어스펙트'];

export default function ChartResult() {
  const navigate = useNavigate();
  const [chart, setChart] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const stored = sessionStorage.getItem('chartData');
    if (!stored) { navigate('/input'); return; }
    setChart(JSON.parse(stored));
  }, []);

  if (!chart) return null;

  return (
    <div style={{ minHeight: '100dvh', position: 'relative', padding: '0 0 4rem' }}>
      <StarBackground />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          position: 'relative', zIndex: 1,
          padding: '1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backdropFilter: 'blur(12px)',
          background: 'rgba(10,10,15,0.6)',
        }}
      >
        <button
          onClick={() => navigate('/input')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.8rem' }}
        >
          ← 다시 입력
        </button>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', letterSpacing: '0.15em' }}>
          ASTRA
        </span>
        <button
          className="btn btn-outline"
          style={{ fontSize: '0.75rem', padding: '0.5rem 1.25rem' }}
          onClick={() => navigate('/analysis')}
        >
          AI 분석 →
        </button>
      </motion.div>

      <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: '2rem' }}>
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '2rem', textAlign: 'center' }}
        >
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 5vw, 2.4rem)', marginBottom: '0.4rem' }}>
            나탈 차트
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {chart.meta?.input && `${chart.meta.input.year}.${String(chart.meta.input.month).padStart(2,'0')}.${String(chart.meta.input.day).padStart(2,'0')} ${String(chart.meta.input.hour).padStart(2,'0')}:${String(chart.meta.input.minute).padStart(2,'0')}`}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            {chart.angles?.ascendant && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                ASC <span style={{ color: 'var(--gold)' }}>{chart.angles.ascendant.sign}</span>
              </span>
            )}
            {chart.angles?.mc && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                MC <span style={{ color: 'var(--gold)' }}>{chart.angles.mc.sign}</span>
              </span>
            )}
            {chart.planets?.find(p => p.name === 'Sun') && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                ☉ <span style={{ color: 'var(--gold)' }}>{chart.planets.find(p => p.name === 'Sun').sign}</span>
              </span>
            )}
            {chart.planets?.find(p => p.name === 'Moon') && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                ☽ <span style={{ color: 'var(--violet)' }}>{chart.planets.find(p => p.name === 'Moon').sign}</span>
              </span>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.25rem',
          marginBottom: '2rem',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '0.25rem',
        }}>
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              style={{
                flex: 1,
                padding: '0.6rem 0.5rem',
                background: activeTab === i ? 'rgba(201,168,76,0.12)' : 'transparent',
                border: activeTab === i ? '1px solid rgba(201,168,76,0.3)' : '1px solid transparent',
                borderRadius: 6,
                color: activeTab === i ? 'var(--gold)' : 'var(--text-muted)',
                fontSize: '0.8rem',
                letterSpacing: '0.06em',
                cursor: 'pointer',
                transition: 'all var(--transition)',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 0 && (
            <div style={{ maxWidth: 500, margin: '0 auto' }}>
              <ChartWheel chart={chart} />
            </div>
          )}

          {activeTab === 1 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '0.75rem',
            }}>
              {chart.planets?.map((planet, i) => (
                <PlanetCard key={planet.name} planet={planet} index={i} />
              ))}
            </div>
          )}

          {activeTab === 2 && (
            <div className="card" style={{ padding: '0.5rem 0' }}>
              <AspectGrid aspects={chart.aspects} />
            </div>
          )}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ textAlign: 'center', marginTop: '3rem' }}
        >
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            AI가 이 차트를 심층 분석해 드려요
          </p>
          <button className="btn btn-gold" onClick={() => navigate('/analysis')}>
            AI 분석 보기
          </button>
        </motion.div>
      </div>
    </div>
  );
}
