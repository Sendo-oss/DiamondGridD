import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { API_BASE } from "../lib/api";
import { useCart } from "../app/cart";

// ── Icons ─────────────────────────────────────────────────────────────────────
const TrashIcon = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);
const ClearIcon = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);
const ShoppingIcon = () => (
  <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
  </svg>
);
const MinusIcon = () => (
  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
  </svg>
);
const PlusIcon = () => (
  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);
const ArrowLeftIcon = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

export function CartPage() {
  const { items = [], totalQty = 0, remove, setQty, clear } = useCart();

  const totalPrice = items.reduce(
    (acc, it) => acc + Number(it.price || 0) * Number(it.qty || 0),
    0
  ); const nav = useNavigate();

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        .cart { font-family: 'Inter', sans-serif; color: #fff; }
        .cart * { box-sizing: border-box; }

        /* ── HEADER ── */
        .cart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 14px;
          margin-bottom: 22px;
        }

        .cart-eye {
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: rgba(34,211,238,0.55);
          margin-bottom: 5px;
        }

        .cart-title {
          font-family: 'Syne', sans-serif;
          font-size: 26px; font-weight: 800;
          letter-spacing: -0.03em;
        }

        .cart-sub { font-size: 13px; color: rgba(255,255,255,0.38); margin-top: 4px; }

        .cart-clear-btn {
          display: flex; align-items: center; gap: 7px;
          border-radius: 11px;
          border: 1px solid rgba(244,63,94,0.2);
          background: rgba(244,63,94,0.07);
          padding: 8px 14px;
          font-size: 12.5px; font-weight: 500;
          color: rgba(252,165,165,0.8);
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: background 0.15s, color 0.15s;
        }
        .cart-clear-btn:hover { background: rgba(244,63,94,0.12); color: rgba(252,165,165,1); }
        .cart-clear-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        /* ── GRID ── */
        .cart-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          align-items: start;
        }
        @media (min-width: 1024px) {
          .cart-grid { grid-template-columns: 1fr 320px; }
        }

        /* ── ITEMS LIST ── */
        .cart-list { display: flex; flex-direction: column; gap: 10px; }

        /* ── ITEM CARD ── */
        .cart-item {
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.025);
          padding: 16px;
          display: flex;
          gap: 14px;
          transition: border-color 0.2s;
          backdrop-filter: blur(10px);
        }
        .cart-item:hover { border-color: rgba(255,255,255,0.11); }

        /* Image */
        .cart-img {
          width: 88px; height: 88px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.04);
          overflow: hidden;
          flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .cart-img img { width: 100%; height: 100%; object-fit: contain; }
        .cart-img-empty { font-size: 11px; color: rgba(255,255,255,0.2); text-align: center; padding: 8px; }

        /* Body */
        .cart-item-body { flex: 1; min-width: 0; }

        .cart-item-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 12px;
        }

        .cart-item-type { font-size: 10.5px; color: rgba(255,255,255,0.32); font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; }
        .cart-item-name { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; letter-spacing: -0.01em; }
        .cart-item-price { font-family: 'JetBrains Mono', monospace; font-size: 13.5px; color: rgba(34,211,238,0.8); font-weight: 500; margin-top: 3px; }

        .cart-remove-btn {
          display: flex; align-items: center; gap: 5px;
          border-radius: 10px;
          border: 1px solid rgba(244,63,94,0.15);
          background: rgba(244,63,94,0.06);
          padding: 6px 10px;
          font-size: 11.5px; font-weight: 500;
          color: rgba(252,165,165,0.7);
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: background 0.15s, color 0.15s;
          flex-shrink: 0;
          white-space: nowrap;
        }
        .cart-remove-btn:hover { background: rgba(244,63,94,0.12); color: rgba(252,165,165,1); }

        /* Qty controls */
        .cart-qty-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .cart-qty-controls {
          display: flex;
          align-items: center;
          border-radius: 11px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          overflow: hidden;
        }

        .cart-qty-btn {
          width: 34px; height: 34px;
          display: flex; align-items: center; justify-content: center;
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.5);
          transition: background 0.15s, color 0.15s;
        }
        .cart-qty-btn:hover { background: rgba(255,255,255,0.06); color: #fff; }

        .cart-qty-input {
          width: 44px; height: 34px;
          background: none; border: none;
          text-align: center;
          font-size: 13.5px; font-weight: 600;
          color: #fff;
          font-family: 'JetBrains Mono', monospace;
          outline: none;
          border-left: 1px solid rgba(255,255,255,0.06);
          border-right: 1px solid rgba(255,255,255,0.06);
        }
        .cart-qty-input::-webkit-outer-spin-button,
        .cart-qty-input::-webkit-inner-spin-button { -webkit-appearance: none; }

        .cart-stock-badge {
          font-size: 11px; color: rgba(255,255,255,0.3);
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
          padding: 3px 9px;
          font-family: 'JetBrains Mono', monospace;
        }

        .cart-item-subtotal {
          margin-left: auto;
          text-align: right;
          flex-shrink: 0;
        }
        .cart-item-subtotal-label { font-size: 10px; color: rgba(255,255,255,0.28); margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.07em; }
        .cart-item-subtotal-val { font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.85); }

        /* ── EMPTY STATE ── */
        .cart-empty {
          border-radius: 22px;
          border: 1px dashed rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.015);
          padding: 64px 32px;
          text-align: center;
        }
        .cart-empty-icon { color: rgba(255,255,255,0.1); margin: 0 auto 18px; }
        .cart-empty-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: rgba(255,255,255,0.5); margin-bottom: 8px; }
        .cart-empty-desc { font-size: 13px; color: rgba(255,255,255,0.25); }

        /* ── SUMMARY PANEL ── */
        .cart-summary {
          border-radius: 22px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.025);
          backdrop-filter: blur(14px);
          overflow: hidden;
          position: sticky;
          top: 88px;
        }

        .cart-summary-header {
          padding: 18px 22px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .cart-summary-title {
          font-family: 'Syne', sans-serif;
          font-size: 15px; font-weight: 700;
          letter-spacing: -0.02em;
        }

        .cart-summary-body { padding: 18px 22px; }

        .cart-summary-row {
          display: flex; align-items: center; justify-content: space-between;
          font-size: 13px; color: rgba(255,255,255,0.45);
          margin-bottom: 10px;
        }
        .cart-summary-row span:last-child {
          color: rgba(255,255,255,0.75); font-weight: 600;
          font-family: 'JetBrains Mono', monospace;
        }

        .cart-summary-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 14px 0; }

        .cart-summary-total {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 20px;
        }
        .cart-summary-total-label { font-size: 14px; color: rgba(255,255,255,0.5); }
        .cart-summary-total-val {
          font-family: 'Syne', sans-serif;
          font-size: 26px; font-weight: 800;
          color: rgba(34,211,238,0.9);
        }

        /* Checkout btn */
        .cart-checkout-btn {
          width: 100%;
          border-radius: 14px; border: none;
          background: linear-gradient(135deg, #22d3ee, #6366f1);
          padding: 14px;
          font-size: 14px; font-weight: 700;
          color: #fff; cursor: pointer;
          font-family: 'Inter', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 4px 22px rgba(34,211,238,0.22);
          transition: transform 0.15s, box-shadow 0.15s;
          position: relative; overflow: hidden;
          margin-bottom: 10px;
        }
        .cart-checkout-btn:hover:not(:disabled) { transform: scale(1.01); box-shadow: 0 5px 28px rgba(34,211,238,0.32); }
        .cart-checkout-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .cart-checkout-btn::after {
          content: '';
          position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          animation: cart-shine 3s infinite;
        }
        @keyframes cart-shine { to { left: 160%; } }

        .cart-continue-btn {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.025);
          padding: 11px;
          font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.45);
          cursor: pointer; font-family: 'Inter', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          transition: background 0.15s, color 0.15s;
        }
        .cart-continue-btn:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.75); }

        /* Security note */
        .cart-security {
          display: flex; align-items: center; gap: 7px;
          margin-top: 14px;
          font-size: 11px; color: rgba(255,255,255,0.2);
          justify-content: center;
        }
        .cart-security-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: rgba(45,212,191,0.6);
          box-shadow: 0 0 5px rgba(45,212,191,0.4);
          flex-shrink: 0;
        }
      `}</style>

      <div className="cart">
        {/* ── HEADER ── */}
        <div className="cart-header">
          <div>
            <p className="cart-eye">Diamond Grid</p>
            <h1 className="cart-title">Carrito de compras</h1>
            <p className="cart-sub">
              {items.length === 0
                ? "Tu carrito está vacío"
                : `${totalQty} producto${totalQty !== 1 ? "s" : ""} agregado${totalQty !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            className="cart-clear-btn"
            onClick={() => { if (!confirm("¿Vaciar carrito?")) return; clear(); }}
            disabled={items.length === 0}
          >
            <ClearIcon /> Vaciar carrito
          </button>
        </div>

        <div className="cart-grid">
          {/* ── ITEMS ── */}
          <div className="cart-list">
            {items.length === 0 ? (
              <div className="cart-empty">
                <div className="cart-empty-icon"><ShoppingIcon /></div>
                <div className="cart-empty-title">Tu carrito está vacío</div>
                <div className="cart-empty-desc">Ve al catálogo y agrega los componentes que necesitas.</div>
              </div>
            ) : items.map(it => (
              <div className="cart-item" key={it.id}>
                {/* Image */}
                <div className="cart-img">
                  {it.imageUrl
                    ? <img src={`${API_BASE}${it.imageUrl}`} alt={it.model} />
                    : <div className="cart-img-empty">Sin imagen</div>}
                </div>

                {/* Body */}
                <div className="cart-item-body">
                  <div className="cart-item-top">
                    <div>
                      <div className="cart-item-type">{it.type}</div>
                      <div className="cart-item-name">{it.brand} {it.model}</div>
                      <div className="cart-item-price">${Number(it.price).toFixed(2)}</div>
                    </div>
                    <button className="cart-remove-btn" onClick={() => remove(it.id)}>
                      <TrashIcon /> Eliminar
                    </button>
                  </div>

                  <div className="cart-qty-row">
                    {/* Stepper */}
                    <div className="cart-qty-controls">
                      <button className="cart-qty-btn" onClick={() => setQty(it.id, it.qty - 1)}>
                        <MinusIcon />
                      </button>
                      <input
                        className="cart-qty-input"
                        type="number"
                        value={it.qty}
                        onChange={e => setQty(it.id, Number(e.target.value))}
                      />
                      <button className="cart-qty-btn" onClick={() => setQty(it.id, it.qty + 1)}>
                        <PlusIcon />
                      </button>
                    </div>

                    {typeof it.stock === "number" && (
                      <span className="cart-stock-badge">Stock: {it.stock}</span>
                    )}

                    <div className="cart-item-subtotal">
                      <div className="cart-item-subtotal-label">Subtotal</div>
                      <div className="cart-item-subtotal-val">${(it.qty * Number(it.price)).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── SUMMARY ── */}
          <div className="cart-summary">
            <div className="cart-summary-header">
              <div className="cart-summary-title">Resumen del pedido</div>
            </div>
            <div className="cart-summary-body">
              <div className="cart-summary-row">
                <span>Productos ({totalQty})</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="cart-summary-row">
                <span>Envío</span>
                <span>$0.00</span>
              </div>

              <div className="cart-summary-divider" />

              <div className="cart-summary-total">
                <span className="cart-summary-total-label">Total</span>
                <span className="cart-summary-total-val">${totalPrice.toFixed(2)}</span>
              </div>

              <button
                className="cart-checkout-btn"
                disabled={items.length === 0}
                onClick={() => nav("/checkout")}
              >
                Proceder al pago <ArrowRightIcon />
              </button>

              <button className="cart-continue-btn" onClick={() => nav("/")}>
                <ArrowLeftIcon /> Seguir comprando
              </button>

              <div className="cart-security">
                <div className="cart-security-dot" />
                Pago verificado por el equipo Diamond Grid
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}