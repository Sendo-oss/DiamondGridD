import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "../components/Layout";
import { API_BASE, fetchComponentById } from "../lib/api";
import { useCart } from "../app/cart";

function cls(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

export function ComponentPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const cart = useCart();

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchComponentById(id)
      .then(setItem)
      .finally(() => setLoading(false));
  }, [id]);

  const imgSrc = useMemo(() => {
    if (!item?.imageUrl) return null;
    // tu imageUrl normalmente viene como "/uploads/xxx.png"
    return `${API_BASE}${item.imageUrl}`;
  }, [item]);

  const metaEntries = useMemo(() => {
    const meta = item?.meta;
    if (!meta || typeof meta !== "object") return [];
    return Object.entries(meta);
  }, [item]);

  if (loading) {
    return (
      <Layout>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/70">
          Cargando componente...
        </div>
      </Layout>
    );
  }

  if (!item?.id) {
    return (
      <Layout>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-white/80">No encontrado.</p>
          <button
            onClick={() => nav("/")}
            className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white/80 hover:bg-white/10"
          >
            Volver al catálogo
          </button>
        </div>
      </Layout>
    );
  }

  const outOfStock = Number(item.stock ?? 0) <= 0 || item.status === "inactive";

  return (
    <Layout>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Imagen */}
        <div className="rounded-3xl border border-white/10 bg-ink-900/60 p-4">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
            {imgSrc ? (
              <div className="group relative">
                <img
                  src={imgSrc}
                  alt={`${item.brand} ${item.model}`}
                  className={cls(
                    "h-[360px] w-full object-contain p-6 transition-transform duration-200",
                    "group-hover:scale-[1.04]"
                  )}
                />
              </div>
            ) : (
              <div className="flex h-[360px] items-center justify-center text-white/50">
                Sin imagen
              </div>
            )}
          </div>
        </div>

        {/* Detalle */}
        <div className="rounded-3xl border border-white/10 bg-ink-900/60 p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-diamond-300/20 bg-diamond-500/10 px-3 py-1 text-xs text-white/80">
                  {item.type}
                </span>

                {item.status === "inactive" && (
                  <span className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs text-red-200">
                    Inactivo
                  </span>
                )}

                {Number(item.stock ?? 0) <= 0 && (
                  <span className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs text-red-200">
                    Sin stock
                  </span>
                )}
              </div>

              <h1 className="mt-3 text-2xl font-semibold">{item.brand}</h1>
              <p className="text-white/70">{item.model}</p>
            </div>

            <div className="text-right">
              <p className="text-xs text-white/60">Precio</p>
              <p className="text-xl font-semibold text-diamond-200">
                ${Number(item.price ?? 0).toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-white/60">
                Stock: <span className="text-white/80">{Number(item.stock ?? 0)}</span>
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-white/60">Gaming</p>
              <p className="font-semibold">{Number(item.scoreGaming ?? 0)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-white/60">Work</p>
              <p className="font-semibold">{Number(item.scoreWork ?? 0)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-white/60">Watts</p>
              <p className="font-semibold">{item.watt ? `${item.watt}W` : "—"}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-white/60">Estado</p>
              <p className="font-semibold">{item.status ?? "active"}</p>
            </div>
          </div>

          {/* Características (meta) */}
          <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-base font-semibold">Características</h3>

            {metaEntries.length === 0 ? (
              <p className="mt-2 text-sm text-white/60">No hay características registradas.</p>
            ) : (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {metaEntries.map(([k, v]) => (
                  <div key={k} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <p className="text-xs uppercase text-white/50">{k}</p>
                    <p className="font-semibold text-white/90">{String(v)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <button
              disabled={outOfStock}
              onClick={() => {
                cart.add(
                  {
                    id: item.id,
                    type: item.type,
                    brand: item.brand,
                    model: item.model,
                    price: Number(item.price ?? 0),
                    imageUrl: item.imageUrl ?? null,
                  },
                  1
                );
              }}
              className={cls(
                "w-full rounded-xl px-4 py-3 font-semibold shadow-glow",
                outOfStock
                  ? "bg-white/5 text-white/40 border border-white/10 cursor-not-allowed"
                  : "bg-gradient-to-r from-diamond-400 to-diamond-600"
              )}
            >
              {outOfStock ? "No disponible" : "Agregar al carrito"}
            </button>

            <button
              onClick={() => nav("/")}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white/80 hover:bg-white/10"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}