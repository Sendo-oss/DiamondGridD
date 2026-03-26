import { useEffect, useState, useRef } from "react";

interface Props {
  onFinish: () => void;
}

const LOADING_STAGES = [
  "Iniciando sistema...",
  "Cargando catálogo...",
  "Sincronizando precios...",
  "Preparando módulos...",
  "Listo ✦",
];

export function SplashScreen({ onFinish }: Props) {
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [exitAnim, setExitAnim] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  // Particle grid background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const COLS = Math.ceil(W / 48);
    const ROWS = Math.ceil(H / 48);

    type Dot = { x: number; y: number; alpha: number; speed: number; phase: number };
    const dots: Dot[] = [];

    for (let c = 0; c <= COLS; c++) {
      for (let r = 0; r <= ROWS; r++) {
        dots.push({
          x: c * 48,
          y: r * 48,
          alpha: Math.random() * 0.35 + 0.05,
          speed: Math.random() * 0.008 + 0.003,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      t += 0.016;

      // Faint lines
      ctx.strokeStyle = "rgba(34,211,238,0.04)";
      ctx.lineWidth = 1;
      for (let c = 0; c <= COLS; c++) {
        ctx.beginPath();
        ctx.moveTo(c * 48, 0);
        ctx.lineTo(c * 48, H);
        ctx.stroke();
      }
      for (let r = 0; r <= ROWS; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * 48);
        ctx.lineTo(W, r * 48);
        ctx.stroke();
      }

      // Dots
      for (const d of dots) {
        const a = (Math.sin(t * d.speed * 60 + d.phase) * 0.5 + 0.5) * d.alpha;
        ctx.beginPath();
        ctx.arc(d.x, d.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34,211,238,${a.toFixed(3)})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Reveal entrance
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((old) => {
        const next = old + (Math.random() * 2.5 + 0.8);
        if (next >= 100) {
          clearInterval(interval);
          setStageIndex(LOADING_STAGES.length - 1);
          setTimeout(() => {
            setExitAnim(true);
            setTimeout(onFinish, 700);
          }, 600);
          return 100;
        }
        const si = Math.floor((next / 100) * (LOADING_STAGES.length - 1));
        setStageIndex(si);
        return next;
      });
    }, 35);
    return () => clearInterval(interval);
  }, [onFinish]);

  const pct = Math.min(100, Math.round(progress));

  // Hex ring segments
  const segments = 12;
  const R = 90;
  const cx = 120;
  const cy = 120;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Oxanium:wght@300;400;600;700;800&display=swap');

        .sp-root * { box-sizing: border-box; margin: 0; padding: 0; }

        .sp-root {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #020711;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          font-family: 'Rajdhani', sans-serif;
          transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .sp-root.exit {
          opacity: 0;
          transform: scale(1.04);
          pointer-events: none;
        }

        .sp-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        /* Ambient glows */
        .sp-glow-tl {
          position: absolute;
          top: -10%;
          left: -10%;
          width: 55vw;
          height: 55vw;
          background: radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 65%);
          pointer-events: none;
          animation: sp-drift 8s ease-in-out infinite alternate;
        }

        .sp-glow-br {
          position: absolute;
          bottom: -10%;
          right: -10%;
          width: 50vw;
          height: 50vw;
          background: radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 65%);
          pointer-events: none;
          animation: sp-drift 10s ease-in-out infinite alternate-reverse;
        }

        @keyframes sp-drift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(3%, 3%) scale(1.08); }
        }

        /* Corner brackets */
        .sp-bracket {
          position: absolute;
          width: 28px;
          height: 28px;
          pointer-events: none;
          opacity: 0.35;
        }
        .sp-bracket-tl { top: 20px; left: 20px; border-top: 1.5px solid #22d3ee; border-left: 1.5px solid #22d3ee; }
        .sp-bracket-tr { top: 20px; right: 20px; border-top: 1.5px solid #22d3ee; border-right: 1.5px solid #22d3ee; }
        .sp-bracket-bl { bottom: 20px; left: 20px; border-bottom: 1.5px solid #22d3ee; border-left: 1.5px solid #22d3ee; }
        .sp-bracket-br { bottom: 20px; right: 20px; border-bottom: 1.5px solid #22d3ee; border-right: 1.5px solid #22d3ee; }

        /* Scan line */
        .sp-scanline {
          position: absolute;
          left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(34,211,238,0.25), transparent);
          animation: sp-scan 4s linear infinite;
          pointer-events: none;
        }

        @keyframes sp-scan {
          0%   { top: -2px; opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }

        /* Main card */
        .sp-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 560px;
          max-width: 92vw;
          padding: 52px 56px 48px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(34,211,238,0.1);
          border-radius: 4px;
          backdrop-filter: blur(32px);
          box-shadow:
            0 0 0 1px rgba(34,211,238,0.04) inset,
            0 40px 100px rgba(0,0,0,0.55),
            0 0 60px rgba(6,182,212,0.07);

          opacity: 0;
          transform: translateY(24px) scale(0.97);
          transition: opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1);
        }

        .sp-card.in {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        /* Card corner accents */
        .sp-card::before,
        .sp-card::after {
          content: '';
          position: absolute;
          width: 16px;
          height: 16px;
          border-color: rgba(34,211,238,0.5);
          border-style: solid;
        }
        .sp-card::before { top: -1px; left: -1px; border-width: 2px 0 0 2px; }
        .sp-card::after  { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; }

        /* SVG ring */
        .sp-ring-wrap {
          position: relative;
          width: 240px;
          height: 240px;
          flex-shrink: 0;
        }

        .sp-ring-svg {
          width: 240px;
          height: 240px;
          transform: rotate(-90deg);
        }

        .sp-ring-track {
          fill: none;
          stroke: rgba(34,211,238,0.07);
          stroke-width: 3;
        }

        .sp-ring-progress {
          fill: none;
          stroke: url(#sp-grad);
          stroke-width: 3;
          stroke-linecap: round;
          transition: stroke-dashoffset 0.3s ease;
          filter: drop-shadow(0 0 6px rgba(34,211,238,0.6));
        }

        .sp-ring-inner {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        .sp-logo-img {
          width: 168px;
          max-width: 100%;
          filter: drop-shadow(0 0 18px rgba(34,211,238,0.5));
          animation: sp-logo-pulse 3s ease-in-out infinite;
        }

        @keyframes sp-logo-pulse {
          0%, 100% { filter: drop-shadow(0 0 14px rgba(34,211,238,0.45)); }
          50%       { filter: drop-shadow(0 0 28px rgba(34,211,238,0.75)); }
        }

        /* Rotating dashes */
        .sp-ring-dashes {
          position: absolute;
          inset: -14px;
          animation: sp-spin 12s linear infinite;
        }

        .sp-ring-dashes-inner {
          position: absolute;
          inset: 18px;
          animation: sp-spin-rev 8s linear infinite;
        }

        @keyframes sp-spin     { to { transform: rotate(360deg); } }
        @keyframes sp-spin-rev { to { transform: rotate(-360deg); } }

        /* PCT label */
        .sp-pct {
          font-family: 'Oxanium', monospace;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: rgba(34,211,238,0.7);
          margin-top: 2px;
        }

        /* Bottom section */
        .sp-bottom {
          width: 100%;
          margin-top: 36px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }

        /* Stage text */
        .sp-stage {
          font-family: 'Oxanium', monospace;
          font-size: 11.5px;
          font-weight: 400;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          height: 16px;
          position: relative;
          overflow: hidden;
        }

        .sp-stage-text {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
          animation: sp-stage-in 0.35s ease forwards;
        }

        @keyframes sp-stage-in {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        /* Progress bar */
        .sp-bar-wrap {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sp-bar-track {
          flex: 1;
          height: 3px;
          background: rgba(255,255,255,0.06);
          border-radius: 999px;
          overflow: hidden;
          position: relative;
        }

        .sp-bar-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #0891b2, #22d3ee, #38bdf8);
          transition: width 0.25s ease;
          position: relative;
        }

        .sp-bar-fill::after {
          content: '';
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #67e8f9;
          box-shadow: 0 0 8px rgba(103,232,249,0.9);
        }

        .sp-bar-pct {
          font-family: 'Oxanium', monospace;
          font-size: 11px;
          font-weight: 700;
          color: rgba(34,211,238,0.55);
          letter-spacing: 0.06em;
          flex-shrink: 0;
          width: 36px;
          text-align: right;
        }

        /* Dot indicators */
        .sp-dots {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .sp-dot {
          width: 5px;
          height: 5px;
          border-radius: 2px;
          background: rgba(255,255,255,0.1);
          transition: background 0.3s, width 0.3s;
        }

        .sp-dot.active {
          background: #22d3ee;
          width: 18px;
          box-shadow: 0 0 6px rgba(34,211,238,0.6);
        }

        .sp-dot.done {
          background: rgba(34,211,238,0.35);
        }

        /* System ID tag */
        .sp-sysid {
          margin-top: 4px;
          font-family: 'Oxanium', monospace;
          font-size: 9.5px;
          letter-spacing: 0.2em;
          color: rgba(255,255,255,0.14);
          text-transform: uppercase;
        }
      `}</style>

      <div className={`sp-root ${exitAnim ? "exit" : ""}`}>
        <canvas ref={canvasRef} className="sp-canvas" />

        <div className="sp-glow-tl" />
        <div className="sp-glow-br" />

        {/* Scan line */}
        <div className="sp-scanline" />

        {/* Brackets */}
        <div className="sp-bracket sp-bracket-tl" />
        <div className="sp-bracket sp-bracket-tr" />
        <div className="sp-bracket sp-bracket-bl" />
        <div className="sp-bracket sp-bracket-br" />

        {/* Main card */}
        <div className={`sp-card ${revealed ? "in" : ""}`}>

          {/* SVG ring */}
          <div className="sp-ring-wrap">

            {/* Outer rotating dashes */}
            <svg className="sp-ring-dashes" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 240 240">
              <circle cx="120" cy="120" r="115" fill="none" stroke="rgba(34,211,238,0.06)" strokeWidth="1" strokeDasharray="4 8" />
            </svg>

            {/* Inner rotating dashes */}
            <svg className="sp-ring-dashes-inner" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 240 240">
              <circle cx="120" cy="120" r="106" fill="none" stroke="rgba(34,211,238,0.08)" strokeWidth="1" strokeDasharray="2 14" />
            </svg>

            {/* Main progress ring */}
            <svg className="sp-ring-svg" viewBox="0 0 240 240">
              <defs>
                <linearGradient id="sp-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0891b2" />
                  <stop offset="50%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>

              {/* Segment ticks */}
              {Array.from({ length: segments }).map((_, i) => {
                const angle = (i / segments) * 2 * Math.PI - Math.PI / 2;
                const r1 = R - 6;
                const r2 = R - 2;
                return (
                  <line
                    key={i}
                    x1={cx + r1 * Math.cos(angle)}
                    y1={cy + r1 * Math.sin(angle)}
                    x2={cx + r2 * Math.cos(angle)}
                    y2={cy + r2 * Math.sin(angle)}
                    stroke="rgba(34,211,238,0.2)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                );
              })}

              <circle className="sp-ring-track" cx={cx} cy={cy} r={R} />
              <circle
                className="sp-ring-progress"
                cx={cx}
                cy={cy}
                r={R}
                strokeDasharray={`${2 * Math.PI * R}`}
                strokeDashoffset={`${2 * Math.PI * R * (1 - pct / 100)}`}
              />
            </svg>

            {/* Center content */}
            <div className="sp-ring-inner">
              <img src="/logo.png" alt="DiamondGrid" className="sp-logo-img" />
              <span className="sp-pct">{pct}%</span>
            </div>
          </div>

          {/* Bottom */}
          <div className="sp-bottom">
            <div className="sp-stage">
              <span className="sp-stage-text" key={stageIndex}>
                {LOADING_STAGES[stageIndex]}
              </span>
            </div>

            <div className="sp-bar-wrap">
              <div className="sp-bar-track">
                <div className="sp-bar-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="sp-bar-pct">{pct}%</span>
            </div>

            <div className="sp-dots">
              {LOADING_STAGES.slice(0, -1).map((_, i) => (
                <div
                  key={i}
                  className={`sp-dot ${i === stageIndex ? "active" : i < stageIndex ? "done" : ""}`}
                />
              ))}
            </div>

            <p className="sp-sysid">Diamond Grid — Sistema v2.0 — Init</p>
          </div>
        </div>
      </div>
    </>
  );
}
