import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import StarBackground from '../components/StarBackground';
import { useChart } from '../hooks/useChart';

async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'ko' } });
  const results = await res.json();
  if (!results.length) throw new Error('위치를 찾을 수 없어요. 다시 시도해주세요.');
  return { lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon) };
}

function lonToTimezone(lon) {
  return Math.round(lon / 15);
}

function Label({ children }) {
  return (
    <label style={{
      display: 'block',
      fontSize: '0.7rem',
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: 'var(--gold)',
      marginBottom: '0.4rem',
      fontFamily: 'var(--font-body)',
    }}>
      {children}
    </label>
  );
}

export default function InputForm() {
  const navigate = useNavigate();
  const { fetchChart, loading, error } = useChart();

  const [form, setForm] = useState({
    name: '',
    date: '',
    time: '',
    location: '',
  });
  const [geoError, setGeoError] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setGeoError('');

    if (!form.name || !form.date || !form.time || !form.location) {
      setGeoError('모든 항목을 입력해주세요.');
      return;
    }

    let geo;
    try {
      geo = await geocode(form.location);
    } catch (err) {
      setGeoError(err.message);
      return;
    }

    const [year, month, day] = form.date.split('-').map(Number);
    const [hour, minute] = form.time.split(':').map(Number);
    const timezone = lonToTimezone(geo.lon);

    const formData = {
      name: form.name.trim(),
      year,
      month,
      day,
      hour,
      minute,
      second: 0,
      lat: geo.lat,
      lon: geo.lon,
      timezone,
    };

    const chart = await fetchChart(formData);
    if (chart) {
      sessionStorage.setItem('chartData', JSON.stringify(chart));
      sessionStorage.setItem('formData', JSON.stringify(formData));
      navigate('/chart');
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      padding: '2rem 1.5rem',
    }}>
      <StarBackground />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 480 }}>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate('/')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: '0.8rem',
            letterSpacing: '0.1em', marginBottom: '2rem',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
          }}
        >
          이전으로
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="card"
          style={{ padding: 'clamp(1.5rem, 5vw, 2.5rem)' }}
        >
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.5rem, 5vw, 2rem)',
            marginBottom: '0.5rem',
          }}>
            출생 정보 입력
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
            이름과 정확한 출생 시간, 장소를 입력할수록 해석이 더 자연스럽고 정확해져요.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <Label>이름</Label>
              <input
                type="text"
                value={form.name}
                onChange={set('name')}
                placeholder="예: 김지혜"
                required
              />
            </div>

            <div>
              <Label>생년월일</Label>
              <input
                type="date"
                value={form.date}
                onChange={set('date')}
                required
                style={{ colorScheme: 'dark' }}
              />
            </div>

            <div>
              <Label>출생 시간</Label>
              <input
                type="time"
                value={form.time}
                onChange={set('time')}
                required
                style={{ colorScheme: 'dark' }}
              />
            </div>

            <div>
              <Label>출생지</Label>
              <input
                type="text"
                placeholder="예: 서울 강남구, 부산 해운대구"
                value={form.location}
                onChange={set('location')}
                required
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.4rem' }}>
                도시나 지역명을 한글 또는 영어로 입력해주세요.
              </p>
            </div>

            {(geoError || error) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  padding: '0.75rem 1rem',
                  background: 'rgba(248,113,113,0.08)',
                  border: '1px solid rgba(248,113,113,0.3)',
                  borderRadius: 8,
                  color: 'var(--red)',
                  fontSize: '0.875rem',
                }}
              >
                {geoError || error}
              </motion.div>
            )}

            <button
              type="submit"
              className="btn btn-gold"
              disabled={loading}
              style={{ marginTop: '0.5rem', width: '100%', padding: '0.9rem' }}
            >
              {loading ? '계산 중...' : '출생 차트 계산하기'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
