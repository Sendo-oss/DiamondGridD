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

  function doSearch() {
    const term = q.trim();
    if (!term) return;
    nav(`/?q=${encodeURIComponent(term)}`);
  }

  useEffect(() => {
    if (!isStaff) return;
    cart.setOpen(false);
    cart.clear();
  }, [isStaff]);

  useEffect(() => {
    if (!user) return;

    const p = location.pathname;
    const isAuthPage = p === "/login" || p === "/register";
    if (!isAuthPage) return;

    if (user.role === "admin") nav("/admin", { replace: true });
    else if (user.role === "worker") nav("/worker", { replace: true });
    else nav("/", { replace: true });
  }, [user, location.pathname, nav]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-ink-950 text-white">

      {/* Fondo animado */}
      <AnimatedBackground />

      {/* Animaciones globales */}
      <style>{`
        @keyframes dgPulse {
          0%,100% { transform: translateX(-50%) translateY(0px) scale(1); opacity:.8 }
          50% { transform: translateX(-50%) translateY(18px) scale(1.08); opacity:1 }
        }

        @keyframes dgFloatRight {
          0%,100% { transform: translate(0,0); opacity:.7 }
          50% { transform: translate(-30px,-20px); opacity:1 }
        }
        @keyframes brandMarquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(calc(-50% - 8px));
  }
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
          10% { opacity:1 }
          40% { opacity:.7 }
          100% { transform: translateX(200%); opacity:0 }
        }

        @keyframes dgSweepReverse {
          0% { transform: translateX(20%); opacity:0 }
          10% { opacity:1 }
          40% { opacity:.7 }
          100% { transform: translateX(-200%); opacity:0 }
        }
      `}</style>

      {/* HEADER */}
      <header className="relative z-10 border-b border-white/10">

        {/* top bar */}
        <div className="border-b border-white/10 bg-black/20">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2 text-xs text-white/70">

            <div className="flex items-center gap-4">
              <Link to="/about" className="hover:text-white">
                Preguntas Frecuentes
              </Link>

              <Link to="/contact" className="hover:text-white">
                Contacto
              </Link>

              <Link to="/profile" className="hover:text-white">
                Trackeo de Pedidos
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-red-400">✓</span>
              <span>Los mejores precios del mercado</span>
            </div>

          </div>
        </div>

        {/* navbar principal */}
        <div className="bg-ink-950/40 backdrop-blur-xl">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-3 px-6 py-4 md:grid-cols-[auto_1fr_auto] md:items-center">

            {/* logo */}
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Diamond Grid"
                className="h-25 w-auto max-w-[220px] object-contain drop-shadow-[0_0_12px_rgba(34,211,238,0.35)]"
              />
            </Link>
            {/* buscador */}
            <div className="md:px-6">
              <div className="flex items-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">


                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") doSearch();
                  }}
                  placeholder="Buscar productos..."
                  className="w-full bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-white/40"
                />

                <button
                  onClick={doSearch}
                  className="px-4 py-3 text-white/80 hover:text-white"
                >
                  🔎
                </button>

              </div>

              <p className="mt-1 text-[11px] text-white/40">
                Tip: escribe marca o modelo (Ryzen, RTX, Kingston…)
              </p>

            </div>

            {/* acciones */}
            <div className="flex items-center justify-end gap-2">

              {canShowCart && (
                <button
                  onClick={() => cart.setOpen(true)}
                  className="relative rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                >
                  🛒

                  {cart.count > 0 && (
                    <span className="absolute -right-2 -top-2 rounded-full bg-diamond-500 px-2 py-0.5 text-[11px] font-bold">
                      {cart.count}
                    </span>
                  )}

                </button>
              )}

              {!user ? (
                <>
                  <Link
                    to="/login"
                    className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                  >
                    Iniciar sesión
                  </Link>

                  <Link
                    to="/register"
                    className="rounded-2xl bg-gradient-to-r from-diamond-400 to-diamond-600 px-3 py-2 text-sm font-semibold shadow-glow"
                  >
                    Registrarse
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                  >
                    {(user as any).avatarUrl ? (
                      <img
                        src={`${API_BASE}${(user as any).avatarUrl}`}
                        className="h-7 w-7 rounded-full"
                      />
                    ) : (
                      <div className="grid h-7 w-7 place-items-center rounded-full border border-white/20 bg-white/10 text-xs font-bold">
                        {(user.name || "U")[0].toUpperCase()}
                      </div>
                    )}

                    <span className="hidden sm:block truncate max-w-[120px]">
                      {user.name}
                    </span>
                  </Link>

                  <button
                    onClick={() => {
                      cart.clear();
                      logout();
                      nav("/");
                    }}
                    className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                  >
                    Salir
                  </button>
                </>
              )}

            </div>

          </div>
        </div>

        {/* menu */}
        <div className="border-t border-white/10 bg-black/15">
          <div className="mx-auto flex max-w-6xl justify-center px-6 py-3">
            <nav className="hidden md:flex items-center gap-8 text-sm text-white/80">
              <Link to="/">Tienda</Link>
              <Link to="/news">Noticias</Link>
              <Link to="/about">Nosotros</Link>
              <Link to="/contact">Contacto</Link>
              <Link to="/offers" className="text-diamond-200">
                🔥 Ofertas
              </Link>
            </nav>
          </div>
        </div>

      </header>

      {/* CONTENIDO */}
      <main className="relative z-10 mx-auto w-full max-w-[1400px] px-6 py-8">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-4 text-sm text-white/60">
          © {new Date().getFullYear()} Diamond Grid
        </div>
      </footer>

    </div>
  );
}