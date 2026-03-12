import { useState } from "react";
import { Layout } from "../components/Layout";

const news = [
  {
    id: 1,
    title: "Nuevas GPUs disponibles",
    text: "Ya contamos con nuevas tarjetas gráficas de última generación en Diamond Grid. Modelos RTX 5000 y RX 9000 con stock limitado disponible ahora mismo en nuestra tienda.",
    date: "10 de marzo de 2026",
    category: "Productos",
    featured: true,
  },
  {
    id: 2,
    title: "Promoción en SSD NVMe",
    text: "Aprovecha descuentos especiales en almacenamiento de alto rendimiento. Unidades Samsung 990 Pro y WD Black SN850X con hasta 20% de descuento por tiempo limitado.",
    date: "8 de marzo de 2026",
    category: "Promociones",
    featured: false,
  },
  {
    id: 3,
    title: "Más stock en procesadores AMD",
    text: "Hemos renovado inventario de procesadores Ryzen 9000 series para gaming y trabajo profesional. Disponibles en todas las configuraciones de núcleos.",
    date: "5 de marzo de 2026",
    category: "Inventario",
    featured: false,
  },
  {
    id: 4,
    title: "Nuevas motherboards Intel Z890",
    text: "Placas base compatibles con los últimos procesadores Core Ultra 200 series ahora en stock. Marcas ASUS, MSI y Gigabyte disponibles.",
    date: "2 de marzo de 2026",
    category: "Productos",
    featured: false,
  },
  {
    id: 5,
    title: "Envíos a todo Ecuador",
    text: "Ampliamos nuestra red de envíos para cubrir todas las provincias del país con tiempos de entrega reducidos y seguimiento en tiempo real.",
    date: "28 de febrero de 2026",
    category: "Empresa",
    featured: false,
  },
];

const CATEGORY_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  Productos:   { color: "rgba(34,211,238,0.9)",  bg: "rgba(34,211,238,0.08)",  border: "rgba(34,211,238,0.2)"  },
  Promociones: { color: "rgba(251,191,36,0.9)",  bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.2)"  },
  Inventario:  { color: "rgba(52,211,153,0.9)",  bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.2)"  },
  Empresa:     { color: "rgba(196,181,253,0.9)", bg: "rgba(139,92,246,0.08)",  border: "rgba(139,92,246,0.2)"  },
};

const ALL_CATEGORIES = ["Todos", ...Object.keys(CATEGORY_STYLES)];

const ArrowIcon = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

export function NewsPage() {
  const [activeCategory, setActiveCategory] = useState("Todos");

  const filtered = activeCategory === "Todos"
    ? news
    : news.filter(n => n.category === activeCategory);

  const featured = filtered.find(n => n.featured) ?? filtered[0];
  const rest = filtered.filter(n => n.id !== featured?.id);

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        .news { font-family: 'Inter', sans-serif; color: #fff; }
        .news * { box-sizing: border-box; }

        /* ── PAGE HEADER ── */
        .news-hero {
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.025);
          backdrop-filter: blur(14px);
          padding: 28px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }

        .news-hero-eye {
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: rgba(34,211,238,0.55);
          margin-bottom: 5px;
        }

        .news-hero-title {
          font-family: 'Syne', sans-serif;
          font-size: 26px; font-weight: 800;
          letter-spacing: -0.03em;
        }

        .news-hero-sub { font-size: 13px; color: rgba(255,255,255,0.38); margin-top: 4px; }

        .news-count-badge {
          display: inline-flex; align-items: center; gap: 6px;
          border-radius: 99px;
          border: 1px solid rgba(34,211,238,0.15);
          background: rgba(34,211,238,0.05);
          padding: 6px 14px;
          font-size: 12px; font-weight: 600;
          color: rgba(34,211,238,0.7);
          font-family: 'JetBrains Mono', monospace;
        }

        /* ── FILTER PILLS ── */
        .news-filters {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 22px;
        }

        .news-filter-pill {
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          padding: 7px 14px;
          font-size: 12.5px; font-weight: 500;
          color: rgba(255,255,255,0.4);
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: all 0.18s;
          white-space: nowrap;
        }
        .news-filter-pill:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.8); }
        .news-filter-pill.active {
          background: rgba(34,211,238,0.08);
          border-color: rgba(34,211,238,0.22);
          color: rgba(34,211,238,0.9);
        }

        /* ── FEATURED CARD ── */
        .news-featured {
          border-radius: 22px;
          border: 1px solid rgba(34,211,238,0.12);
          background: rgba(34,211,238,0.03);
          padding: 28px;
          margin-bottom: 16px;
          position: relative;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .news-featured:hover { border-color: rgba(34,211,238,0.22); }

        .news-featured::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(34,211,238,0.3), transparent);
        }

        .news-featured-tag {
          display: inline-flex; align-items: center; gap: 5px;
          border-radius: 8px;
          border: 1px solid rgba(34,211,238,0.2);
          background: rgba(34,211,238,0.08);
          padding: 3px 10px;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(34,211,238,0.8);
          margin-bottom: 16px;
        }

        .news-featured-tag::before {
          content: '';
          width: 5px; height: 5px; border-radius: 50%;
          background: rgba(34,211,238,0.8);
          box-shadow: 0 0 5px rgba(34,211,238,0.5);
          animation: news-blink 2s infinite;
        }
        @keyframes news-blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .news-featured-title {
          font-family: 'Syne', sans-serif;
          font-size: 22px; font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 10px;
          line-height: 1.3;
        }

        .news-featured-text {
          font-size: 14px;
          color: rgba(255,255,255,0.55);
          line-height: 1.7;
          max-width: 640px;
          margin-bottom: 20px;
        }

        .news-featured-footer {
          display: flex; align-items: center;
          justify-content: space-between;
          flex-wrap: wrap; gap: 12px;
        }

        /* ── GRID ── */
        .news-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media (min-width: 640px)  { .news-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .news-grid { grid-template-columns: repeat(3, 1fr); } }

        /* ── CARD ── */
        .news-card {
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.025);
          padding: 20px;
          display: flex;
          flex-direction: column;
          transition: border-color 0.2s, transform 0.2s, background 0.2s;
          cursor: default;
        }
        .news-card:hover {
          border-color: rgba(255,255,255,0.13);
          background: rgba(255,255,255,0.035);
          transform: translateY(-2px);
        }

        .news-card-header {
          display: flex; align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 14px;
        }

        .news-cat-badge {
          border-radius: 8px;
          padding: 3px 10px;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.07em; text-transform: uppercase;
        }

        .news-date {
          font-size: 11px;
          color: rgba(255,255,255,0.28);
          font-family: 'JetBrains Mono', monospace;
          white-space: nowrap;
        }

        .news-card-title {
          font-family: 'Syne', sans-serif;
          font-size: 15px; font-weight: 700;
          letter-spacing: -0.01em;
          line-height: 1.35;
          margin-bottom: 10px;
        }

        .news-card-text {
          font-size: 12.5px;
          color: rgba(255,255,255,0.45);
          line-height: 1.65;
          flex: 1;
          margin-bottom: 18px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* ── READ MORE BTN ── */
        .news-read-btn {
          display: inline-flex; align-items: center; gap: 7px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          padding: 8px 14px;
          font-size: 12px; font-weight: 500;
          color: rgba(255,255,255,0.5);
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
          width: fit-content;
          border: none; background: none;
        }
        .news-read-btn:hover { color: rgba(34,211,238,0.9); }

        .news-read-btn-primary {
          display: inline-flex; align-items: center; gap: 7px;
          border-radius: 11px;
          border: 1px solid rgba(34,211,238,0.2);
          background: rgba(34,211,238,0.07);
          padding: 9px 16px;
          font-size: 13px; font-weight: 600;
          color: rgba(34,211,238,0.85);
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: background 0.15s, color 0.15s;
        }
        .news-read-btn-primary:hover { background: rgba(34,211,238,0.12); color: rgba(34,211,238,1); }

        /* ── EMPTY ── */
        .news-empty {
          grid-column: 1 / -1;
          text-align: center;
          padding: 56px 24px;
          color: rgba(255,255,255,0.25);
          font-size: 13.5px;
        }
        .news-empty-icon { font-size: 36px; margin-bottom: 14px; opacity: 0.4; }
      `}</style>

      <div className="news">
        {/* ── HERO ── */}
        <div className="news-hero">
          <div>
            <p className="news-hero-eye">Diamond Grid</p>
            <h1 className="news-hero-title">Noticias</h1>
            <p className="news-hero-sub">Novedades, promociones y actualizaciones del equipo.</p>
          </div>
          <div className="news-count-badge">{news.length} publicaciones</div>
        </div>

        {/* ── FILTERS ── */}
        <div className="news-filters">
          {ALL_CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`news-filter-pill ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="news-empty">
            <div className="news-empty-icon">📰</div>
            No hay noticias en esta categoría.
          </div>
        ) : (
          <>
            {/* ── FEATURED ── */}
            {featured && (
              <div className="news-featured">
                <div className="news-featured-tag">Destacado</div>

                {(() => {
                  const cs = CATEGORY_STYLES[featured.category] ?? CATEGORY_STYLES["Productos"];
                  return (
                    <span
                      className="news-cat-badge"
                      style={{ color: cs.color, background: cs.bg, border: `1px solid ${cs.border}`, display: "inline-block", marginBottom: 10 }}
                    >
                      {featured.category}
                    </span>
                  );
                })()}

                <div className="news-featured-title">{featured.title}</div>
                <div className="news-featured-text">{featured.text}</div>

                <div className="news-featured-footer">
                  <button className="news-read-btn-primary">
                    Leer artículo completo <ArrowIcon />
                  </button>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "JetBrains Mono, monospace" }}>
                    {featured.date}
                  </span>
                </div>
              </div>
            )}

            {/* ── GRID ── */}
            {rest.length > 0 && (
              <div className="news-grid">
                {rest.map(n => {
                  const cs = CATEGORY_STYLES[n.category] ?? CATEGORY_STYLES["Productos"];
                  return (
                    <article className="news-card" key={n.id}>
                      <div className="news-card-header">
                        <span
                          className="news-cat-badge"
                          style={{ color: cs.color, background: cs.bg, border: `1px solid ${cs.border}` }}
                        >
                          {n.category}
                        </span>
                        <span className="news-date">{n.date}</span>
                      </div>

                      <div className="news-card-title">{n.title}</div>
                      <div className="news-card-text">{n.text}</div>

                      <button className="news-read-btn">
                        Leer más <ArrowIcon />
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}