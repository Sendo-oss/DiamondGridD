import { ReactNode, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../app/auth";
import { useCart } from "../app/cart";
import { API_BASE } from "../lib/api";
import { AnimatedBackground } from "./AnimatedBackground";

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();

  const cart = useCart();
  const isStaff = user?.role === "admin" || user?.role === "worker";
  const canShowCart = useMemo(() => !isStaff, [isStaff]);

  const [q, setQ] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  function doSearch() {
    const term = q.trim();
    if (!term) return;
    nav(`/?q=${encodeURIComponent(term)}`);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isStaff) return;
    cart.setOpen(false);
    cart.clear();
  }, [isStaff]);

  // ✅ CORRECTO
  useEffect(() => {
    if (!user) return;
    const p = location.pathname;
    const isAuthPage = p === "/login" || p === "/register";
    if (!isAuthPage) return;
    if (user.role === "admin") nav("/admin", { replace: true });
    else if (user.role === "worker") nav("/worker", { replace: true });
    else nav("/", { replace: true });
  }, [user, location.pathname, nav]);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const NAV_LINKS = [
    { to: "/", label: "Tienda" },
    { to: "/news", label: "Noticias" },
    { to: "/about", label: "Nosotros" },
    { to: "/contact", label: "Contacto" },
    { to: "/offers", label: "🔥 Ofertas", accent: true },
  ];

  const isActive = (to: string) => location.pathname === to;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-ink-950 text-white">
      <AnimatedBackground />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter:wght@300;400;500;600&display=swap');

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
        @keyframes brandMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 8px)); }
        }
        @keyframes animate-brand-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-brand-marquee { animation: animate-brand-marquee 24s linear infinite; }

        /* Layout base */
        .lyt { font-family: 'Inter', sans-serif; }
        .lyt * { box-sizing: border-box; }

        /* ── TOP BAR ── */
        .lyt-topbar {
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(0,0,0,0.25);
          padding: 6px 0;
        }

        .lyt-topbar-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 11.5px;
          color: rgba(255,255,255,0.45);
        }

        .lyt-topbar-links { display: flex; align-items: center; gap: 20px; }

        .lyt-topbar-link {
          color: rgba(255,255,255,0.45);
          text-decoration: none;
          transition: color 0.15s;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .lyt-topbar-link:hover { color: rgba(255,255,255,0.85); }

        .lyt-topbar-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          color: rgba(34,211,238,0.7);
          font-weight: 500;
        }

        .lyt-topbar-badge::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(34,211,238,0.8);
          box-shadow: 0 0 6px rgba(34,211,238,0.5);
          animation: pulse-dot 2s infinite;
        }

        @keyframes pulse-dot {
          0%,100% { opacity: 1; } 50% { opacity: 0.4; }
        }

        /* ── MAIN HEADER ── */
        .lyt-header {
          position: sticky;
          top: 0;
          z-index: 50;
          transition: background 0.25s, border-color 0.25s, backdrop-filter 0.25s, box-shadow 0.25s;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        .lyt-header.scrolled {
          background: rgba(5,10,20,0.88);
          backdrop-filter: blur(20px);
          border-bottom-color: rgba(255,255,255,0.1);
          box-shadow: 0 4px 24px rgba(0,0,0,0.4);
        }

        .lyt-header:not(.scrolled) {
          background: rgba(5,10,20,0.6);
          backdrop-filter: blur(14px);
        }

        .lyt-nav-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 28px;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 16px;
          height: 68px;
        }

        /* Logo */
        .lyt-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
        }

.lyt-logo img {
  height: 86px;
  width: auto;
  object-fit: contain;
  filter: brightness(1.4) drop-shadow(0 0 16px rgba(34,211,238,0.6));
  transition: filter 0.2s, transform 0.2s;
}
.lyt-logo:hover img {
  filter: brightness(1.6) drop-shadow(0 0 24px rgba(34,211,238,0.85));
  transform: scale(1.04);
}

        /* Search */
        .lyt-search {
          display: flex;
          align-items: center;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          overflow: hidden;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          max-width: 520px;
          margin: 0 auto;
          width: 100%;
        }
        .lyt-search:focus-within {
          border-color: rgba(34,211,238,0.25);
          background: rgba(255,255,255,0.06);
          box-shadow: 0 0 0 3px rgba(34,211,238,0.06);
        }

        .lyt-search input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          padding: 11px 14px;
          font-size: 13px;
          color: #fff;
          font-family: 'Inter', sans-serif;
        }
        .lyt-search input::placeholder { color: rgba(255,255,255,0.28); }

        .lyt-search-btn {
          padding: 10px 14px;
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.35);
          display: flex;
          align-items: center;
          transition: color 0.15s;
          border-left: 1px solid rgba(255,255,255,0.07);
        }
        .lyt-search-btn:hover { color: rgba(34,211,238,0.8); }

        /* Actions */
        .lyt-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .lyt-cart-btn {
          position: relative;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          padding: 9px 13px;
          cursor: pointer;
          font-size: 15px;
          color: rgba(255,255,255,0.8);
          transition: background 0.15s, border-color 0.15s;
          display: flex;
          align-items: center;
        }
        .lyt-cart-btn:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.14); }

        .lyt-cart-count {
          position: absolute;
          top: -7px;
          right: -7px;
          min-width: 18px;
          height: 18px;
          border-radius: 99px;
          background: linear-gradient(135deg, #22d3ee, #6366f1);
          font-size: 10px;
          font-weight: 700;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          border: 1.5px solid rgba(5,10,20,0.9);
        }

        .lyt-btn-ghost {
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          padding: 9px 14px;
          font-size: 12.5px;
          font-weight: 500;
          color: rgba(255,255,255,0.75);
          text-decoration: none;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: background 0.15s, color 0.15s;
          display: flex;
          align-items: center;
          gap: 7px;
          white-space: nowrap;
        }
        .lyt-btn-ghost:hover { background: rgba(255,255,255,0.08); color: #fff; }

        .lyt-btn-primary {
          border-radius: 12px;
          padding: 9px 16px;
          font-size: 12.5px;
          font-weight: 700;
          color: #fff;
          text-decoration: none;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #22d3ee, #6366f1);
          border: none;
          box-shadow: 0 3px 14px rgba(34,211,238,0.2);
          transition: transform 0.15s, box-shadow 0.15s;
          white-space: nowrap;
          display: flex;
          align-items: center;
        }
        .lyt-btn-primary:hover { transform: scale(1.02); box-shadow: 0 4px 20px rgba(34,211,238,0.3); }

        /* Avatar */
        .lyt-avatar {
          width: 30px;
          height: 30px;
          border-radius: 99px;
          overflow: hidden;
          flex-shrink: 0;
          border: 1.5px solid rgba(34,211,238,0.3);
        }
        .lyt-avatar img { width: 100%; height: 100%; object-fit: cover; }

        .lyt-avatar-initials {
          width: 30px;
          height: 30px;
          border-radius: 99px;
          border: 1.5px solid rgba(255,255,255,0.15);
          background: rgba(34,211,238,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: rgba(34,211,238,0.9);
          flex-shrink: 0;
        }

        .lyt-username {
          max-width: 110px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* ── NAV BAR (bottom strip) ── */
        .lyt-navbar {
          border-top: 1px solid rgba(255,255,255,0.06);
          background: rgba(0,0,0,0.18);
        }

        .lyt-navbar-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 28px;
          display: flex;
          align-items: center;
          gap: 2px;
          height: 44px;
        }

        .lyt-nav-link {
          padding: 6px 14px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap;
          position: relative;
        }
        .lyt-nav-link:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.9); }
        .lyt-nav-link.active {
          color: rgba(34,211,238,0.9);
          background: rgba(34,211,238,0.07);
        }
        .lyt-nav-link.accent { color: rgba(251,191,36,0.9); }
        .lyt-nav-link.accent:hover { background: rgba(251,191,36,0.07); color: rgba(251,191,36,1); }

        /* Mobile toggle */
        .lyt-mobile-toggle {
          display: none;
          border: none;
          background: none;
          cursor: pointer;
          color: rgba(255,255,255,0.7);
          padding: 6px;
        }

        @media (max-width: 768px) {
          .lyt-nav-inner { grid-template-columns: auto 1fr auto; }
          .lyt-search { display: none; }
          .lyt-navbar-inner { display: none; }
          .lyt-mobile-toggle { display: flex; }
          .lyt-username { display: none; }
        }

        /* Mobile drawer */
        .lyt-drawer {
          position: fixed;
          inset: 0;
          z-index: 100;
          pointer-events: none;
        }

        .lyt-drawer-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          opacity: 0;
          transition: opacity 0.25s;
        }

        .lyt-drawer.open .lyt-drawer-backdrop { opacity: 1; pointer-events: all; }

        .lyt-drawer-panel {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 280px;
          background: rgba(8,14,28,0.98);
          border-left: 1px solid rgba(255,255,255,0.08);
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          transform: translateX(100%);
          transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
          pointer-events: all;
        }

        .lyt-drawer.open .lyt-drawer-panel { transform: translateX(0); }

        .lyt-drawer-close {
          align-self: flex-end;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 6px 10px;
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          font-size: 16px;
          margin-bottom: 12px;
          font-family: 'Inter', sans-serif;
          transition: background 0.15s;
        }
        .lyt-drawer-close:hover { background: rgba(255,255,255,0.1); }

        .lyt-drawer-search {
          display: flex;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          overflow: hidden;
          margin-bottom: 8px;
        }
        .lyt-drawer-search input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          padding: 10px 14px;
          font-size: 13px;
          color: #fff;
          font-family: 'Inter', sans-serif;
        }
        .lyt-drawer-search input::placeholder { color: rgba(255,255,255,0.28); }
        .lyt-drawer-search button {
          padding: 10px 12px;
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.4);
          transition: color 0.15s;
        }
        .lyt-drawer-search button:hover { color: rgba(34,211,238,0.8); }

        .lyt-drawer-divider { height: 1px; background: rgba(255,255,255,0.07); margin: 8px 0; }

        .lyt-drawer-link {
          border-radius: 12px;
          padding: 11px 14px;
          font-size: 14px;
          font-weight: 500;
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
          display: block;
        }
        .lyt-drawer-link:hover { background: rgba(255,255,255,0.06); color: #fff; }
        .lyt-drawer-link.active { background: rgba(34,211,238,0.07); color: rgba(34,211,238,0.9); }
        .lyt-drawer-link.accent { color: rgba(251,191,36,0.85); }

        /* ── FOOTER ── */
        .lyt-footer {
          border-top: 1px solid rgba(255,255,255,0.07);
          background: rgba(0,0,0,0.2);
          margin-top: 48px;
        }

        .lyt-footer-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 32px 28px 24px;
          display: grid;
          gap: 28px;
          grid-template-columns: 1fr;
        }
        @media (min-width: 768px) {
          .lyt-footer-inner { grid-template-columns: 1.2fr 1fr 1fr 1fr; }
        }

        .lyt-footer-brand img {
          height: 40px;
          width: auto;
          object-fit: contain;
          opacity: 0.85;
          filter: drop-shadow(0 0 8px rgba(34,211,238,0.2));
        }

        .lyt-footer-tagline {
          font-size: 12.5px;
          color: rgba(255,255,255,0.4);
          margin-top: 10px;
          line-height: 1.6;
          max-width: 220px;
        }

        .lyt-footer-col-title {
          font-family: 'Syne', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          margin-bottom: 12px;
        }

        .lyt-footer-link {
          display: block;
          font-size: 13px;
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          margin-bottom: 8px;
          transition: color 0.15s;
        }
        .lyt-footer-link:hover { color: rgba(255,255,255,0.9); }

        .lyt-footer-bottom {
          max-width: 1400px;
          margin: 0 auto;
          padding: 14px 28px;
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          font-size: 11.5px;
          color: rgba(255,255,255,0.3);
        }

        .lyt-footer-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border-radius: 99px;
          border: 1px solid rgba(34,211,238,0.15);
          background: rgba(34,211,238,0.05);
          padding: 3px 10px;
          font-size: 10.5px;
          color: rgba(34,211,238,0.6);
        }
      `}</style>

      {/* ── TOP BAR ── */}
      <div className="lyt-topbar relative z-10">
        <div className="lyt-topbar-inner">
          <div className="lyt-topbar-links">
            <Link to="/about" className="lyt-topbar-link">Preguntas frecuentes</Link>
            <Link to="/contact" className="lyt-topbar-link">Contacto</Link>

          </div>
          <div className="lyt-topbar-badge">
            Los mejores precios del mercado
          </div>
        </div>
      </div>

      {/* ── HEADER ── */}
      <header className={`lyt-header lyt ${scrolled ? "scrolled" : ""}`}>
        <div className="lyt-nav-inner">

          {/* Logo */}
          <Link to="/" className="lyt-logo">
            <img src="/logo.png" alt="Diamond Grid" />
          </Link>

          {/* Search */}
          <div className="lyt-search">
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") doSearch(); }}
              placeholder="Buscar por marca o modelo…"
            />
            <button className="lyt-search-btn" onClick={doSearch} aria-label="Buscar">
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
              </svg>
            </button>
          </div>

          {/* Actions */}
          <div className="lyt-actions">
            {canShowCart && (
              <button className="lyt-cart-btn" onClick={() => nav("/cart")} aria-label="Carrito">
                <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
                {cart.count > 0 && (
                  <span className="lyt-cart-count">{cart.count}</span>
                )}
              </button>
            )}

            {!user ? (
              <>
                <Link to="/login" className="lyt-btn-ghost">Iniciar sesión</Link>
                <Link to="/register" className="lyt-btn-primary">Registrarse</Link>
              </>
            ) : (
              <>
                <Link to="/profile" className="lyt-btn-ghost">
                  {(user as any).avatarUrl ? (
                    <div className="lyt-avatar">
                      <img src={`${API_BASE}${(user as any).avatarUrl}`} alt={user.name} />
                    </div>
                  ) : (
                    <div className="lyt-avatar-initials">{(user.name || "U")[0].toUpperCase()}</div>
                  )}
                  <span className="lyt-username">{user.name}</span>
                </Link>
                <button
                  className="lyt-btn-ghost"
                  onClick={() => { cart.clear(); logout(); nav("/"); }}
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                  Salir
                </button>
              </>
            )}

            {/* Mobile toggle */}
            <button className="lyt-mobile-toggle" onClick={() => setMobileOpen(true)} aria-label="Menú">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
        </div>

        {/* Nav strip */}
        <div className="lyt-navbar">
          <div className="lyt-navbar-inner">
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`lyt-nav-link ${isActive(link.to) ? "active" : ""} ${(link as any).accent ? "accent" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* ── MOBILE DRAWER ── */}
      <div className={`lyt-drawer ${mobileOpen ? "open" : ""}`}>
        <div className="lyt-drawer-backdrop" onClick={() => setMobileOpen(false)} />
        <div className="lyt-drawer-panel">
          <button className="lyt-drawer-close" onClick={() => setMobileOpen(false)}>✕</button>

          <div className="lyt-drawer-search">
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { doSearch(); setMobileOpen(false); } }}
              placeholder="Buscar productos…"
            />
            <button onClick={() => { doSearch(); setMobileOpen(false); }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
              </svg>
            </button>
          </div>

          <div className="lyt-drawer-divider" />

          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`lyt-drawer-link ${isActive(link.to) ? "active" : ""} ${(link as any).accent ? "accent" : ""}`}
            >
              {link.label}
            </Link>
          ))}

          <div className="lyt-drawer-divider" />
          <Link to="/about" className="lyt-drawer-link">Preguntas frecuentes</Link>
          <Link to="/contact" className="lyt-drawer-link">Contacto</Link>

          {!user ? (
            <>
              <div className="lyt-drawer-divider" />
              <Link to="/login" className="lyt-drawer-link">Iniciar sesión</Link>
              <Link to="/register" className="lyt-drawer-link" style={{ color: "rgba(34,211,238,0.85)", fontWeight: 600 }}>Registrarse</Link>
            </>
          ) : (
            <>
              <div className="lyt-drawer-divider" />
              <Link to="/profile" className="lyt-drawer-link" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="lyt-avatar-initials">{(user.name || "U")[0].toUpperCase()}</div>
                <span>{user.name}</span>
              </Link>
              <button
                onClick={() => { cart.clear(); logout(); nav("/"); setMobileOpen(false); }}
                className="lyt-drawer-link"
                style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", color: "rgba(252,165,165,0.8)", fontFamily: "Inter, sans-serif", width: "100%", padding: "11px 14px" }}
              >
                Cerrar sesión
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="relative z-10 mx-auto w-full max-w-[1400px] px-6 py-8 lyt">
        {children}
      </main>

      {/* ── FOOTER ── */}
      <footer className="lyt-footer relative z-10 lyt">
        <div className="lyt-footer-inner">
          <div className="lyt-footer-brand">
            <img src="/logo.png" alt="Diamond Grid" />
            <p className="lyt-footer-tagline">
              Componentes de calidad para gamers, estudiantes y creadores de contenido en Ecuador.
            </p>
          </div>

          <div>
            <p className="lyt-footer-col-title">Tienda</p>
            <Link to="/" className="lyt-footer-link">Catálogo</Link>
            <Link to="/offers" className="lyt-footer-link">Ofertas</Link>
            <Link to="/news" className="lyt-footer-link">Noticias</Link>
          </div>

          <div>
            <p className="lyt-footer-col-title">Empresa</p>
            <Link to="/about" className="lyt-footer-link">Nosotros</Link>
            <Link to="/contact" className="lyt-footer-link">Contacto</Link>
            <Link to="/about" className="lyt-footer-link">Preguntas frecuentes</Link>
          </div>

          <div>
            <p className="lyt-footer-col-title">Mi cuenta</p>
            <Link to="/profile" className="lyt-footer-link">Mi perfil</Link>
            <Link to="/profile" className="lyt-footer-link">Mis pedidos</Link>
            {!user && <Link to="/login" className="lyt-footer-link">Iniciar sesión</Link>}
            {!user && <Link to="/register" className="lyt-footer-link">Registrarse</Link>}
          </div>
        </div>

        <div className="lyt-footer-bottom">
          <span>© {new Date().getFullYear()} Diamond Grid. Todos los derechos reservados.</span>
          <span className="lyt-footer-badge">
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(34,211,238,0.8)" }} />
            Ecuador
          </span>
        </div>
      </footer>
    </div>
  );
}