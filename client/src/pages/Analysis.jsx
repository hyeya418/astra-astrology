import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import StarBackground from '../components/StarBackground';
import { LoadingSpinner } from '../components/ReportCard';
import { getFortuneAnalysis, getSynastryAnalysis } from '../api/chartApi';

const SECTIONS = [
  { key: '인생변곡점', icon: '◉', accent: 'var(--gold)', label: '내 인생의 큰 파도' },
  { key: '10년흐름', icon: '◎', accent: 'var(--violet)', label: '나의 10년 인생 지도' },
  { key: '직업재능', icon: '✦', accent: '#38bdf8', label: '내가 빛나는 자리' },
  { key: '조심할시기', icon: '☁', accent: '#fb923c', label: '마음 일기예보' },
  { key: '금전흐름', icon: '◈', accent: '#4ade80', label: '차곡차곡 재물운' },
  { key: '연애흐름', icon: '♥', accent: '#f472b6', label: '사랑이 머무는 계절' },
  { key: '월별예측', icon: '◷', accent: 'var(--gold)', label: '2026년 가이드' },
];

function ShareButton({ section, data }) {
  const [copied, setCopied] = useState(false);

  function handleShare() {
    const text = `🌌 ASTRA 인생 분석\n\n${section.icon} ${section.label}\n"${data.title}"\n\n${data.content}${data.advice ? `\n\n💡 ${data.advice}` : ''}\n\n✨ astra-astrology-rust.vercel.app`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={(e) => { e.stopPropagation(); handleShare(); }}
      title="클립보드에 복사"
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: copied ? section.accent : 'var(--text-muted)',
        fontSize: '0.85rem', padding: '0.25rem 0.4rem',
        borderRadius: 6,
        transition: 'color 0.2s',
        flexShrink: 0,
      }}
    >
      {copied ? '✓' : '⎘'}
    </button>
  );
}

function FortuneSection({ section, data, index }) {
  const [open, setOpen] = useState(index === 0);
  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      style={{
        borderRadius: 12,
        border: `1px solid ${open ? `${section.accent}55` : 'var(--border)'}`,
        background: open ? `${section.accent}10` : 'rgba(255,255,255,0.02)',
        overflow: 'hidden',
        marginBottom: '0.85rem',
      }}
    >
      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: '100%',
          padding: '1.1rem 1.25rem',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          textAlign: 'left',
          gap: '1rem',
          color: 'var(--text)',
        }}
      >
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start', flex: 1 }}>
          <span style={{ color: section.accent, fontSize: '1.15rem', lineHeight: 1.2 }}>{section.icon}</span>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ color: section.accent, fontSize: '0.78rem', letterSpacing: '0.1em' }}>{section.label || section.key}</span>
              {data.keyword && (
                <span style={{
                  padding: '2px 8px',
                  borderRadius: 999,
                  border: `1px solid ${section.accent}55`,
                  color: section.accent,
                  fontSize: '0.78rem',
                }}>
                  {data.keyword}
                </span>
              )}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginTop: '0.15rem', color: 'var(--text)' }}>
              {data.title}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
          <ShareButton section={section} data={data} />
          <span style={{ color: 'var(--text-muted)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>⌄</span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 1.25rem 1.25rem' }}>
              <p style={{ lineHeight: 1.9, fontSize: '1rem', color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
                {data.content}
              </p>
              {data.advice && (
                <div style={{
                  marginTop: '1rem',
                  padding: '0.95rem 1.05rem',
                  borderRadius: 10,
                  background: `${section.accent}12`,
                  border: `1px solid ${section.accent}35`,
                  color: 'var(--text)',
                  fontStyle: 'italic',
                  boxShadow: `inset 3px 0 0 ${section.accent}`,
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
  const [partner, setPartner] = useState({ name: '', date: '', time: '', location: '' });
  const [geoError, setGeoError] = useState('');

  async function geocode(query) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'ko' } });
    const results = await res.json();
    if (!results.length) throw new Error('위치를 찾을 수 없어요. 다시 시도해주세요.');
    return { lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon) };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setGeoError('');

    if (!partner.name || !partner.date || !partner.time || !partner.location) {
      setGeoError('모든 항목을 입력해주세요.');
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

    onSubmit({
      name: partner.name.trim(),
      year,
      month,
      day,
      hour,
      minute,
      second: 0,
      lat: geo.lat,
      lon: geo.lon,
      timezone: Math.round(geo.lon / 15),
    });
  }

  const fields = [
    { label: '이름', key: 'name', type: 'text'},
    { label: '생년월일', key: 'date', type: 'date' },
    { label: '출생 시간', key: 'time', type: 'time' },
    { label: '출생지', key: 'location', type: 'text', placeholder: '예: 서울 강남구' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 'clamp(1.5rem,5vw,2rem)', maxWidth: 480, margin: '0 auto' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: '#f472b6', marginBottom: '0.35rem' }}>
        궁합 분석
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        상대방 정보를 입력하면 두 사람의 기본 관계 패턴을 분석해드려요.
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {fields.map(({ label, key, type, placeholder }) => (
          <div key={key}>
            <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.12em', color: '#f472b6', marginBottom: '0.4rem' }}>
              {label}
            </label>
            <input
              type={type}
              value={partner[key]}
              placeholder={placeholder}
              onChange={(e) => setPartner((prev) => ({ ...prev, [key]: e.target.value }))}
              style={{ colorScheme: 'dark' }}
              required
            />
          </div>
        ))}
        {geoError && (
          <div style={{ padding: '0.8rem 1rem', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, color: 'var(--red)', fontSize: '0.875rem' }}>
            {geoError}
          </div>
        )}
        <button type="submit" className="btn btn-gold" disabled={loading} style={{ padding: '0.9rem', marginTop: '0.25rem' }}>
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: '#f472b6' }}>궁합 분석 결과</h2>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.4rem', color: scoreColor, lineHeight: 1, fontFamily: 'var(--font-display)' }}>{score}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>SCORE</div>
        </div>
      </div>

      {data.redFlags?.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ color: 'var(--red)', fontSize: '0.76rem', letterSpacing: '0.12em', marginBottom: '0.55rem' }}>조심할 점</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.5rem' }}>
            {data.redFlags.map((item, index) => (
              <li key={index} style={{ padding: '0.7rem 0.9rem', borderRadius: 8, background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)' }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.greenFlags?.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ color: '#4ade80', fontSize: '0.76rem', letterSpacing: '0.12em', marginBottom: '0.55rem' }}>좋은 점</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.5rem' }}>
            {data.greenFlags.map((item, index) => (
              <li key={index} style={{ padding: '0.7rem 0.9rem', borderRadius: 8, background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)' }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ padding: '1rem 1.1rem', borderRadius: 10, background: 'rgba(244,114,182,0.08)', border: '1px solid rgba(244,114,182,0.25)', color: '#f472b6', fontStyle: 'italic', marginBottom: '1rem' }}>
        {data.verdict}
      </div>

      <button className="btn btn-outline" onClick={onReset}>다른 사람과 다시 분석하기</button>
    </motion.div>
  );
}

export default function Analysis() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [fortune, setFortune] = useState(null);
  const [fortuneLoading, setFortuneLoading] = useState(false);
  const [fortuneError, setFortuneError] = useState(null);
  const [synastry, setSynastry] = useState(null);
  const [synastryLoading, setSynastryLoading] = useState(false);
  const [synastryError, setSynastryError] = useState(null);
  const [activeTab, setActiveTab] = useState('fortune');

  useEffect(() => {
    const stored = sessionStorage.getItem('formData');
    if (!stored) {
      navigate('/input');
      return;
    }

    const fd = JSON.parse(stored);
    setFormData(fd);

    // Older fortune results were cached in sessionStorage and could mask prompt changes.
    Object.keys(sessionStorage)
      .filter((key) => key.startsWith('fortune_'))
      .forEach((key) => sessionStorage.removeItem(key));

    fetchFortune(fd);
  }, [navigate]);

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

      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backdropFilter: 'blur(12px)',
          background: 'rgba(10,10,15,0.85)',
        }}
      >
        <button onClick={() => navigate('/chart')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>
          차트로
        </button>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', letterSpacing: '0.12em' }}>인생 데이터 분석</span>
        <div style={{ width: 56 }} />
      </motion.div>

      <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.25rem' }}>
          {[
            { id: 'fortune', label: '인생 분석' },
            { id: 'synastry', label: '궁합 분석' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '0.7rem',
                borderRadius: 6,
                border: activeTab === tab.id ? '1px solid rgba(201,168,76,0.3)' : '1px solid transparent',
                background: activeTab === tab.id ? 'rgba(201,168,76,0.12)' : 'transparent',
                color: activeTab === tab.id ? 'var(--gold)' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'fortune' && (
            <motion.div key="fortune" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              {fortuneLoading && <LoadingSpinner />}
              {fortuneError && (
                <div style={{ padding: '1rem', borderRadius: 8, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--red)', textAlign: 'center', marginBottom: '1rem' }}>
                  {fortuneError}
                  <br />
                  <button
                    className="btn btn-outline"
                    style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}
                    onClick={() => fetchFortune(formData)}
                  >
                    다시 시도
                  </button>
                </div>
              )}
              {fortune && (
                <>
                  {SECTIONS.map((section, index) => (
                    <FortuneSection key={section.key} section={section} data={fortune[section.key]} index={index} />
                  ))}
                  <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingBottom: '0.5rem' }}>
                    <button
                      className="btn btn-outline"
                      style={{ fontSize: '0.8rem', opacity: 0.6 }}
                      onClick={() => { setFortune(null); fetchFortune(formData); }}
                      disabled={fortuneLoading}
                    >
                      ↺ 다시 분석하기
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'synastry' && (
            <motion.div key="synastry" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              {synastryLoading && <LoadingSpinner />}
              {synastryError && (
                <div style={{ padding: '1rem', borderRadius: 8, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--red)', textAlign: 'center', marginBottom: '1rem' }}>
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
