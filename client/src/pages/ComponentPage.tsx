import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "../components/Layout";
import { API_BASE, fetchComponentById } from "../lib/api";
import { useCart } from "../app/cart";

function money(n: any) {
  const x = Number(n ?? 0);
  return `$${x.toFixed(2)}`;
}

function toAbsUrl(u: string) {
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith("/")) return `${API_BASE}${u}`;
  return `${API_BASE}/${u}`;
}

function Stars({ value = 4.7 }: { value?: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center text-amber-300">
        {Array.from({ length: 5 }).map((_, i) => {
          const idx = i + 1;
          const filled = idx <= full;
          const isHalf = idx === full + 1 && half;
          return (
            <span key={i} className={`text-sm ${filled || isHalf ? "" : "opacity-30"}`}>
              ★
            </span>
          );
        })}
      </div>
      <span className="text-xs text-white/60">{value.toFixed(1)}</span>
    </div>
  );
}

export function ComponentPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const cart = useCart();

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [activeImg, setActiveImg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchComponentById(id)
      .then(setItem)
      .finally(() => setLoading(false));
  }, [id]);

  // ✅ CAMBIO IMPORTANTE:
  // Soporta:
  // 1) imageUrl principal
  // 2) images desde DB como [{ id, url }]
  // 3) gallery como array de strings
  // 4) meta.gallery como array de strings
  const gallery = useMemo(() => {
    const list: string[] = [];

    if (item?.imageUrl && typeof item.imageUrl === "string") {
      list.push(toAbsUrl(item.imageUrl));
    }

    if (Array.isArray(item?.images)) {
      for (const img of item.images) {
        if (!img) continue;

        if (typeof img === "string") {
          const abs = toAbsUrl(img);
          if (!list.includes(abs)) list.push(abs);
          continue;
        }

        if (typeof img === "object" && typeof img.url === "string") {
          const abs = toAbsUrl(img.url);
          if (!list.includes(abs)) list.push(abs);
        }
      }
    }

    if (Array.isArray(item?.gallery)) {
      for (const u of item.gallery) {
        if (!u || typeof u !== "string") continue;
        const abs = toAbsUrl(u);
        if (!list.includes(abs)) list.push(abs);
      }
    }

    if (Array.isArray(item?.meta?.gallery)) {
      for (const u of item.meta.gallery) {
        if (!u || typeof u !== "string") continue;
        const abs = toAbsUrl(u);
        if (!list.includes(abs)) list.push(abs);
      }
    }

    return list;
  }, [item]);

  useEffect(() => {
    if (gallery.length > 0) setActiveImg(gallery[0]);
    else setActiveImg(null);
  }, [gallery]);

  const metaEntries = useMemo(() => {
    const meta = item?.meta;
    if (!meta || typeof meta !== "object") return [];
    return Object.entries(meta).filter(([k]) => k !== "gallery" && k !== "images");
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

  const stock = Number(item.stock ?? 0);
  const inactive = item.status === "inactive";
  const outOfStock = stock <= 0 || inactive;

  return (
    <Layout>
      <div className="mb-4 text-sm text-white/60">
        <span onClick={() => nav("/")} className="cursor-pointer hover:text-white">Inicio</span>
        <span className="mx-2">/</span>
        <span className="text-white/80">{item.type}</span>
        <span className="mx-2">/</span>
        <span className="text-white/80">{item.brand} {item.model}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        {/* IZQUIERDA */}
        <div className="rounded-3xl border border-white/10 bg-ink-900/60 p-4">
          <div className="grid gap-4 md:grid-cols-[84px_1fr]">
            {/* Miniaturas */}
            <div className="order-2 flex gap-2 md:order-1 md:flex-col">
              {(gallery.length ? gallery : [null]).map((g, idx) => (
                <button
                  key={idx}
                  onClick={() => g && setActiveImg(g)}
                  className={[
                    "h-16 w-16 overflow-hidden rounded-2xl border bg-black/30",
                    g && activeImg === g
                      ? "border-diamond-300/40 ring-2 ring-diamond-500/20"
                      : "border-white/10 hover:border-white/20",
                    !g ? "opacity-60 cursor-default" : "",
                  ].join(" ")}
                  title={g ? `Imagen ${idx + 1}` : "Sin imagen"}
                >
                  {g ? (
                    <img
                      src={g}
                      alt={`thumb ${idx + 1}`}
                      className="h-full w-full object-contain p-1"
                      draggable={false}
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-xs text-white/50">
                      —
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Imagen grande */}
            <div className="order-1 md:order-2">
              <div className="relative flex items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-black/30">
                {activeImg ? (
                  <img
                    src={activeImg}
                    alt={`${item.brand} ${item.model}`}
                    className="h-[420px] w-full object-contain p-10 mx-auto transition-transform duration-200 hover:scale-[1.02]"
                    draggable={false}
                  />
                ) : (
                  <div className="flex h-[420px] items-center justify-center text-white/50">
                    Sin imagen
                  </div>
                )}

                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-diamond-300/20 bg-diamond-500/10 px-3 py-1 text-xs text-white/80">
                    {item.type}
                  </span>

                  {inactive ? (
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
              </div>

              <p className="mt-3 text-center text-xs text-white/50">
                Haz clic en una miniatura para ver la imagen completa.
              </p>
            </div>
          </div>
        </div>

        {/* DERECHA */}
        <div className="lg:sticky lg:top-24 h-fit rounded-3xl border border-white/10 bg-ink-900/60 p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold leading-tight">
                {item.brand} {item.model}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-3">
                <Stars value={Number(item.rating ?? 4.7)} />
                <span className="text-xs text-white/60">
                  {Number(item.reviews ?? 9950).toLocaleString()} reseñas
                </span>
                <span className="text-xs text-white/60">•</span>
                <span className="text-xs text-white/60">
                  Marca: <span className="text-white/80">{item.brand}</span>
                </span>
              </div>

              <p className="mt-3 text-sm text-white/70">
                Categoría: <span className="text-white/85">{item.type}</span>
              </p>
            </div>

            <button
              onClick={() => navigator.clipboard?.writeText(window.location.href)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
              title="Copiar enlace"
            >
              ⤴
            </button>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-white/60">Precio</p>
                <p className="text-3xl font-extrabold text-diamond-200">
                  {money(item.price)}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-white/60">Stock</p>
                <p className={`text-sm font-semibold ${outOfStock ? "text-red-200" : "text-emerald-200"}`}>
                  {outOfStock ? "No disponible" : `${stock} disponible(s)`}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
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

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
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
                className={[
                  "w-full rounded-2xl px-4 py-3 font-semibold shadow-glow",
                  outOfStock
                    ? "bg-white/5 text-white/40 border border-white/10 cursor-not-allowed"
                    : "bg-gradient-to-r from-diamond-400 to-diamond-600",
                ].join(" ")}
              >
                {outOfStock ? "No disponible" : "Agregar al carrito"}
              </button>

              <button
                onClick={() => nav(-1)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/80 hover:bg-white/10"
              >
                Volver
              </button>
            </div>

            <p className="mt-3 text-xs text-white/55">
              * Este precio y stock dependen de tu inventario en DiamondGrid.
            </p>
          </div>

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
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 text-white/80">
        <h3 className="text-lg font-semibold">Descripción</h3>
        <p className="mt-2 text-sm text-white/70">
          {item.description
            ? String(item.description)
            : "Agrega una descripción desde tu dashboard para mostrar detalles del producto."}
        </p>
      </div>
    </Layout>
  );
}