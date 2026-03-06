import { ReactNode, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../app/auth";
import { useCart } from "../app/cart";
import { API_BASE } from "../lib/api";
import { CategoriesMenu } from "./CategoriesMenu";

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();

  const cart = useCart();
  const isStaff = user?.role === "admin" || user?.role === "worker";
  const canShowCart = useMemo(() => !isStaff, [isStaff]);

  const [q, setQ] = useState("");
  const [openCategories, setOpenCategories] = useState(false);

  function doSearch() {
    const term = q.trim();
    if (!term) return;
    nav(`/?q=${encodeURIComponent(term)}`);
  }

  useEffect(() => {
    if (!isStaff) return;
    cart.setOpen(false);
    cart.clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  useEffect(() => {
    setOpenCategories(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-ink-950 text-white">
      {/* fondo */}
      <div className="pointer-events-none fixed inset-0 opacity-70">
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900 via-ink-950 to-ink-950" />
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-diamond-500/15 blur-3xl" />
        <div className="absolute bottom-[-180px] right-[-120px] h-[520px] w-[520px] rounded-full bg-diamond-300/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(34,211,238,0.10)_1px,transparent_0)] [background-size:22px_22px]" />
      </div>

      <header className="relative z-10 border-b border-white/10">
        {/* TOPBAR */}
        <div className="border-b border-white/10 bg-black/20">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2 text-xs text-white/70">
            <div className="flex items-center gap-4">
              <Link to="/about" className="hover:text-white">Preguntas Frecuentes</Link>
              <Link to="/contact" className="hover:text-white">Contacto</Link>
              <Link to="/profile" className="hover:text-white">Trackeo de Pedidos</Link>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-red-400">✓</span>
              <span>Los mejores precios del mercado</span>
            </div>
          </div>
        </div>

        {/* HEADER PRINCIPAL */}
        <div className="bg-ink-950/40 backdrop-blur-xl">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-3 px-6 py-4 md:grid-cols-[auto_1fr_auto] md:items-center">
            <Link to="/" className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-diamond-300 to-diamond-600 shadow-glow" />
              <div>
                <p className="text-xs text-white/60">Sistema de Componentes</p>
                <h1 className="text-lg font-semibold tracking-wide">Diamond Grid</h1>
              </div>
            </Link>

            {/* Buscador */}
            <div className="md:px-6">
              <div className="flex items-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") doSearch();
                  }}
                  placeholder="Buscar productos..."
                  className="w-full bg-transparent px-4 py-3 text-sm text-white/90 outline-none placeholder:text-white/40"
                />
                <button
                  onClick={doSearch}
                  className="px-4 py-3 text-white/80 hover:text-white"
                  title="Buscar"
                >
                  🔎
                </button>
              </div>
              <p className="mt-1 text-[11px] text-white/40">
                Tip: escribe marca o modelo (ej: Ryzen, RTX, Kingston…)
              </p>
            </div>

            {/* Derecha */}
            <div className="flex items-center justify-between gap-2 md:justify-end">
              {canShowCart && (
                <button
                  onClick={() => cart.setOpen(true)}
                  className="relative rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                  title="Carrito"
                >
                  🛒
                  {cart.count > 0 && (
                    <span className="absolute -right-2 -top-2 rounded-full bg-diamond-500 px-2 py-0.5 text-[11px] font-bold text-white shadow-glow">
                      {cart.count}
                    </span>
                  )}
                </button>
              )}

              {!user ? (
                <>
                  <Link
                    className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                    to="/login"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    className="rounded-2xl bg-gradient-to-r from-diamond-400 to-diamond-600 px-3 py-2 text-sm font-semibold shadow-glow"
                    to="/register"
                  >
                    Registrarse
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                    title="Ir a mi perfil"
                  >
                    {(user as any).avatarUrl ? (
                      <img
                        src={`${API_BASE}${(user as any).avatarUrl}`}
                        alt="avatar"
                        className="h-7 w-7 rounded-full object-cover border border-white/20"
                      />
                    ) : (
                      <div className="grid h-7 w-7 place-items-center rounded-full border border-white/20 bg-white/10 text-xs font-bold">
                        {(String((user as any).nickname || user.name || "U")[0] || "U").toUpperCase()}
                      </div>
                    )}

                    <span className="hidden sm:block max-w-[140px] truncate">
                      {(user as any).nickname ? `@${(user as any).nickname}` : user.name}
                    </span>

                    <span className="hidden md:inline text-white/50">•</span>
                    <span className="hidden md:inline text-xs text-white/60">{user.role}</span>
                  </Link>

                  {user.role === "admin" && (
                    <button
                      onClick={() => nav("/admin")}
                      className="rounded-2xl border border-diamond-300/20 bg-diamond-500/10 px-3 py-2 text-sm text-white/90 hover:bg-diamond-500/20"
                    >
                      Dashboard
                    </button>
                  )}

                  {user.role === "worker" && (
                    <button
                      onClick={() => nav("/worker")}
                      className="rounded-2xl border border-diamond-300/20 bg-diamond-500/10 px-3 py-2 text-sm text-white/90 hover:bg-diamond-500/20"
                    >
                      Panel
                    </button>
                  )}

                  <button
                    onClick={() => {
                      cart.setOpen(false);
                      cart.clear();
                      logout();
                      nav("/");
                    }}
                    className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                  >
                    Salir
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* NAVBAR */}
        <div className="border-t border-white/10 bg-black/15">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
            <div className="relative">
              <button
                onClick={() => setOpenCategories((v) => !v)}
                className="flex items-center gap-2 rounded-xl bg-diamond-600/20 px-4 py-2 text-sm font-semibold text-white hover:bg-diamond-600/30"
                title="Categorías"
              >
                ☰ Categorías
              </button>

              <CategoriesMenu
                open={openCategories}
                onClose={() => setOpenCategories(false)}
              />
            </div>

            <nav className="hidden md:flex items-center gap-6 text-sm text-white/80">
              <Link to="/" className="hover:text-white">Tienda</Link>
              <Link to="/news" className="hover:text-white">Noticias</Link>
              <Link to="/about" className="hover:text-white">Nosotros</Link>
              <Link to="/contact" className="hover:text-white">Contacto</Link>
              <Link to="/offers" className="text-diamond-200 hover:text-white">🔥 Ofertas</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-[1400px] px-6 py-8">
        {children}
      </main>

      <footer className="relative z-10 border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-4 text-sm text-white/60">
          © {new Date().getFullYear()} Diamond Grid
        </div>
      </footer>

      {/* Drawer carrito */}
      {canShowCart && cart.open && (
        <div className="fixed inset-0 z-[9999]">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => cart.setOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[420px] max-w-[100vw] border-l border-white/10 bg-ink-950/95 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <div>
                <p className="text-lg font-semibold">Carrito</p>
                <p className="text-xs text-white/60">{cart.count} item(s)</p>
              </div>
              <button
                onClick={() => cart.setOpen(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
              >
                Cerrar
              </button>
            </div>

            <div className="max-h-[calc(100vh-210px)] space-y-3 overflow-auto p-4">
              {cart.items.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                  Tu carrito está vacío.
                </div>
              ) : (
                cart.items.map((it) => (
                  <div key={it.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="flex gap-3">
                      {it.imageUrl ? (
                        <img
                          src={`${API_BASE}${it.imageUrl}`}
                          alt={it.model}
                          className="h-16 w-16 rounded-xl object-cover border border-white/10"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-xl border border-white/10 bg-white/5" />
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">
                          {it.brand} {it.model}
                        </p>
                        <p className="text-xs text-white/60">{it.type}</p>
                        <p className="mt-1 text-sm font-semibold text-diamond-200">
                          ${Number(it.price).toFixed(2)}
                        </p>

                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() => cart.dec(it.id)}
                            className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm hover:bg-white/10"
                          >
                            −
                          </button>
                          <span className="min-w-[28px] text-center text-sm">{it.qty}</span>
                          <button
                            onClick={() => cart.inc(it.id)}
                            className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm hover:bg-white/10"
                          >
                            +
                          </button>

                          <button
                            onClick={() => cart.remove(it.id)}
                            className="ml-auto rounded-lg border border-red-400/20 bg-red-500/10 px-2 py-1 text-sm text-red-200 hover:bg-red-500/20"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-white/10 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">Total</span>
                <span className="text-lg font-semibold text-diamond-200">
                  ${cart.total.toFixed(2)}
                </span>
              </div>

              <div className="mt-3 grid gap-2">
                <button
                  disabled={cart.items.length === 0}
                  onClick={() => {
                    if (!user) {
                      cart.setOpen(false);
                      nav("/login");
                      return;
                    }
                    cart.setOpen(false);
                    nav("/checkout");
                  }}
                  className="rounded-xl bg-gradient-to-r from-diamond-400 to-diamond-600 px-4 py-2 font-semibold shadow-glow disabled:opacity-50"
                >
                  Continuar
                </button>

                <button
                  disabled={cart.items.length === 0}
                  onClick={() => cart.clear()}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white/80 hover:bg-white/10 disabled:opacity-50"
                >
                  Vaciar carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}