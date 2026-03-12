import { Layout } from "../components/Layout";

const stats = [
  { value: "1",    label: "Tienda",    desc: "Digital, con planes de expansión física para brindar una experiencia más completa." },
  { value: "+75",  label: "Marcas",    desc: "Fabricantes reconocidos por su calidad y rendimiento en el sector tecnológico." },
  { value: "+100", label: "Productos", desc: "Amplio catálogo de componentes para armar, mejorar o mantener tus equipos." },
];

const values = [
  {
    icon: "⬡",
    title: "Calidad",
    text: "Seleccionamos productos confiables y de marcas reconocidas en el sector tecnológico.",
    color: "rgba(34,211,238,0.9)", bg: "rgba(34,211,238,0.07)", border: "rgba(34,211,238,0.15)",
  },
  {
    icon: "⚡",
    title: "Innovación",
    text: "Ofrecemos una experiencia moderna, intuitiva y alineada con las nuevas tendencias digitales.",
    color: "rgba(251,191,36,0.9)", bg: "rgba(251,191,36,0.07)", border: "rgba(251,191,36,0.15)",
  },
  {
    icon: "◈",
    title: "Confianza",
    text: "Cada cliente se siente seguro al comprar y al recibir soporte de nuestro equipo.",
    color: "rgba(196,181,253,0.9)", bg: "rgba(139,92,246,0.07)", border: "rgba(139,92,246,0.15)",
  },
];

const products = [
  "Procesadores", "Tarjetas gráficas", "Memorias RAM",
  "SSD y almacenamiento", "Placas madre", "Periféricos y accesorios",
];

const whyUs = [
  "Catálogo actualizado con productos de marcas reconocidas.",
  "Atención enfocada en resolver dudas y acompañar cada compra.",
  "Experiencia digital moderna y orientada al usuario.",
  "Compromiso con calidad, confianza y rendimiento.",
];

const CheckIcon = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

export function AboutPage() {
  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap');

        .ab { font-family: 'Inter', sans-serif; color: #fff; }
        .ab * { box-sizing: border-box; }

        /* ── HERO ── */
        .ab-hero {
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.025);
          backdrop-filter: blur(14px);
          padding: 36px 36px 32px;
          margin-bottom: 16px;
          position: relative;
          overflow: hidden;
        }

        .ab-hero::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(34,211,238,0.35), rgba(99,102,241,0.35), transparent);
        }

        .ab-hero-eye {
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: rgba(34,211,238,0.55);
          margin-bottom: 10px;
          display: flex; align-items: center; gap: 8px;
        }
        .ab-hero-eye::before {
          content: '';
          width: 18px; height: 1px;
          background: rgba(34,211,238,0.4);
        }

        .ab-hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(24px, 4vw, 36px);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.2;
          max-width: 640px;
          margin-bottom: 16px;
        }

        .ab-hero-title span {
          background: linear-gradient(135deg, #22d3ee, #6366f1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .ab-hero-text {
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          line-height: 1.75;
          max-width: 580px;
        }

        /* ── STATS ── */
        .ab-stats {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }
        @media (min-width: 640px) { .ab-stats { grid-template-columns: repeat(3, 1fr); } }

        .ab-stat {
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.02);
          padding: 22px 20px;
          transition: border-color 0.2s, transform 0.2s;
          position: relative; overflow: hidden;
        }
        .ab-stat:hover { border-color: rgba(34,211,238,0.15); transform: translateY(-2px); }
        .ab-stat::after {
          content: '';
          position: absolute; bottom: 0; left: 20px; right: 20px; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(34,211,238,0.15), transparent);
        }

        .ab-stat-val {
          font-family: 'Syne', sans-serif;
          font-size: 36px; font-weight: 800;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #22d3ee, #6366f1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 4px;
        }

        .ab-stat-label {
          font-family: 'Syne', sans-serif;
          font-size: 15px; font-weight: 700;
          color: rgba(255,255,255,0.85);
          margin-bottom: 8px;
        }

        .ab-stat-desc { font-size: 12.5px; color: rgba(255,255,255,0.38); line-height: 1.6; }

        /* ── TWO-COL GRID ── */
        .ab-2col {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }
        @media (min-width: 768px) { .ab-2col { grid-template-columns: 1fr 1fr; } }

        /* ── PANEL ── */
        .ab-panel {
          border-radius: 22px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.025);
          backdrop-filter: blur(12px);
          overflow: hidden;
        }

        .ab-panel-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .ab-panel-title {
          font-family: 'Syne', sans-serif;
          font-size: 16px; font-weight: 800;
          letter-spacing: -0.02em;
        }

        .ab-panel-body { padding: 20px 24px; }
        .ab-panel-text { font-size: 13.5px; color: rgba(255,255,255,0.5); line-height: 1.75; }

        /* ── VALUES ── */
        .ab-values {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          margin-bottom: 16px;
        }
        @media (min-width: 640px) { .ab-values { grid-template-columns: repeat(3, 1fr); } }

        .ab-value-card {
          border-radius: 20px;
          border: 1px solid;
          padding: 20px;
          transition: transform 0.2s;
        }
        .ab-value-card:hover { transform: translateY(-2px); }

        .ab-value-icon {
          width: 36px; height: 36px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
          margin-bottom: 14px;
          border: 1px solid;
        }

        .ab-value-title {
          font-family: 'Syne', sans-serif;
          font-size: 15px; font-weight: 800;
          letter-spacing: -0.01em;
          margin-bottom: 8px;
        }

        .ab-value-text { font-size: 12.5px; color: rgba(255,255,255,0.45); line-height: 1.65; }

        /* ── BOTTOM GRID ── */
        .ab-bottom {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media (min-width: 1024px) { .ab-bottom { grid-template-columns: 1.1fr 0.9fr; } }

        /* Products grid */
        .ab-products-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 16px;
        }

        .ab-product-pill {
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.025);
          padding: 10px 14px;
          font-size: 13px;
          color: rgba(255,255,255,0.6);
          transition: border-color 0.15s, color 0.15s, background 0.15s;
          display: flex; align-items: center; gap: 8px;
        }
        .ab-product-pill:hover {
          border-color: rgba(34,211,238,0.18);
          color: rgba(255,255,255,0.9);
          background: rgba(34,211,238,0.04);
        }
        .ab-product-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: rgba(34,211,238,0.5);
          flex-shrink: 0;
        }

        /* Why us */
        .ab-why-item {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 12px 14px;
          border-radius: 13px;
          border: 1px solid rgba(255,255,255,0.05);
          background: rgba(255,255,255,0.02);
          margin-bottom: 8px;
          font-size: 13px;
          color: rgba(255,255,255,0.55);
          line-height: 1.55;
        }

        .ab-why-check {
          width: 22px; height: 22px;
          border-radius: 7px;
          border: 1px solid rgba(34,211,238,0.2);
          background: rgba(34,211,238,0.07);
          display: flex; align-items: center; justify-content: center;
          color: rgba(34,211,238,0.8);
          flex-shrink: 0;
          margin-top: 1px;
        }
      `}</style>

      <div className="ab">

        {/* ── HERO ── */}
        <div className="ab-hero">
          <div className="ab-hero-eye">Sobre Diamond Grid</div>
          <h1 className="ab-hero-title">
            Tecnología, rendimiento y<br />
            <span>confianza en un solo lugar</span>
          </h1>
          <p className="ab-hero-text">
            En Diamond Grid somos apasionados por la tecnología y el hardware. Nuestro objetivo es
            ofrecer componentes de calidad, precios competitivos y una experiencia moderna para cada
            cliente. Nos enfocamos en brindar un servicio confiable para quienes buscan armar,
            mejorar o mantener sus equipos.
          </p>
        </div>

        {/* ── STATS ── */}
        <div className="ab-stats">
          {stats.map(s => (
            <div className="ab-stat" key={s.label}>
              <div className="ab-stat-val">{s.value}</div>
              <div className="ab-stat-label">{s.label}</div>
              <div className="ab-stat-desc">{s.desc}</div>
            </div>
          ))}
        </div>

        {/* ── MISIÓN + VISIÓN ── */}
        <div className="ab-2col">
          <div className="ab-panel">
            <div className="ab-panel-header">
              <div className="ab-panel-title">Nuestra misión</div>
            </div>
            <div className="ab-panel-body">
              <p className="ab-panel-text">
                Proporcionar productos tecnológicos y componentes de alto rendimiento, acompañados
                de una experiencia de compra clara, segura y moderna, adaptada a las necesidades
                de cada cliente.
              </p>
            </div>
          </div>

          <div className="ab-panel">
            <div className="ab-panel-header">
              <div className="ab-panel-title">Nuestra visión</div>
            </div>
            <div className="ab-panel-body">
              <p className="ab-panel-text">
                Convertirnos en una referencia en la comercialización de componentes tecnológicos,
                destacando por nuestra innovación, confiabilidad y compromiso con la satisfacción
                del cliente.
              </p>
            </div>
          </div>
        </div>

        {/* ── VALUES ── */}
        <div className="ab-values">
          {values.map(v => (
            <div
              className="ab-value-card"
              key={v.title}
              style={{ background: v.bg, borderColor: v.border }}
            >
              <div
                className="ab-value-icon"
                style={{ color: v.color, background: v.bg, borderColor: v.border }}
              >
                {v.icon}
              </div>
              <div className="ab-value-title" style={{ color: v.color }}>{v.title}</div>
              <div className="ab-value-text">{v.text}</div>
            </div>
          ))}
        </div>

        {/* ── PRODUCTOS + POR QUÉ ELEGIRNOS ── */}
        <div className="ab-bottom">
          <div className="ab-panel">
            <div className="ab-panel-header">
              <div className="ab-panel-title">¿Qué ofrecemos?</div>
            </div>
            <div className="ab-panel-body">
              <p className="ab-panel-text">
                Ponemos a disposición de nuestros clientes una selección de productos pensada para
                gamers, estudiantes, profesionales y entusiastas del hardware.
              </p>
              <div className="ab-products-grid">
                {products.map(p => (
                  <div className="ab-product-pill" key={p}>
                    <div className="ab-product-dot" />
                    {p}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="ab-panel" style={{ background: "linear-gradient(135deg, rgba(34,211,238,0.04), rgba(99,102,241,0.04))" }}>
            <div className="ab-panel-header">
              <div className="ab-panel-title">¿Por qué elegirnos?</div>
            </div>
            <div className="ab-panel-body">
              {whyUs.map((item, i) => (
                <div className="ab-why-item" key={i}>
                  <div className="ab-why-check"><CheckIcon /></div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}