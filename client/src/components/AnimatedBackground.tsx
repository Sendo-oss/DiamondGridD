import { useEffect, useRef } from "react";

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    // ── Particle system ──────────────────────────────
    type Particle = {
      x: number; y: number;
      vx: number; vy: number;
      r: number; alpha: number;
      baseAlpha: number; phase: number; speed: number;
      color: string;
    };

    const COLORS = [
      "34,211,238",   // cyan-400
      "56,189,248",   // sky-300
      "14,165,233",   // sky-500
      "6,182,212",    // cyan-500
      "99,102,241",   // indigo-500 — occasional accent
    ];

    const particles: Particle[] = Array.from({ length: 90 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: Math.random() * 1.6 + 0.4,
      alpha: 0,
      baseAlpha: Math.random() * 0.45 + 0.08,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.006 + 0.002,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    // ── Hex grid nodes ────────────────────────────────
    type HexNode = { x: number; y: number; alpha: number; phase: number; speed: number };
    const hexNodes: HexNode[] = [];
    const HEX_SIZE = 64;
    const cols = Math.ceil(W / (HEX_SIZE * 1.732)) + 2;
    const rows = Math.ceil(H / (HEX_SIZE * 1.5)) + 2;
    for (let c = -1; c < cols; c++) {
      for (let r = -1; r < rows; r++) {
        const offset = r % 2 === 0 ? 0 : HEX_SIZE * 0.866;
        hexNodes.push({
          x: c * HEX_SIZE * 1.732 + offset,
          y: r * HEX_SIZE * 1.5,
          alpha: Math.random() * 0.18 + 0.02,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.004 + 0.001,
        });
      }
    }

    // ── Connection lines between close particles ──────
    const CONNECTION_DIST = 130;

    // ── Orbs (slow drifting large blobs) ─────────────
    type Orb = { x: number; y: number; r: number; phase: number; speed: number; color: string };
    const orbs: Orb[] = [
      { x: W * 0.5, y: -80,    r: 340, phase: 0,    speed: 0.0008, color: "6,182,212"  },
      { x: W * 0.85, y: H * 0.25, r: 280, phase: 1.5, speed: 0.0006, color: "14,165,233" },
      { x: W * 0.1,  y: H * 0.75, r: 260, phase: 3.1, speed: 0.0007, color: "56,189,248" },
      { x: W * 0.5,  y: H * 0.55, r: 200, phase: 2.0, speed: 0.0005, color: "99,102,241" },
    ];

    // ── Shooting streaks ──────────────────────────────
    type Streak = { x: number; y: number; len: number; angle: number; speed: number; alpha: number; life: number; maxLife: number };
    const streaks: Streak[] = [];

    function spawnStreak() {
      const angle = Math.random() * 0.4 + 0.1; // shallow diagonal
      streaks.push({
        x: Math.random() * W,
        y: Math.random() * H * 0.5,
        len: Math.random() * 80 + 40,
        angle,
        speed: Math.random() * 3 + 2,
        alpha: Math.random() * 0.4 + 0.15,
        life: 0,
        maxLife: Math.random() * 60 + 40,
      });
    }

    let lastStreak = 0;
    const STREAK_INTERVAL = 120; // frames between spawns

    // ── Draw hex ──────────────────────────────────────
    function drawHex(cx: number, cy: number, size: number) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const px = cx + size * Math.cos(angle);
        const py = cy + size * Math.sin(angle);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
    }

    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      t++;

      // ── Base gradient fill ──────────────────────────
      const bg = ctx.createRadialGradient(W / 2, 0, 0, W / 2, H / 2, Math.max(W, H));
      bg.addColorStop(0, "#07131f");
      bg.addColorStop(0.45, "#040915");
      bg.addColorStop(1, "#02050c");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // ── Orbs ────────────────────────────────────────
      for (const orb of orbs) {
        const px = orb.x + Math.sin(t * orb.speed + orb.phase) * 60;
        const py = orb.y + Math.cos(t * orb.speed * 0.7 + orb.phase) * 40;
        const grad = ctx.createRadialGradient(px, py, 0, px, py, orb.r);
        grad.addColorStop(0, `rgba(${orb.color},0.1)`);
        grad.addColorStop(0.5, `rgba(${orb.color},0.05)`);
        grad.addColorStop(1, `rgba(${orb.color},0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      }

      // ── Hex grid ────────────────────────────────────
      for (const n of hexNodes) {
        const a = (Math.sin(t * n.speed + n.phase) * 0.5 + 0.5) * n.alpha;
        ctx.strokeStyle = `rgba(34,211,238,${a.toFixed(3)})`;
        ctx.lineWidth = 0.5;
        drawHex(n.x, n.y, HEX_SIZE * 0.48);
        ctx.stroke();
      }

      // ── Connection lines ─────────────────────────────
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const a = (1 - dist / CONNECTION_DIST) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(34,211,238,${a.toFixed(3)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // ── Particles ────────────────────────────────────
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;

        const a = (Math.sin(t * p.speed + p.phase) * 0.5 + 0.5) * p.baseAlpha;
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
        grd.addColorStop(0, `rgba(${p.color},${(a * 1.4).toFixed(3)})`);
        grd.addColorStop(1, `rgba(${p.color},0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${Math.min(a * 2, 0.9).toFixed(3)})`;
        ctx.fill();
      }

      // ── Streaks ──────────────────────────────────────
      if (t - lastStreak > STREAK_INTERVAL) {
        spawnStreak();
        lastStreak = t;
      }

      for (let i = streaks.length - 1; i >= 0; i--) {
        const s = streaks[i];
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.life++;

        const lifeRatio = s.life / s.maxLife;
        const a = s.alpha * (1 - lifeRatio);

        const grad = ctx.createLinearGradient(
          s.x, s.y,
          s.x - Math.cos(s.angle) * s.len,
          s.y - Math.sin(s.angle) * s.len
        );
        grad.addColorStop(0, `rgba(186,230,253,${a.toFixed(3)})`);
        grad.addColorStop(1, `rgba(34,211,238,0)`);

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - Math.cos(s.angle) * s.len, s.y - Math.sin(s.angle) * s.len);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        if (s.life >= s.maxLife) streaks.splice(i, 1);
      }

      // ── Vignette ─────────────────────────────────────
      const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.85);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Canvas layer — all dynamic effects */}
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />

      {/* CSS overlay: subtle noise grain texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
          opacity: 0.022,
          mixBlendMode: "overlay",
        }}
      />

      {/* Top edge glow bar */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "1px",
          background: "linear-gradient(90deg, transparent 0%, rgba(34,211,238,0.35) 30%, rgba(14,165,233,0.5) 50%, rgba(34,211,238,0.35) 70%, transparent 100%)",
        }}
      />

      {/* Floating geometric accents — CSS only, no canvas needed */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        {/* Diagonal sweep 1 */}
        <div style={{
          position: "absolute",
          top: 0, bottom: 0,
          width: "30%",
          left: "-30%",
          background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.025), transparent)",
          transform: "rotate(18deg)",
          filter: "blur(32px)",
          animation: "ab-sweep1 14s linear infinite",
        }} />
        {/* Diagonal sweep 2 */}
        <div style={{
          position: "absolute",
          top: 0, bottom: 0,
          width: "20%",
          right: "-20%",
          background: "linear-gradient(90deg, transparent, rgba(56,189,248,0.02), transparent)",
          transform: "rotate(-18deg)",
          filter: "blur(28px)",
          animation: "ab-sweep2 18s linear infinite",
        }} />
      </div>

      {/* CSS keyframes injected inline */}
      <style>{`
        @keyframes ab-sweep1 {
          0%   { left: -30%; opacity: 0; }
          5%   { opacity: 1; }
          90%  { opacity: 0.6; }
          100% { left: 120%; opacity: 0; }
        }
        @keyframes ab-sweep2 {
          0%   { right: -20%; opacity: 0; }
          5%   { opacity: 1; }
          90%  { opacity: 0.5; }
          100% { right: 120%; opacity: 0; }
        }
        @keyframes dgPulse {
          0%,100% { transform: translateX(-50%) translateY(0px) scale(1); opacity:.8 }
          50% { transform: translateX(-50%) translateY(18px) scale(1.08); opacity:1 }
        }
        @keyframes dgFloatRight {
          0%,100% { transform: translate(0,0); opacity:.7 }
          50% { transform: translate(-30px,-20px); opacity:1 }
        }
        @keyframes dgFloatLeft {
          0%,100% { transform: translate(0,0); opacity:.7 }
          50% { transform: translate(20px,-20px); opacity:1 }
        }
        @keyframes dgSoftPulse {
          0%,100% { transform: scale(1); opacity:.5 }
          50% { transform: scale(1.15); opacity:.9 }
        }
        @keyframes dgSweep {
          0% { transform: translateX(-20%); opacity:0 }
          10% { opacity:1 } 40% { opacity:.7 }
          100% { transform: translateX(200%); opacity:0 }
        }
        @keyframes dgSweepReverse {
          0% { transform: translateX(20%); opacity:0 }
          10% { opacity:1 } 40% { opacity:.7 }
          100% { transform: translateX(-200%); opacity:0 }
        }
        @keyframes dgBoxFloat1 {
          0%,100% { transform: translate(0,0) rotate(0deg); opacity:.4 }
          50% { transform: translate(8px,-14px) rotate(45deg); opacity:.8 }
        }
        @keyframes dgBoxFloat2 {
          0%,100% { transform: translate(0,0) rotate(0deg); opacity:.3 }
          50% { transform: translate(-10px,-10px) rotate(-30deg); opacity:.7 }
        }
        @keyframes dgBoxFloat3 {
          0%,100% { transform: translate(0,0) rotate(0deg); opacity:.35 }
          50% { transform: translate(6px,-16px) rotate(20deg); opacity:.7 }
        }
        @keyframes dgBoxFloat4 {
          0%,100% { transform: translate(0,0) rotate(0deg); opacity:.25 }
          50% { transform: translate(-8px,-12px) rotate(-45deg); opacity:.6 }
        }
        @keyframes dgBoxFloat5 {
          0%,100% { transform: translate(0,0) rotate(0deg); opacity:.4 }
          50% { transform: translate(10px,-8px) rotate(30deg); opacity:.75 }
        }
        @keyframes animate-brand-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-brand-marquee { animation: animate-brand-marquee 24s linear infinite; }
      `}</style>
    </div>
  );
}