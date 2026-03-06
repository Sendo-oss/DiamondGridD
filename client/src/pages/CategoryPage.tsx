import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { API_BASE, fetchComponents } from "../lib/api";
import { useCart } from "../app/cart";

function cls(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

export function CategoryPage() {
  const { type } = useParams();
  const cart = useCart();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!type) return;
    setLoading(true);

    fetchComponents(type)
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
      })
      .finally(() => setLoading(false));
  }, [type]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter((x) =>
      `${x.brand} ${x.model} ${x.type}`.toLowerCase().includes(t)
    );
  }, [items, q]);

  return (
    <Layout>
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/60">
            <Link to="/" className="hover:text-white">Inicio</Link>
            <span className="mx-2">/</span>
            <span className="text-white">{type}</span>
          </p>

          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">{type}</h1>
              <p className="mt-1 text-white/60">
                Explora componentes de la categoría {type}.
              </p>
            </div>

            <div className="w-full md:w-[320px]">
              <label className="text-xs text-white/50">Buscar en {type}</label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={`Buscar ${type}...`}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-diamond-300/40"
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="h-40 animate-pulse rounded-2xl bg-white/10" />
                  <div className="mt-4 h-4 w-24 animate-pulse rounded bg-white/10" />
                  <div className="mt-2 h-4 w-40 animate-pulse rounded bg-white/10" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/70">
              No hay productos en esta categoría.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((c) => {
                const img =
                  c.imageUrl && typeof c.imageUrl === "string"
                    ? `${API_BASE}${c.imageUrl}`
                    : null;

                const stock = Number(c.stock ?? 0);
                const disabled = stock <= 0 || c.status === "inactive";

                return (
                  <div
                    key={c.id}
                    className="overflow-hidden rounded-3xl border border-white/10 bg-ink-900/60"
                  >
                    <Link
                      to={`/components/${c.id}`}
                      className="relative block h-44 border-b border-white/10 bg-white/5"
                    >
                      {img ? (
                        <img
                          src={img}
                          alt={`${c.brand} ${c.model}`}
                          className="h-full w-full object-contain p-3"
                          draggable={false}
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-diamond-500/15 via-white/5 to-transparent" />
                      )}

                      <div className="absolute left-3 top-3 flex gap-2">
                        <span className="rounded-full border border-diamond-300/20 bg-diamond-500/10 px-3 py-1 text-xs text-white/80">
                          {c.type}
                        </span>
                        {stock > 0 ? (
                          <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
                            Stock {stock}
                          </span>
                        ) : (
                          <span className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs text-red-200">
                            Sin stock
                          </span>
                        )}
                      </div>
                    </Link>

                    <div className="p-4">
                      <p className="text-lg font-semibold">{c.brand}</p>
                      <p className="text-white/70">{c.model}</p>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="rounded-full border border-diamond-300/20 bg-diamond-500/10 px-3 py-1 text-sm font-semibold text-diamond-200">
                          ${Number(c.price).toFixed(2)}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <Link
                          to={`/components/${c.id}`}
                          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-center text-sm font-semibold text-white/80 hover:bg-white/10"
                        >
                          Ver detalles
                        </Link>
                        <button
                          disabled={disabled}
                          onClick={() =>
                            cart.add({
                              id: c.id,
                              type: c.type,
                              brand: c.brand,
                              model: c.model,
                              price: Number(c.price ?? 0),
                              imageUrl: c.imageUrl ?? null,
                            })
                          }
                          className={cls(
                            "rounded-2xl px-4 py-2 text-sm font-semibold",
                            disabled
                              ? "cursor-not-allowed border border-white/10 bg-white/5 text-white/50"
                              : "bg-gradient-to-r from-diamond-400 to-diamond-600 shadow-glow"
                          )}
                        >
                          {disabled ? "No disponible" : "Añadir"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}