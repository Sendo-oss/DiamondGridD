import { useEffect, useMemo, useState } from "react";
import { Layout } from "../components/Layout";
import { Chatbot } from "../components/Chatbot";
import { API_BASE, fetchComponents } from "../lib/api";
import { useCart } from "../app/cart";
import { Link } from "react-router-dom";

const TYPES = ["ALL", "CPU", "GPU", "RAM", "SSD", "PSU", "MOBO", "CASE"] as const;

function cls(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

export function HomePage() {
  const [type, setType] = useState<(typeof TYPES)[number]>("ALL");
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");

  const cart = useCart();

  useEffect(() => {
    fetchComponents(type === "ALL" ? undefined : type).then((data) => {
      setItems(Array.isArray(data) ? data : []);
    });
  }, [type]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter((x) => `${x.brand} ${x.model} ${x.type}`.toLowerCase().includes(t));
  }, [items, q]);

  const brands = useMemo(() => {
    const s = new Set<string>();
    for (const it of items) if (it?.brand) s.add(it.brand);
    return Array.from(s).slice(0, 10);
  }, [items]);

  return (
    <Layout>
      {/* HERO */}
      <section
        id="nosotros"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-diamond-500/10 via-transparent to-diamond-300/10" />
        <div className="relative grid gap-6 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-diamond-300/20 bg-diamond-500/10 px-3 py-1 text-xs text-white/80">
              💎 Hardware • Builds • Recomendaciones
            </p>

            <h2 className="mt-4 text-4xl font-semibold leading-tight">
              Arma tu PC ideal con{" "}
              <span className="bg-gradient-to-r from-diamond-200 to-diamond-500 bg-clip-text text-transparent">
                Diamond Grid
              </span>
            </h2>

            <p className="mt-3 text-white/70">
              Catálogo real desde PostgreSQL, stock, estado del producto e imágenes. Filtra por tipo y busca por marca/modelo.
            </p>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <div className="flex-1">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar productos: RTX 4060, Ryzen, Kingston..."
                  className="w-full rounded-2xl border border-white/10 bg-ink-900/50 px-4 py-3 outline-none focus:border-diamond-300/40"
                />
              </div>

              <a
                href="#catalogo"
                className="rounded-2xl bg-gradient-to-r from-diamond-400 to-diamond-600 px-5 py-3 text-center font-semibold shadow-glow"
              >
                Ver catálogo
              </a>
            </div>

            {brands.length > 0 && (
              <div id="marcas" className="mt-5">
                <p className="text-xs text-white/60">Marcas destacadas</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {brands.map((b) => (
                    <button
                      key={b}
                      onClick={() => setQ(b)}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 hover:bg-white/10"
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-white/10 bg-ink-900/50 p-5">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-diamond-500/20 via-white/5 to-transparent p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white/70">Promo</p>
                  <span className="rounded-full border border-diamond-300/20 bg-diamond-500/10 px-3 py-1 text-xs text-white/80">
                    Recomendador activo
                  </span>
                </div>

                <p className="mt-3 text-xl font-semibold">DiamondBot arma builds por presupuesto</p>
                <p className="mt-2 text-sm text-white/70">
                  Prueba el chatbot abajo a la derecha.
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-white/60">Gaming</p>
                    <p className="mt-1 font-semibold text-white/90">FPS</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-white/60">Work</p>
                    <p className="mt-1 font-semibold text-white/90">Productividad</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-white/60">Stock</p>
                    <p className="mt-1 font-semibold text-white/90">Control</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute -right-8 -top-10 h-56 w-56 rounded-full bg-diamond-500/10 blur-3xl" />
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section
        id="categorias"
        className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-semibold">Categorías</h3>
            <p className="mt-1 text-white/70">Filtra rápido por tipo.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cls(
                  "rounded-full px-3 py-1 text-sm border",
                  type === t
                    ? "border-diamond-300/30 bg-diamond-500/20 text-white"
                    : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Catálogo */}
      <section id="catalogo" className="mt-6">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h3 className="text-2xl font-semibold">Catálogo</h3>
            <p className="mt-1 text-white/70">
              {filtered.length} producto(s) {type !== "ALL" ? `• ${type}` : ""}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => {
            const stock = Number(c.stock ?? 0);
            const status = (c.status ?? "active") as "active" | "inactive";
            const disabled = stock <= 0 || status === "inactive";

            const img =
              c.imageUrl && typeof c.imageUrl === "string"
                ? `${API_BASE}${c.imageUrl}`
                : null;

            return (
              <div key={c.id} className="overflow-hidden rounded-3xl border border-white/10 bg-ink-900/60">
                {/* Imagen clic => detalle */}
                <Link
                  to={`/components/${c.id}`}
                  className="relative block h-40 border-b border-white/10 bg-white/5"
                >
                  {img ? (
                    <img
                      src={img}
                      alt={`${c.brand} ${c.model}`}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                      draggable={false}
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-diamond-500/15 via-white/5 to-transparent" />
                  )}

                  <div className="absolute left-3 top-3 flex gap-2">
                    <span className="rounded-full border border-diamond-300/20 bg-diamond-500/10 px-3 py-1 text-xs text-white/80">
                      {c.type}
                    </span>

                    {status === "inactive" ? (
                      <span className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs text-red-200">
                        Inactivo
                      </span>
                    ) : stock <= 0 ? (
                      <span className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs text-red-200">
                        Sin stock
                      </span>
                    ) : (
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
                        Stock {stock}
                      </span>
                    )}
                  </div>
                </Link>

                {/* Body */}
                <div className="p-4">
                  <Link to={`/components/${c.id}`} className="block">
                    <p className="text-lg font-semibold hover:underline">{c.brand}</p>
                    <p className="text-white/70 hover:underline">{c.model}</p>
                  </Link>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-white/60">
                      {c.brand} • {c.type}
                    </span>

                    <span className="rounded-full border border-diamond-300/20 bg-diamond-500/10 px-3 py-1 text-sm font-semibold text-diamond-200">
                      ${Number(c.price).toFixed(2)}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Link
                      to={`/components/${c.id}`}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-center text-sm font-semibold text-white/80 hover:bg-white/10"
                    >
                      Ver detalles
                    </Link>

                    <button
                      disabled={disabled}
                      className={cls(
                        "w-full rounded-2xl px-4 py-2 text-sm font-semibold",
                        disabled
                          ? "cursor-not-allowed border border-white/10 bg-white/5 text-white/50"
                          : "bg-gradient-to-r from-diamond-400 to-diamond-600 shadow-glow"
                      )}
                      onClick={() => {
                        if (disabled) return;
                        cart.add({
                          id: c.id,
                          type: c.type,
                          brand: c.brand,
                          model: c.model,
                          price: Number(c.price ?? 0),
                          imageUrl: c.imageUrl ?? null,
                        });
                      }}
                    >
                      {disabled ? "No disponible" : "Añadir"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/70">
              No hay productos para mostrar. (Tip: revisa filtros/búsqueda o agrega componentes desde el dashboard).
            </div>
          )}
        </div>
      </section>

      <Chatbot />
    </Layout>
  );
}