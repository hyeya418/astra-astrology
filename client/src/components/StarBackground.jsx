import { useMemo } from 'react';

const NUM_STARS = 200;

export default function StarBackground() {
  const stars = useMemo(() => {
    return Array.from({ length: NUM_STARS }, (_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.15,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 6,
    }));
  }, []);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 0,
    }}>
      {stars.map(star => (
        <span
          key={star.id}
          style={{
            position: 'absolute',
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            borderRadius: '50%',
            backgroundColor: star.size > 2 ? '#c9a84c' : '#f0ece4',
            '--star-opacity': star.opacity,
            opacity: star.opacity,
            willChange: 'opacity',
            animation: `twinkle ${star.duration}s ${star.delay}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}
