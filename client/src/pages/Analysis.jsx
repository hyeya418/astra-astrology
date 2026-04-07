import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import StarBackground from '../components/StarBackground';
import {
  LoadingSpinner,
  PersonaReport,
  EnergyReport,
  CareerReport,
  SynastryReport,
} from '../components/ReportCard';
import { useAnalysis, useSynastry } from '../hooks/useChart';

const TABS = [
  { id: 'persona', label: '가면 vs 속마음', icon: '◐' },
  { id: 'energy', label: '에너지 예보', icon: '⚡' },
  { id: 'career', label: '커리어', icon: '◈' },
  { id: 'synastry', label: '관계 레드플래그', icon: '♥' },
];

function SynastryForm({ onSubmit, loading }) {
  const [partner, setPartner] = useState({ date: '', time: '', location: '' });
  const [geoError, setGeoError] = useState('');

  async function geocode(query) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'ko' } });
    const results = await res.json();
    if (!results.length) throw new Error('위치를 찾을 수 없어요.');
    return { lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon) };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setGeoError('');
    if (!partner.date || !partner.time || !partner.location) {
      setGeoError('모든 항목을 입력해 주세요.');
      return;
    }
    let geo;
    try {
      geo = await geocode(partner.location);
    } catch (err) {
      setGeoError(err.message);
      return;
    }
    const [year, month, day] = partner.date.split('-').map(Number);
    const [hour, minute] = partner.time.split(':').map(Number);
    const timezone = Math.round(geo.lon / 15);
    onSubmit({ year, month, day, hour, minute, second: 0, lat: geo.lat, lon: geo.lon, timezone });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
      style={{ padding: 'clamp(1.5rem, 5vw, 2rem)', maxWidth: 480, margin: '0 auto' }}
    >
      <h3 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '1.3rem',
        marginBottom: '0.5rem',
        color: 'var(--gold)',
      }}>
        상대방 정보 입력
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        상대방의 출생 정보를 입력하면 궁합을 분석해 드려요
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.4rem' }}>
            생년월일
          </label>
          <input
            type="date"
            value={partner.date}
            onChange={e => setPartner(p => ({ ...p, date: e.target.value }))}
            style={{ colorScheme: 'dark' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.4rem' }}>
            출생 시간
          </label>
          <input
            type="time"
            value={partner.time}
            onChange={e => setPartner(p => ({ ...p, time: e.target.value }))}
            style={{ colorScheme: 'dark' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.4rem' }}>
            출생지
          </label>
          <input
            type="text"
            placeholder="예: 서울특별시"
            value={partner.location}
            onChange={e => setPartner(p => ({ ...p, location: e.target.value }))}
          />
        </div>

        {geoError && (
          <div style={{
            padding: '0.75rem 1rem',
            background: 'rgba(248,113,113,0.08)',
            border: '1px solid rgba(248,113,113,0.3)',
            borderRadius: 8,
            color: 'var(--red)',
            fontSize: '0.875rem',
          }}>
            {geoError}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-gold"
          disabled={loading}
          style={{ marginTop: '0.25rem', padding: '0.85rem' }}
        >
          {loading ? '분석 중...' : '궁합 분석하기'}
        </button>
      </form>
    </motion.div>
  );
}

function ErrorBox({ message }) {
  return (
    <div style={{
      padding: '1rem 1.25rem',
      background: 'rgba(248,113,113,0.08)',
      border: '1px solid rgba(248,113,113,0.3)',
      borderRadius: 8,
      color: 'var(--red)',
      fontSize: '0.875rem',
      textAlign: 'center',
      maxWidth: 480,
      margin: '2rem auto',
    }}>
      {message}
    </div>
  );
}

export default function Analysis() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('formData');
    if (!stored) { navigate('/input'); return; }
    setFormData(JSON.parse(stored));
  }, []);

  const persona = useAnalysis('persona');
  const energy = useAnalysis('energy');
  const career = useAnalysis('career');
  const synastry = useSynastry();

  // Auto-fetch persona/energy/career when formData is ready
  useEffect(() => {
    if (!formData) return;
    persona.fetch(formData);
    energy.fetch(formData);
    career.fetch(formData);
  }, [formData]);

  function handleSynastrySubmit(partnerData) {
    synastry.fetch(formData, partnerData);
  }

  if (!formData) return null;

  const tabId = TABS[activeTab].id;

  return (
    <div style={{ minHeight: '100dvh', position: 'relative', padding: '0 0 4rem' }}>
      <StarBackground />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          position: 'sticky', top: 0, zIndex: 10,
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backdropFilter: 'blur(12px)',
          background: 'rgba(10,10,15,0.8)',
        }}
      >
        <button
          onClick={() => navigate('/chart')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.8rem' }}
        >
          ← 차트로
        </button>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', letterSpacing: '0.15em' }}>
          AI 분석
        </span>
        <div style={{ width: 60 }} />
      </motion.div>

      <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: '1.5rem' }}>

        {/* Tabs — scrollable on mobile */}
        <div style={{
          display: 'flex',
          gap: '0.25rem',
          marginBottom: '2rem',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '0.25rem',
          overflowX: 'auto',
        }}>
          {TABS.map((tab, i) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(i)}
              style={{
                flex: '1 0 auto',
                minWidth: 80,
                padding: '0.6rem 0.75rem',
                background: activeTab === i ? 'rgba(201,168,76,0.12)' : 'transparent',
                border: activeTab === i ? '1px solid rgba(201,168,76,0.3)' : '1px solid transparent',
                borderRadius: 6,
                color: activeTab === i ? 'var(--gold)' : 'var(--text-muted)',
                fontSize: '0.78rem',
                letterSpacing: '0.04em',
                cursor: 'pointer',
                transition: 'all var(--transition)',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ marginRight: '0.3rem' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tabId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {tabId === 'persona' && (
              persona.loading ? <LoadingSpinner /> :
              persona.error ? <ErrorBox message={persona.error} /> :
              persona.data ? <PersonaReport data={persona.data} /> :
              null
            )}

            {tabId === 'energy' && (
              energy.loading ? <LoadingSpinner /> :
              energy.error ? <ErrorBox message={energy.error} /> :
              energy.data ? <EnergyReport data={energy.data} /> :
              null
            )}

            {tabId === 'career' && (
              career.loading ? <LoadingSpinner /> :
              career.error ? <ErrorBox message={career.error} /> :
              career.data ? <CareerReport data={career.data} /> :
              null
            )}

            {tabId === 'synastry' && (
              synastry.loading ? <LoadingSpinner /> :
              synastry.error ? (
                <>
                  <ErrorBox message={synastry.error} />
                  <SynastryForm onSubmit={handleSynastrySubmit} loading={false} />
                </>
              ) :
              synastry.data ? (
                <>
                  <SynastryReport data={synastry.data} />
                  <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <button
                      className="btn btn-outline"
                      style={{ fontSize: '0.8rem' }}
                      onClick={() => synastry.fetch(null, null)}
                    >
                      다른 사람 분석하기
                    </button>
                  </div>
                </>
              ) :
              <SynastryForm onSubmit={handleSynastrySubmit} loading={synastry.loading} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
