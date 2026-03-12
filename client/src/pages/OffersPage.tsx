import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { API_BASE, fetchComponents } from "../lib/api";
import { Link } from "react-router-dom";
import { useCart } from "../app/cart";

// ── Icons ─────────────────────────────────────────────────────────────────────
const CartIcon = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
  </svg>
);
const EyeIcon = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const TagIcon = () => (
  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
  </svg>
);

export function OffersPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const cart = useCart();

  useEffect(() => {
    fetchComponents()
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setItems(list.slice(0, 6));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        .off { font-family: 'Inter', sans-serif; color: #fff; }
        .off * { box-sizing: border-box; }

        /* ── HERO ── */
        .off-hero {
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
          position: relative;
          overflow: hidden;
        }

        .off-hero::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(251,191,36,0.4), rgba(251,146,60,0.4), transparent);
        }

        .off-hero-eye {
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: rgba(251,191,36,0.7);
          margin-bottom: 5px;
        }

        .off-hero-title {
          font-family: 'Syne', sans-serif;
          font-size: 26px; font-weight: 800; letter-spacing: -0.03em;
        }

        .off-hero-sub { font-size: 13px; color: rgba(255,255,255,0.38); margin-top: 4px; }

        .off-hero-badge {
          display: inline-flex; align-items: center; gap: 7px;
          border-radius: 14px;
          border: 1px solid rgba(251,191,36,0.2);
          background: rgba(251,191,36,0.07);
          padding: 8px 16px;
          font-family: 'Syne', sans-serif;
          font-size: 18px; font-weight: 800;
          color: rgba(251,191,36,0.9);
        }

        /* ── BANNER (top featured strip) ── */
        .off-banner {
          border-radius: 18px;
          border: 1px solid rgba(251,191,36,0.15);
          background: linear-gradient(135deg, rgba(251,191,36,0.06), rgba(251,146,60,0.04));
          padding: 14px 20px;
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .off-banner-fire { font-size: 20px; }

        .off-banner-text {
          font-size: 13px; color: rgba(255,255,255,0.55);
          flex: 1;
        }

        .off-banner-text strong { color: rgba(251,191,36,0.9); font-weight: 700; }

        .off-banner-pill {
          border-radius: 8px;
          border: 1px solid rgba(251,191,36,0.2);
          background: rgba(251,191,36,0.08);
          padding: 4px 12px;
          font-size: 11px; font-weight: 700;
          color: rgba(251,191,36,0.85);
          letter-spacing: 0.06em; text-transform: uppercase;
          white-space: nowrap;
        }

        /* ── GRID ── */
        .off-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media (min-width: 640px)  { .off-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .off-grid { grid-template-columns: repeat(3, 1fr); } }

        /* ── CARD ── */
        .off-card {
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.025);
          overflow: hidden;
          transition: border-color 0.22s, transform 0.22s;
          position: relative;
        }
        .off-card:hover {
          border-color: rgba(251,191,36,0.18);
          transform: translateY(-3px);
        }

        /* Offer ribbon */
        .off-ribbon {
          position: absolute;
          top: 12px; left: 12px;
          z-index: 2;
          border-radius: 8px;
          border: 1px solid rgba(251,191,36,0.25);
          background: rgba(251,191,36,0.12);
          padding: 3px 10px;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: rgba(251,191,36,0.9);
          display: flex; align-items: center; gap: 4px;
          backdrop-filter: blur(6px);
        }

        /* Image */
        .off-img {
          height: 168px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.03);
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
          position: relative;
        }

        .off-img img {
          width: 100%; height: 100%;
          object-fit: contain;
          padding: 12px;
          transition: transform 0.3s ease;
        }
        .off-card:hover .off-img img { transform: scale(1.04); }

        .off-img-placeholder {
          width: 100%; height: 100%;
          background: linear-gradient(135deg, rgba(251,191,36,0.05), rgba(99,102,241,0.05));
        }

        /* Overlay on hover */
        .off-img-overlay {
          position: absolute; inset: 0;
          background: rgba(0,0,0,0.45);
          display: flex; align-items: center; justify-content: center; gap: 8px;
          opacity: 0;
          transition: opacity 0.22s;
        }
        .off-card:hover .off-img-overlay { opacity: 1; }

        .off-overlay-btn {
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(8px);
          padding: 8px 12px;
          font-size: 11.5px; font-weight: 600;
          color: rgba(255,255,255,0.9);
          cursor: pointer; font-family: 'Inter', sans-serif;
          display: flex; align-items: center; gap: 5px;
          transition: background 0.15s;
          text-decoration: none;
        }
        .off-overlay-btn:hover { background: rgba(255,255,255,0.18); }
        .off-overlay-btn.primary {
          background: linear-gradient(135deg, rgba(34,211,238,0.7), rgba(99,102,241,0.7));
          border-color: transparent;
        }

        /* Body */
        .off-card-body { padding: 14px 16px; }

        .off-card-type {
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          margin-bottom: 4px;
        }

        .off-card-name {
          font-family: 'Syne', sans-serif;
          font-size: 15px; font-weight: 700;
          letter-spacing: -0.01em;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .off-card-footer {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 12px; gap: 8px;
        }

        .off-price {
          font-family: 'JetBrains Mono', monospace;
          font-size: 16px; font-weight: 700;
          color: rgba(34,211,238,0.9);
        }

        .off-price-old {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: rgba(255,255,255,0.25);
          text-decoration: line-through;
          margin-left: 4px;
        }

        .off-add-btn {
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #22d3ee, #6366f1);
          padding: 7px 12px;
          font-size: 11.5px; font-weight: 700; color: #fff;
          cursor: pointer; font-family: 'Inter', sans-serif;
          display: flex; align-items: center; gap: 5px;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 2px 10px rgba(34,211,238,0.2);
          white-space: nowrap;
        }
        .off-add-btn:hover { transform: scale(1.03); box-shadow: 0 3px 14px rgba(34,211,238,0.3); }
        .off-add-btn.added {
          background: rgba(45,212,191,0.15);
          border: 1px solid rgba(45,212,191,0.25);
          color: rgba(94,234,212,0.9);
          box-shadow: none;
        }

        /* ── SKELETON ── */
        .off-skeleton {
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
          overflow: hidden;
        }

        .off-skel-img {
          height: 168px;
          background: rgba(255,255,255,0.04);
          position: relative; overflow: hidden;
        }
        .off-skel-img::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.04) 50%, transparent 70%);
          animation: off-shimmer 1.6s infinite;
        }
        @keyframes off-shimmer { from { transform: translateX(-100%); } to { transform: translateX(100%); } }

        .off-skel-body { padding: 14px 16px; }
        .off-skel-line {
          border-radius: 6px;
          background: rgba(255,255,255,0.05);
          animation: off-shimmer 1.6s infinite;
        }

        /* ── EMPTY ── */
        .off-empty {
          grid-column: 1 / -1;
          text-align: center;
          padding: 64px 24px;
          color: rgba(255,255,255,0.25);
        }
        .off-empty-icon { font-size: 40px; margin-bottom: 14px; opacity: 0.4; }
      `}</style>

      <div className="off">
        {/* ── HERO ── */}
        <div className="off-hero">
          <div>
            <p className="off-hero-eye">Diamond Grid</p>
            <h1 className="off-hero-title">🔥 Ofertas especiales</h1>
            <p className="off-hero-sub">Productos destacados con los mejores precios del mercado.</p>
          </div>
          <div className="off-hero-badge">
            <TagIcon />
            Hasta 20% OFF
          </div>
        </div>

        {/* ── PROMO BANNER ── */}
        <div className="off-banner">
          <div className="off-banner-fire">⚡</div>
          <div className="off-banner-text">
            <strong>Tiempo limitado.</strong> Aprovecha estos precios en componentes seleccionados — stock disponible mientras dure.
          </div>
          <div className="off-banner-pill">Oferta activa</div>
        </div>

        {/* ── GRID ── */}
        <div className="off-grid">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div className="off-skeleton" key={i}>
                  <div className="off-skel-img" />
                  <div className="off-skel-body">
                    <div className="off-skel-line" style={{ height: 10, width: "40%", marginBottom: 8 }} />
                    <div className="off-skel-line" style={{ height: 14, width: "70%", marginBottom: 16 }} />
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div className="off-skel-line" style={{ height: 18, width: "30%" }} />
                      <div className="off-skel-line" style={{ height: 30, width: "35%", borderRadius: 10 }} />
                    </div>
                  </div>
                </div>
              ))
            : items.length === 0
              ? (
                <div className="off-empty">
                  <div className="off-empty-icon">🏷️</div>
                  No hay ofertas disponibles en este momento.
                </div>
              )
              : items.map(c => (
                  <OfferCard key={c.id} item={c} onAdd={() => cart.add({ ...c, qty: 1 })} />
                ))
          }
        </div>
      </div>
    </Layout>
  );
}

// ── OfferCard ────────────────────────────────────────────────────────────────
function OfferCard({ item: c, onAdd }: { item: any; onAdd: () => void }) {
  const [added, setAdded] = useState(false);

  function handleAdd() {
    onAdd();
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  // Simulate a crossed-out original price (+15%)
  const fakeOld = (Number(c.price) * 1.15).toFixed(2);

  return (
    <div className="off-card">
      <div className="off-ribbon">
        <TagIcon /> Oferta
      </div>

      {/* Image with overlay */}
      <div className="off-img">
        {c.imageUrl
          ? <img src={`${API_BASE}${c.imageUrl}`} alt={`${c.brand} ${c.model}`} />
          : <div className="off-img-placeholder" />}

        <div className="off-img-overlay">
          <Link to={`/components/${c.id}`} className="off-overlay-btn">
            <EyeIcon /> Ver
          </Link>
          <button className="off-overlay-btn primary" onClick={handleAdd}>
            <CartIcon /> Agregar
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="off-card-body">
        <div className="off-card-type">{c.type}</div>
        <div className="off-card-name">{c.brand} {c.model}</div>

        <div className="off-card-footer">
          <div>
            <span className="off-price">${Number(c.price).toFixed(2)}</span>
            <span className="off-price-old">${fakeOld}</span>
          </div>
          <button
            className={`off-add-btn ${added ? "added" : ""}`}
            onClick={handleAdd}
          >
            <CartIcon />
            {added ? "Agregado ✓" : "Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
}