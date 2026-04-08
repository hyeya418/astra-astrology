import { useEffect, useRef } from 'react';

// Constellation lines: [x%, y%] points connected in order
const CONSTELLATIONS = [
  // Orion
  [[68,44],[71,42],[74,44]],
  [[71,42],[70,48],[71,54]],
  [[69,50],[71,54],[73,50]],
  // Big Dipper
  [[20,18],[24,16],[28,17],[32,15],[35,17],[38,14],[42,16]],
  [[32,15],[33,20],[35,22]],
  // Cassiopeia
  [[58,12],[61,16],[65,12],[69,16],[73,12]],
  // Scorpius tail
  [[30,62],[32,58],[35,55],[38,53],[42,54],[46,57],[48,62],[46,66],[44,70]],
  // Southern Cross
  [[65,68],[65,74]],
  [[62,71],[68,71]],
  // Leo
  [[52,32],[55,28],[59,27],[62,30],[60,34],[55,28]],
  // Simple triangle (Triangulum)
  [[80,25],[84,22],[87,26],[80,25]],
];

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

export default function StarBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animId;
    let stars = [];
    let shootingStars = [];
    let lastShoot = 0;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    }

    function initStars() {
      const w = canvas.width;
      const h = canvas.height;
      stars = [];

      // Tiny background stars (dense)
      for (let i = 0; i < 700; i++) {
        stars.push({
          x: rand(0, w), y: rand(0, h),
          r: rand(0.2, 0.8),
          alpha: rand(0.15, 0.55),
          twinkleSpeed: rand(0.003, 0.011),
          twinkleOffset: rand(0, Math.PI * 2),
          color: '#ffffff',
          glow: false,
        });
      }

      // Coloured medium stars
      for (let i = 0; i < 180; i++) {
        const roll = Math.random();
        const color = roll < 0.25
          ? `hsl(${rand(200,240)},55%,82%)`   // blue-white
          : roll < 0.45
          ? `hsl(${rand(25,50)},65%,80%)`     // orange/yellow
          : roll < 0.55
          ? `hsl(${rand(0,15)},60%,75%)`      // red giant
          : '#ffffff';
        stars.push({
          x: rand(0, w), y: rand(0, h),
          r: rand(0.7, 1.6),
          alpha: rand(0.4, 0.85),
          twinkleSpeed: rand(0.004, 0.013),
          twinkleOffset: rand(0, Math.PI * 2),
          color,
          glow: false,
        });
      }

      // Bright stars with glow + diffraction spikes
      for (let i = 0; i < 30; i++) {
        const roll = Math.random();
        const color = roll < 0.3
          ? `hsl(${rand(210,230)},70%,90%)`
          : roll < 0.6
          ? '#fff8e7'
          : `hsl(${rand(20,40)},70%,85%)`;
        stars.push({
          x: rand(0, w), y: rand(0, h),
          r: rand(1.8, 3.0),
          alpha: rand(0.75, 1),
          twinkleSpeed: rand(0.002, 0.007),
          twinkleOffset: rand(0, Math.PI * 2),
          color,
          glow: true,
        });
      }
    }

    function drawMilkyWay(w, h) {
      // Diagonal diffuse band
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(-0.38);

      const band = ctx.createLinearGradient(0, -h * 0.5, 0, h * 0.5);
      band.addColorStop(0,    'rgba(70,80,160,0)');
      band.addColorStop(0.3,  'rgba(80,100,190,0.055)');
      band.addColorStop(0.48, 'rgba(110,130,210,0.13)');
      band.addColorStop(0.52, 'rgba(130,150,230,0.16)');
      band.addColorStop(0.7,  'rgba(80,100,190,0.055)');
      band.addColorStop(1,    'rgba(70,80,160,0)');

      ctx.fillStyle = band;
      ctx.fillRect(-w, -h, w * 2, h * 2);
      ctx.restore();

      // Nebula glow blobs
      const blobs = [
        { x: 0.38, y: 0.52, r: 0.22, color: 'rgba(50,30,110,0.08)' },
        { x: 0.62, y: 0.45, r: 0.18, color: 'rgba(30,60,110,0.07)' },
        { x: 0.22, y: 0.68, r: 0.15, color: 'rgba(80,40,120,0.06)' },
      ];
      for (const b of blobs) {
        const g = ctx.createRadialGradient(w*b.x, h*b.y, 0, w*b.x, h*b.y, w*b.r);
        g.addColorStop(0, b.color);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
    }

    function drawConstellations(w, h) {
      ctx.save();
      ctx.strokeStyle = 'rgba(140,170,255,0.2)';
      ctx.lineWidth = 0.65;
      ctx.setLineDash([4, 6]);

      for (const line of CONSTELLATIONS) {
        ctx.beginPath();
        line.forEach(([px, py], i) => {
          const x = (px / 100) * w;
          const y = (py / 100) * h;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.stroke();
      }

      // Dots at junction points
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(180,200,255,0.6)';
      for (const line of CONSTELLATIONS) {
        for (const [px, py] of line) {
          ctx.beginPath();
          ctx.arc((px / 100) * w, (py / 100) * h, 1.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    function drawStars(t) {
      for (const s of stars) {
        const tw = Math.sin(t * s.twinkleSpeed * 60 + s.twinkleOffset);
        const alpha = Math.max(0.05, Math.min(1, s.alpha + tw * 0.2));

        if (s.glow) {
          // Soft glow halo
          const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 6);
          g.addColorStop(0, s.color.includes('hsl')
            ? s.color.replace('hsl', 'hsla').replace(')', `,${alpha * 0.35})`)
            : `rgba(255,248,230,${alpha * 0.35})`);
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 6, 0, Math.PI * 2);
          ctx.fill();

          // Diffraction spikes
          ctx.save();
          ctx.globalAlpha = alpha * 0.28;
          ctx.strokeStyle = s.color;
          ctx.lineWidth = 0.6;
          const spikeLen = s.r * 7;
          ctx.beginPath();
          ctx.moveTo(s.x - spikeLen, s.y); ctx.lineTo(s.x + spikeLen, s.y);
          ctx.moveTo(s.x, s.y - spikeLen); ctx.lineTo(s.x, s.y + spikeLen);
          ctx.stroke();
          ctx.restore();
        }

        ctx.globalAlpha = alpha;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function spawnShootingStar(w, h) {
      shootingStars.push({
        x: rand(w * 0.15, w * 0.85),
        y: rand(0, h * 0.35),
        angle: rand(0.3, 0.65),
        speed: rand(9, 18),
        length: rand(90, 200),
        alpha: 1,
      });
    }

    function drawShootingStars() {
      shootingStars = shootingStars.filter(s => s.alpha > 0);
      for (const s of shootingStars) {
        const tx = s.x - Math.cos(s.angle) * s.length;
        const ty = s.y - Math.sin(s.angle) * s.length;
        const g = ctx.createLinearGradient(tx, ty, s.x, s.y);
        g.addColorStop(0, 'rgba(255,255,255,0)');
        g.addColorStop(1, `rgba(255,255,255,${s.alpha * 0.9})`);
        ctx.save();
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
        ctx.restore();
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.alpha -= 0.022;
      }
    }

    function draw(timestamp) {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Deep space background
      ctx.fillStyle = '#04060e';
      ctx.fillRect(0, 0, w, h);

      drawMilkyWay(w, h);
      drawConstellations(w, h);
      drawStars(timestamp);
      drawShootingStars();

      // Shooting star interval ~10s
      if (timestamp - lastShoot > 10000 && Math.random() < 0.5) {
        spawnShootingStar(w, h);
        lastShoot = timestamp;
      }

      animId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
