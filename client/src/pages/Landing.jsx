import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import StarBackground from '../components/StarBackground';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <StarBackground />

      {/* Subtle radial glow behind content */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600, height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(167,139,250,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 560 }}>
        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            width: 48, height: 1,
            background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
            margin: '0 auto 1.5rem',
          }}
        />

        {/* Site name */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(4rem, 14vw, 7rem)',
            fontWeight: 300,
            letterSpacing: '0.25em',
            color: 'var(--text)',
            lineHeight: 1,
            marginBottom: '1.25rem',
          }}
        >
          ASTRA
        </motion.h1>

        {/* Sub copy */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
            fontWeight: 300,
            letterSpacing: '0.25em',
            color: 'var(--text-muted)',
            marginBottom: '3rem',
          }}
        >
          당신의 별자리가 말하는 진짜 당신
        </motion.p>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="btn btn-outline"
          style={{ fontSize: '1rem', letterSpacing: '0.15em', padding: '0.9rem 2.5rem' }}
          onClick={() => navigate('/input')}
        >
          차트 보기
        </motion.button>

        {/* Decorative bottom line */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          style={{
            width: 48, height: 1,
            background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
            margin: '3rem auto 0',
          }}
        />
      </div>
    </div>
  );
}
