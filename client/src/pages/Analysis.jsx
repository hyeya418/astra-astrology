import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import StarBackground from '../components/StarBackground';
import { LoadingSpinner } from '../components/ReportCard';
import { getFortuneAnalysis, getSynastryAnalysis } from '../api/chartApi';

const SECTIONS = [
  { key: '총운',         icon: '✦', accent: 'var(--gold)' },
  { key: '금전운',       icon: '◈', accent: '#4ade80' },
  { key: '직업운',       icon: '⬡', accent: 'var(--violet)' },
  { key: '연애결혼운',   icon: '♥', accent: '#f472b6' },
  { key: '건강운',       icon: '◉', accent: '#38bdf8' },
  { key: '인간관계가족운', icon: '⬟', accent: '#fb923c' },
  { key: '대운',         icon: '★', accent: 'var(--gold)' },
];

function FortuneSection({ section, data, index }) {
  const [open, setOpen] = useState(index === 0);
  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      style={{
        borderRadius: 12,
        border: `1px solid ${open ? section.accent + '44' : 'var(--border)'}`,
        background: open ? `${section.accent}08` : 'rgba(255,255,255,0.02)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        marginBottom: '0.75rem',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.1rem 1.25rem',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.1rem', color: section.accent }}>{section.icon}</span>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.1rem',
            color: 'var(--text)',
            letterSpacing: '0.04em',
          }}>
            {section.key}
          </span>
          {data.keyword && (
            <span style={{
              fontSize: '0.7rem',
              padding: '2px 8px',
              borderRadius: 20,
              border: `1px solid ${section.accent}55`,
              color: section.accent,
              letterSpacing: '0.06em',
            }}>
              {data.keyword}
            </span>
          )}
        </div>
        <span style={{
          color: 'var(--text-muted)',
          fontSize: '0.8rem',
          transition: 'transform 0.3s',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          display: 'inline-block',
        }}>
          ▾
        </span>
      </button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 1.25rem 1.25rem' }}>
              <p style={{
                color: 'var(--text)',
                lineHeight: 1.85,
                fontSize: '0.93rem',
                marginBottom: data.advice ? '1rem' : 0,
              }}>
                {data.content}
              </p>
              {data.advice && (
                <div style={{
                  padding: '0.7rem 1rem',
                  background: `${section.accent}0f`,
                  border: `1px solid ${section.accent}33`,
                  borderRadius: 8,
                  color: section.accent,
                  fontSize: '0.875rem',
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                }}>
                  {data.advice}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

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
    try { geo = await geocode(partner.location); }
    catch (err) { setGeoError(err.message); return; }
    const [year, month, day] = partner.date.split('-').map(Number);
    const [hour, minute] = partner.time.split(':').map(Number);
    onSubmit({ year, month, day, hour, minute, second: 0, lat: geo.lat, lon: geo.lon, timezone: Math.round(geo.lon / 15) });
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="card" style={{ padding: 'clamp(1.5rem,5vw,2rem)', maxWidth: 480, margin: '0 auto' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#f472b6', marginBottom: '0.4rem' }}>
        ♥ 궁합 분석
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        상대방 출생 정보를 입력하면 두 사람의 궁합을 분석해드려요
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {[
          { label: '생년월일', key: 'date', type: 'date' },
          { label: '출생 시간', key: 'time', type: 'time' },
          { label: '출생지', key: 'location', type: 'text', placeholder: '예: 서울특별시' },
        ].map(({ label, key, type, placeholder }) => (
          <div key={key}>
            <label style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#f472b6', marginBottom: '0.4rem' }}>
              {label}
            </label>
            <input type={type} value={partner[key]} placeholder={placeholder}
              onChange={e => setPartner(p => ({ ...p, [key]: e.target.value }))}
              style={{ colorScheme: 'dark' }} />
          </div>
        ))}
        {geoError && (
          <div style={{ padding: '0.7rem 1rem', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, color: 'var(--red)', fontSize: '0.875rem' }}>
            {geoError}
          </div>
        )}
        <button type="submit" className="btn btn-gold" disabled={loading} style={{ padding: '0.85rem', marginTop: '0.25rem' }}>
          {loading ? '분석 중...' : '궁합 분석하기'}
        </button>
      </form>
    </motion.div>
  );
}

function SynastryResult({ data, onReset }) {
  const score = Number(data.compatibility) || 0;
  const scoreColor = score >= 70 ? '#4ade80' : score >= 40 ? 'var(--gold)' : 'var(--red)';

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: '#f472b6' }}>
          ♥ 궁합 분석 결과
        </h2>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', color: scoreColor, lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>SCORE</div>
        </div>
      </div>
      {data.redFlags?.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '0.6rem' }}>🚩 주의할 점</div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {data.redFlags.map((f, i) => (
              <li key={i} style={{ padding: '0.55rem 0.9rem', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 6, color: 'var(--text)', fontSize: '0.88rem' }}>{f}</li>
            ))}
          </ul>
        </div>
      )}
      {data.greenFlags?.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#4ade80', marginBottom: '0.6rem' }}>✅ 좋은 점</div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {data.greenFlags.map((f, i) => (
              <li key={i} style={{ padding: '0.55rem 0.9rem', background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 6, color: 'var(--text)', fontSize: '0.88rem' }}>{f}</li>
            ))}
          </ul>
        </div>
      )}
      <div style={{ padding: '1rem 1.25rem', background: 'rgba(244,114,182,0.06)', border: '1px solid rgba(244,114,182,0.25)', borderRadius: 8, fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: '#f472b6', fontStyle: 'italic', marginBottom: '1.25rem' }}>
        {data.verdict}
      </div>
      <button className="btn btn-outline" style={{ fontSize: '0.8rem' }} onClick={onReset}>다른 사람과 분석하기</button>
    </motion.div>
  );
}

export default function Analysis() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);

  // Fortune state
  const [fortune, setFortune] = useState(null);
  const [fortuneLoading, setFortuneLoading] = useState(false);
  const [fortuneError, setFortuneError] = useState(null);

  // Synastry state
  const [synastry, setSynastry] = useState(null);
  const [synastryLoading, setSynastryLoading] = useState(false);
  const [synastryError, setSynastryError] = useState(null);

  const [activeTab, setActiveTab] = useState('fortune'); // 'fortune' | 'synastry'

  useEffect(() => {
    const stored = sessionStorage.getItem('formData');
    if (!stored) { navigate('/input'); return; }
    const fd = JSON.parse(stored);
    setFormData(fd);
    fetchFortune(fd);
  }, []);

  async function fetchFortune(fd) {
    setFortuneLoading(true);
    setFortuneError(null);
    try {
      const result = await getFortuneAnalysis(fd);
      setFortune(result);
    } catch (err) {
      setFortuneError(err.message);
    } finally {
      setFortuneLoading(false);
    }
  }

  async function handleSynastrySubmit(partnerData) {
    setSynastryLoading(true);
    setSynastryError(null);
    try {
      const result = await getSynastryAnalysis(formData, partnerData);
      setSynastry(result);
    } catch (err) {
      setSynastryError(err.message);
    } finally {
      setSynastryLoading(false);
    }
  }

  if (!formData) return null;

  return (
    <div style={{ minHeight: '100dvh', position: 'relative', paddingBottom: '4rem' }}>
      <StarBackground />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          position: 'sticky', top: 0, zIndex: 10,
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          backdropFilter: 'blur(12px)',
          background: 'rgba(10,10,15,0.85)',
        }}
      >
        <button onClick={() => navigate('/chart')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          ← 차트로
        </button>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', letterSpacing: '0.15em' }}>AI 운세 리포트</span>
        <div style={{ width: 60 }} />
      </motion.div>

      <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: '1.5rem' }}>

        {/* Tab switcher */}
        <div style={{
          display: 'flex', gap: '0.25rem', marginBottom: '1.75rem',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border)',
          borderRadius: 8, padding: '0.25rem',
        }}>
          {[
            { id: 'fortune', label: '✦ 운세 리포트' },
            { id: 'synastry', label: '♥ 궁합 분석' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1,
              padding: '0.65rem',
              background: activeTab === tab.id ? 'rgba(201,168,76,0.12)' : 'transparent',
              border: activeTab === tab.id ? '1px solid rgba(201,168,76,0.3)' : '1px solid transparent',
              borderRadius: 6,
              color: activeTab === tab.id ? 'var(--gold)' : 'var(--text-muted)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all var(--transition)',
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'fortune' && (
            <motion.div key="fortune"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {fortuneLoading && <LoadingSpinner />}
              {fortuneError && (
                <div style={{ padding: '1rem', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, color: 'var(--red)', textAlign: 'center', marginBottom: '1rem' }}>
                  {fortuneError}
                  <br />
                  <button className="btn btn-outline" style={{ marginTop: '0.75rem', fontSize: '0.8rem' }} onClick={() => fetchFortune(formData)}>
                    다시 시도
                  </button>
                </div>
              )}
              {fortune && SECTIONS.map((s, i) => (
                <FortuneSection key={s.key} section={s} data={fortune[s.key]} index={i} />
              ))}
            </motion.div>
          )}

          {activeTab === 'synastry' && (
            <motion.div key="synastry"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {synastryLoading && <LoadingSpinner />}
              {synastryError && (
                <div style={{ padding: '1rem', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, color: 'var(--red)', textAlign: 'center', marginBottom: '1rem' }}>
                  {synastryError}
                </div>
              )}
              {!synastryLoading && !synastry && <SynastryForm onSubmit={handleSynastrySubmit} loading={synastryLoading} />}
              {synastry && <SynastryResult data={synastry} onReset={() => setSynastry(null)} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
