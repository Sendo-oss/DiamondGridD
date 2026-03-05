import { useEffect, useMemo, useState } from "react";
import { Layout } from "../components/Layout";
import { Chatbot } from "../components/Chatbot";
import { API_BASE, fetchComponents } from "../lib/api";
import { useCart } from "../app/cart";
import { Link, useLocation } from "react-router-dom";

const TYPES = ["ALL", "CPU", "GPU", "RAM", "SSD", "PSU", "MOBO", "CASE"] as const;

function cls(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

export function HomePage() {
  const cart = useCart();
  const location = useLocation();

  const [type, setType] = useState<(typeof TYPES)[number]>("ALL");
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * ✅ IMÁGENES (tú solo cambias rutas)
   * Recomendación PRO:
   * - pon tus banners en: client/public/banners/
   * - pon tus logos en:   client/public/brands/
   * y usas rutas: "/banners/..." y "/brands/..."
   */

  // ✅ Carrusel (banner grande)
  const SLIDES = [
    {
      title: "NVIDIA SERIES 5000",
      subtitle: "Descuento por lanzamiento",
      tag: "OFERTAS",
      cta: "Comprar",
      href: "/?q=RTX",
      image: "/public/series5000.png", // ← cambia
    },
    {
      title: "AMD RYZEN",
      subtitle: "Mejor precio por rendimiento",
      tag: "TOP",
      cta: "Ver CPUs",
      href: "/?type=CPU",
      image: "/banners/slide-2.png", // ← cambia
    },
    {
      title: "ALMACENAMIENTO",
      subtitle: "SSD NVMe • rendimiento extremo",
      tag: "PROMO",
      cta: "Ver SSD",
      href: "/?type=SSD",
      image: "/banners/slide-3.png", // ← cambia
    },
  ] as const;

  const [slide, setSlide] = useState(0);

  // autoplay carrusel
  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 5500);
    return () => clearInterval(id);
  }, []);

  // ✅ 2 banners laterales
  const SIDE_PROMOS = {
    top: {
      title: "CASES",
      subtitle: "desde",
      price: "$30.00",
      tag: "STOCK LIMITADO",
      cta: "Comprar",
      href: "/?type=CASE",
      image: "/banners/banner-cases.png", // ← cambia
    },
    bottom: {
      title: "LAPTOPS",
      subtitle: "desde",
      price: "$399.99",
      tag: "CONOCE",
      cta: "Comprar",
      href: "/?q=Laptop",
      image: "/banners/banner-laptops.png", // ← cambia
    },
  } as const;

  // ✅ Sección final (Quiénes somos)
  const ABOUT = {
    title: "Quiénes somos",
    subtitle: "Somos un equipo de emprendedores aficionados por la tecnología",
    text1: "Somos una tienda Gamer en Ecuador.",
    text2: "Manejamos los mejores precios del mercado.",
    cta: "Contáctanos",
    ctaHref: "/contact", // si no tienes ruta, déjalo o cámbialo por "/"
    image: "/banners/about-store.png", // ← cambia
    stats: [
      { big: "2+", label: "Tiendas", desc: "Tiendas físicas en los mejores lugares de la ciudad" },
      { big: "115+", label: "Marcas", desc: "Solo los mejores" },
      { big: "100%", label: "Clientes Felices", desc: "Solo damos el mejor servicio" },
    ],
  } as const;

  // ✅ Logos marcas (rutas)
  const BRAND_LOGOS = [
    { name: "Logitech", src: "/brands/logitech.png" },
    { name: "NVIDIA", src: "/brands/nvidia.png" },
    { name: "Corsair", src: "/brands/corsair.png" },
    { name: "Gigabyte", src: "/brands/gigabyte.png" },
    { name: "ASUS", src: "/brands/asus.png" },
    { name: "DeepCool", src: "/brands/deepcool.png" },
  ] as const;

  // ✅ Lee ?q= y ?type= desde URL (por buscador del Layout y links)
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const qUrl = sp.get("q");
    if (qUrl && qUrl !== q) setQ(qUrl);

    const tUrl = sp.get("type");
    if (tUrl && (TYPES as readonly string[]).includes(tUrl)) {
      setType(tUrl as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Fetch por tipo
  useEffect(() => {
    let alive = true;
    setLoading(true);

    fetchComponents(type === "ALL" ? undefined : type)
      .then((data) => {
        if (!alive) return;
        setItems(Array.isArray(data) ? data : []);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
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

  const s = SLIDES[slide];

  return (
    <Layout>
      {/* =========================
          HERO PRO (CARRUSEL + 2 PROMOS)
         ========================= */}
      <section className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        {/* Banner grande - carrusel */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-ink-900/60 backdrop-blur">
          {/* imagen */}
          <div className="absolute inset-0">
            {s.image ? (
              <img
                src={s.image}
                alt={s.title}
                className="h-full w-full object-cover"
                draggable={false}
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-diamond-500/20 via-white/5 to-transparent" />
            )}
            {/* overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(34,211,238,0.10)_1px,transparent_0)] [background-size:22px_22px] opacity-40" />
          </div>

          {/* contenido */}
          <div className="relative p-6 sm:p-8">
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
                {s.tag}
              </span>
              <span className="text-xs text-white/60">• DiamondGrid Store</span>
            </div>

            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              {s.title}
            </h2>
            <p className="mt-2 text-white/75">{s.subtitle}</p>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Link
                to={s.href}
                className="inline-flex w-fit items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-bold text-black hover:opacity-95"
              >
                {s.cta} <span className="ml-2">›</span>
              </Link>

              <a
                href="#catalogo"
                className="inline-flex w-fit items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
              >
                Ver catálogo
              </a>
            </div>

            {/* buscador pro */}
            <div className="mt-6 max-w-xl">
              <div className="flex items-center overflow-hidden rounded-2xl border border-white/15 bg-black/35 backdrop-blur">
                <span className="px-3 text-white/60">🔎</span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar productos: RTX 4060, Ryzen, Kingston..."
                  className="w-full bg-transparent px-1 py-3 text-sm text-white/90 outline-none placeholder:text-white/40"
                />
                <a
                  href="#catalogo"
                  className="px-4 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
                >
                  Buscar
                </a>
              </div>

              {brands.length > 0 && (
                <div className="mt-3">
                  <p className="text-[11px] text-white/60">Marcas destacadas</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {brands.map((b) => (
                      <button
                        key={b}
                        onClick={() => setQ(b)}
                        className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/80 hover:bg-white/10"
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dots */}
            <div className="mt-6 flex items-center gap-2">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  className={[
                    "h-2.5 w-2.5 rounded-full border",
                    i === slide
                      ? "border-diamond-300/50 bg-diamond-500/70"
                      : "border-white/20 bg-white/10 hover:bg-white/20",
                  ].join(" ")}
                  aria-label={`slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Prev/Next */}
            <div className="absolute bottom-4 right-4 hidden gap-2 sm:flex">
              <button
                onClick={() => setSlide((slide - 1 + SLIDES.length) % SLIDES.length)}
                className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white/80 hover:bg-black/45"
                title="Anterior"
              >
                ‹
              </button>
              <button
                onClick={() => setSlide((slide + 1) % SLIDES.length)}
                className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white/80 hover:bg-black/45"
                title="Siguiente"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        {/* 2 banners pequeños */}
        <div className="grid gap-4">
          {/* top */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-ink-900/60 backdrop-blur">
            <div className="absolute inset-0">
              {SIDE_PROMOS.top.image ? (
                <img
                  src={SIDE_PROMOS.top.image}
                  alt={SIDE_PROMOS.top.title}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-diamond-500/20 via-white/5 to-transparent" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-transparent" />
            </div>

            <div className="relative p-6">
              <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
                {SIDE_PROMOS.top.tag}
              </span>

              <h3 className="mt-3 text-2xl font-extrabold">{SIDE_PROMOS.top.title}</h3>
              <p className="mt-1 text-white/70">
                {SIDE_PROMOS.top.subtitle}{" "}
                <span className="text-white font-semibold">{SIDE_PROMOS.top.price}</span>
              </p>

              <Link
                to={SIDE_PROMOS.top.href}
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2 text-sm font-bold text-black hover:opacity-95"
              >
                {SIDE_PROMOS.top.cta} <span>›</span>
              </Link>
            </div>
          </div>

          {/* bottom */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-ink-900/60 backdrop-blur">
            <div className="absolute inset-0">
              {SIDE_PROMOS.bottom.image ? (
                <img
                  src={SIDE_PROMOS.bottom.image}
                  alt={SIDE_PROMOS.bottom.title}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-diamond-500/20 via-white/5 to-transparent" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-transparent" />
            </div>

            <div className="relative p-6">
              <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
                {SIDE_PROMOS.bottom.tag}
              </span>

              <h3 className="mt-3 text-2xl font-extrabold">{SIDE_PROMOS.bottom.title}</h3>
              <p className="mt-1 text-white/70">
                {SIDE_PROMOS.bottom.subtitle}{" "}
                <span className="text-white font-semibold">{SIDE_PROMOS.bottom.price}</span>
              </p>

              <Link
                to={SIDE_PROMOS.bottom.href}
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2 text-sm font-bold text-black hover:opacity-95"
              >
                {SIDE_PROMOS.bottom.cta} <span>›</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          CATEGORÍAS PRO
         ========================= */}
      <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
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
                  "rounded-full px-3 py-1 text-sm border transition",
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

      {/* =========================
          CATÁLOGO
         ========================= */}
      <section id="catalogo" className="mt-6">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h3 className="text-2xl font-semibold">Catálogo</h3>
            <p className="mt-1 text-white/70">
              {loading ? "Cargando..." : `${filtered.length} producto(s)`}{" "}
              {type !== "ALL" ? `• ${type}` : ""}
            </p>
          </div>
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-3xl border border-white/10 bg-ink-900/60"
              >
                <div className="h-40 border-b border-white/10 bg-white/5 animate-pulse" />
                <div className="p-4">
                  <div className="h-4 w-24 rounded bg-white/10 animate-pulse" />
                  <div className="mt-2 h-4 w-40 rounded bg-white/10 animate-pulse" />
                  <div className="mt-4 h-10 w-full rounded-2xl bg-white/10 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
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
                <div
                  key={c.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-ink-900/60"
                >
                  {/* Imagen clic => detalle */}
                  <Link
                    to={`/components/${c.id}`}
                    className="relative block h-40 border-b border-white/10 bg-white/5"
                  >
                    {img ? (
                      <img
                        src={img}
                        alt={`${c.brand} ${c.model}`}
                        className="h-full w-full object-contain p-3 transition-transform duration-300 hover:scale-[1.02]"
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
        )}
      </section>

      {/* =========================
          SECCIÓN FINAL (QUIÉNES SOMOS + STATS + LOGOS)
         ========================= */}
      <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr_1fr] lg:items-start">
          {/* Left text */}
          <div>
            <h3 className="text-2xl font-bold">{ABOUT.title}</h3>
            <p className="mt-2 text-white/80">{ABOUT.subtitle}</p>

            <p className="mt-4 text-sm text-white/65">{ABOUT.text1}</p>
            <p className="mt-2 text-sm text-white/65">{ABOUT.text2}</p>

            <Link
              to={ABOUT.ctaHref}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-diamond-300/25 bg-diamond-500/10 px-5 py-3 text-sm font-semibold text-white hover:bg-diamond-500/20"
            >
              {ABOUT.cta} <span>›</span>
            </Link>
          </div>

          {/* Center image */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-ink-950/40">
            {ABOUT.image ? (
              <img
                src={ABOUT.image}
                alt="about"
                className="h-[260px] w-full object-cover md:h-[300px]"
                draggable={false}
              />
            ) : (
              <div className="h-[260px] w-full bg-gradient-to-br from-diamond-500/15 via-white/5 to-transparent md:h-[300px]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>

          {/* Right stats */}
          <div className="space-y-6">
            {ABOUT.stats.map((st) => (
              <div key={st.label} className="flex gap-4 border-b border-white/10 pb-5 last:border-b-0 last:pb-0">
                <div className="text-3xl font-extrabold text-diamond-200">{st.big}</div>
                <div>
                  <p className="font-semibold text-white/90">{st.label}</p>
                  <p className="mt-1 text-sm text-white/60">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Logos row */}
        <div className="mt-8 border-t border-white/10 pt-6">
          <div className="flex flex-wrap items-center justify-center gap-6">
            {BRAND_LOGOS.map((b) => (
              <div
                key={b.name}
                className="h-10 w-[120px] grid place-items-center opacity-80 hover:opacity-100 transition"
                title={b.name}
              >
                <img
                  src={b.src}
                  alt={b.name}
                  className="h-full w-full object-contain"
                  draggable={false}
                />
              </div>
            ))}
          </div>

          {/* Botoncito opcional como la captura */}
          <div className="mt-6 flex justify-center">
            <Link
              to="/"
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
            >
              Haz clic aquí
            </Link>
          </div>
        </div>
      </section>

      <Chatbot />
    </Layout>
  );
}