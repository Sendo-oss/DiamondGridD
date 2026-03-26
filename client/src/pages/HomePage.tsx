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

  const SLIDES = [
    {
      title: "NVIDIA SERIES 5000",
      subtitle: "Potencia de nueva generación para gaming y creación de contenido.",
      tag: "OFERTAS",
      cta: "Comprar ahora",
      href: "/?q=RTX",
      image: "/series5000.png",
    },
    {
      title: "AMD RYZEN",
      subtitle: "Mejor precio por rendimiento para setups modernos.",
      tag: "TOP",
      cta: "Ver CPUs",
      href: "/?type=CPU",
      image: "public/PROCESADORES.png",
    },
    {
      title: "ALMACENAMIENTO NVMe",
      subtitle: "Velocidad extrema para gaming, trabajo y productividad.",
      tag: "PROMO",
      cta: "Ver SSD",
      href: "/?type=SSD",
      image: "public/Almacenamiento.png",
    },
  ] as const;

  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 5500);
    return () => clearInterval(id);
  }, []);

  const SIDE_PROMOS = {
    top: {
      title: "CASES",
      subtitle: "desde",
      price: "$30.00",
      tag: "STOCK LIMITADO",
      cta: "Comprar",
      href: "/?type=CASE",
      image: "/cases.png",
    },
    bottom: {
      title: "PROCESADORES",
      subtitle: "desde",
      price: "$199.99",
      tag: "CONOCE",
      cta: "Comprar",
      href: "/?type=CPU",
      image: "/intel.png",
    },
  } as const;

  const ABOUT = {
    title: "Quiénes somos",
    subtitle: "Somos un equipo apasionado por la tecnología, el hardware y el mejor rendimiento.",
    text1: "En Diamond Grid trabajamos para ofrecer componentes de calidad, atención confiable y una experiencia moderna de compra.",
    text2: "Nos enfocamos en brindar productos para gamers, estudiantes, creadores de contenido y entusiastas del hardware en Ecuador.",
    cta: "Contáctanos",
    ctaHref: "/contact",
    image: "/Diamond.png",
    stats: [
      { big: "2+", label: "Tiendas", desc: "Tiendas físicas en ubicaciones estratégicas." },
      { big: "115+", label: "Marcas", desc: "Trabajamos con marcas reconocidas y confiables." },
      { big: "100%", label: "Compromiso", desc: "Nos enfocamos en brindar la mejor atención." },
    ],
  } as const;

  const BRAND_LOGOS = [
    { name: "Logitech", src: "/logitech.png" },
    { name: "NVIDIA", src: "/nvidia.png" },
    { name: "Corsair", src: "/corsair.png" },
    { name: "Gigabyte", src: "/gigabyte.png" },
    { name: "ASUS", src: "/asus.png" },
    { name: "DeepCool", src: "/deepcool.png" },
  ] as const;

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const qUrl = sp.get("q");
    if (qUrl && qUrl !== q) setQ(qUrl);
    const tUrl = sp.get("type");
    if (tUrl && (TYPES as readonly string[]).includes(tUrl)) setType(tUrl as any);
  }, [location.search]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchComponents(type === "ALL" ? undefined : type)
      .then((data) => { if (!alive) return; setItems(Array.isArray(data) ? data : []); })
      .finally(() => { if (!alive) return; setLoading(false); });
    return () => { alive = false; };
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
    <>
      <Layout>
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap');

        .hp { font-family: 'Inter', sans-serif; color: #fff; }
        .hp * { box-sizing: border-box; }

        /* ── HERO ── */
        .hp-hero {
          display: grid;
          gap: 14px;
        }
        @media (min-width: 1024px) { .hp-hero { grid-template-columns: 1.65fr 1fr; } }

        .hp-main-slide {
          position: relative;
          overflow: hidden;
          border-radius: 26px;
          border: 1px solid rgba(34,211,238,0.1);
          background: rgba(5,10,20,0.7);
          min-height: 340px;
          cursor: pointer;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .hp-main-slide:hover {
          border-color: rgba(34,211,238,0.22);
          box-shadow: 0 0 80px rgba(34,211,238,0.1);
        }

        .hp-main-slide-bg {
          position: absolute;
          inset: 0;
        }

        .hp-main-slide-bg img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.7s ease;
        }
        .hp-main-slide:hover .hp-main-slide-bg img { transform: scale(1.03); }

        .hp-slide-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(100deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.1) 100%);
        }

        .hp-slide-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(34,211,238,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,211,238,0.07) 1px, transparent 1px);
          background-size: 28px 28px;
          opacity: 0.3;
        }

        .hp-slide-content {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 28px 32px;
          min-height: 340px;
        }

        .hp-slide-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 99px;
          border: 1px solid rgba(34,211,238,0.25);
          background: rgba(34,211,238,0.08);
          padding: 4px 12px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(34,211,238,0.9);
          width: fit-content;
        }

        .hp-slide-tag::before {
          content: '';
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: rgba(34,211,238,0.9);
          animation: blink 1.4s infinite;
        }

        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .hp-slide-eyebrow {
          font-size: 11px;
          color: rgba(255,255,255,0.45);
          letter-spacing: 0.08em;
          margin-left: 2px;
        }

        .hp-slide-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(28px, 4vw, 48px);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1.08;
          margin-top: 14px;
          max-width: 520px;
        }

        .hp-slide-sub {
          margin-top: 12px;
          font-size: 14px;
          color: rgba(255,255,255,0.65);
          max-width: 420px;
          line-height: 1.6;
        }

        .hp-slide-actions {
          display: flex;
          gap: 10px;
          margin-top: 22px;
          flex-wrap: wrap;
        }

        .hp-btn-white {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 14px;
          background: #fff;
          color: #000;
          padding: 11px 20px;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          transition: transform 0.15s, opacity 0.15s;
          border: none;
          cursor: pointer;
        }
        .hp-btn-white:hover { transform: scale(1.02); opacity: 0.93; }

        .hp-btn-ghost-slide {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.85);
          padding: 11px 20px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.15s;
          cursor: pointer;
        }
        .hp-btn-ghost-slide:hover { background: rgba(255,255,255,0.1); }

        .hp-slide-bottom {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          margin-top: 24px;
          flex-wrap: wrap;
        }

        .hp-brands-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          margin-bottom: 8px;
        }

        .hp-brand-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .hp-brand-pill {
          border-radius: 99px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.05);
          padding: 4px 12px;
          font-size: 11px;
          font-weight: 600;
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s, color 0.15s;
          font-family: 'Inter', sans-serif;
          border-style: none;
        }
        .hp-brand-pill:hover { border: 1px solid rgba(34,211,238,0.25); background: rgba(34,211,238,0.08); color: rgba(34,211,238,0.9); }

        .hp-slide-dots {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .hp-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.1);
          cursor: pointer;
          transition: all 0.2s;
          padding: 0;
        }
        .hp-dot.active {
          width: 22px;
          border-radius: 4px;
          border-color: rgba(34,211,238,0.5);
          background: rgba(34,211,238,0.6);
        }

        .hp-nav-btn {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(0,0,0,0.4);
          color: rgba(255,255,255,0.75);
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
          margin-left: 4px;
        }
        .hp-nav-btn:hover { background: rgba(0,0,0,0.6); }

        /* SIDE PROMOS */
        .hp-side { display: flex; flex-direction: column; gap: 14px; }

        .hp-promo {
          position: relative;
          overflow: hidden;
          border-radius: 22px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(5,10,20,0.6);
          flex: 1;
          min-height: 152px;
          transition: border-color 0.25s, transform 0.25s;
          cursor: pointer;
        }
        .hp-promo:hover { border-color: rgba(34,211,238,0.2); transform: translateY(-2px); box-shadow: 0 8px 32px rgba(34,211,238,0.08); }

        .hp-promo-bg {
          position: absolute;
          inset: 0;
        }
        .hp-promo-bg img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s; }
        .hp-promo:hover .hp-promo-bg img { transform: scale(1.05); }

        .hp-promo-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(100deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.35) 60%, transparent 100%);
        }

        .hp-promo-content { position: relative; padding: 20px 22px; }

        .hp-promo-tag {
          display: inline-block;
          border-radius: 99px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
          padding: 3px 10px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.7);
        }

        .hp-promo-title {
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.03em;
          margin-top: 7px;
        }

        .hp-promo-price {
          font-size: 13px;
          color: rgba(255,255,255,0.6);
          margin-top: 2px;
        }
        .hp-promo-price strong { color: #fff; font-weight: 700; }

        .hp-promo-cta {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-top: 12px;
          border-radius: 11px;
          background: #fff;
          color: #000;
          padding: 8px 16px;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          transition: transform 0.15s, opacity 0.15s;
        }
        .hp-promo-cta:hover { transform: scale(1.03); opacity: 0.92; }

        /* ── FILTER BAR ── */
        .hp-filter-bar {
          border-radius: 22px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(12px);
          padding: 20px 24px;
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        @media (min-width: 768px) {
          .hp-filter-bar { flex-direction: row; align-items: center; justify-content: space-between; }
        }

        .hp-section-eye {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(34,211,238,0.6);
          margin-bottom: 4px;
        }

        .hp-section-title {
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .hp-section-sub { font-size: 13px; color: rgba(255,255,255,0.4); margin-top: 3px; }

        .hp-type-pills { display: flex; flex-wrap: wrap; gap: 7px; }

        .hp-type-pill {
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          padding: 7px 14px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          color: rgba(255,255,255,0.55);
          transition: all 0.15s;
          font-family: 'Inter', sans-serif;
        }
        .hp-type-pill:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.9); }
        .hp-type-pill.active {
          border-color: rgba(34,211,238,0.3);
          background: rgba(34,211,238,0.1);
          color: rgba(34,211,238,0.95);
          box-shadow: 0 0 16px rgba(34,211,238,0.1);
        }

        /* ── CATALOG ── */
        .hp-catalog-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin: 20px 0 14px;
        }

        .hp-catalog-count {
          font-size: 12px;
          color: rgba(255,255,255,0.35);
          margin-top: 4px;
          font-family: 'Inter', sans-serif;
        }

        .hp-grid {
          display: grid;
          gap: 12px;
          grid-template-columns: 1fr;
        }
        @media (min-width: 640px) { .hp-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .hp-grid { grid-template-columns: repeat(3, 1fr); } }

        /* Product Card */
        .hp-card {
          border-radius: 22px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.025);
          overflow: hidden;
          transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
        }
        .hp-card:hover {
          border-color: rgba(34,211,238,0.18);
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(34,211,238,0.07);
        }

        .hp-card-img {
          position: relative;
          height: 168px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.03);
          display: block;
          overflow: hidden;
        }

        .hp-card-img img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 16px;
          transition: transform 0.3s ease;
        }
        .hp-card:hover .hp-card-img img { transform: scale(1.06); }

        .hp-card-img-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(34,211,238,0.07), rgba(99,102,241,0.07));
        }

        .hp-card-badges {
          position: absolute;
          top: 10px;
          left: 10px;
          display: flex;
          gap: 5px;
        }

        .hp-badge {
          border-radius: 8px;
          padding: 3px 9px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.04em;
        }

        .hp-badge-type {
          border: 1px solid rgba(34,211,238,0.22);
          background: rgba(34,211,238,0.08);
          color: rgba(34,211,238,0.85);
        }

        .hp-badge-ok {
          border: 1px solid rgba(45,212,191,0.22);
          background: rgba(45,212,191,0.08);
          color: rgba(94,234,212,0.9);
        }

        .hp-badge-out {
          border: 1px solid rgba(244,63,94,0.22);
          background: rgba(244,63,94,0.08);
          color: rgba(252,165,165,0.9);
        }

        .hp-card-body { padding: 14px 16px; }

        .hp-card-brand {
          font-size: 15px;
          font-weight: 700;
          color: rgba(255,255,255,0.9);
          transition: color 0.15s;
          text-decoration: none;
          display: block;
        }
        .hp-card-brand:hover { color: rgba(34,211,238,0.9); }

        .hp-card-model {
          font-size: 13px;
          color: rgba(255,255,255,0.45);
          margin-top: 2px;
          text-decoration: none;
          display: block;
        }
        .hp-card-model:hover { color: rgba(255,255,255,0.75); }

        .hp-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 12px;
        }

        .hp-card-meta { font-size: 11px; color: rgba(255,255,255,0.3); }

        .hp-price {
          border-radius: 9px;
          border: 1px solid rgba(34,211,238,0.2);
          background: rgba(34,211,238,0.08);
          padding: 4px 10px;
          font-size: 13px;
          font-weight: 700;
          color: rgba(34,211,238,0.9);
          font-family: 'Syne', sans-serif;
        }

        .hp-card-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 12px;
        }

        .hp-btn-detail {
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          padding: 10px;
          font-size: 12.5px;
          font-weight: 600;
          color: rgba(255,255,255,0.7);
          text-align: center;
          text-decoration: none;
          display: block;
          transition: background 0.15s, color 0.15s;
        }
        .hp-btn-detail:hover { background: rgba(255,255,255,0.08); color: #fff; }

        .hp-btn-add {
          border-radius: 12px;
          padding: 10px;
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          border: none;
          font-family: 'Inter', sans-serif;
          transition: transform 0.15s, box-shadow 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
        }

        .hp-btn-add.available {
          background: linear-gradient(135deg, #22d3ee, #6366f1);
          color: #fff;
          box-shadow: 0 3px 14px rgba(34,211,238,0.18);
        }
        .hp-btn-add.available:hover { transform: scale(1.02); box-shadow: 0 4px 20px rgba(34,211,238,0.28); }

        .hp-btn-add.disabled {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.28);
          cursor: not-allowed;
        }

        /* Skeleton */
        .hp-skeleton {
          border-radius: 22px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.025);
          overflow: hidden;
        }

        .hp-skel-img {
          height: 168px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.04);
          animation: shimmer 1.5s infinite;
        }

        .hp-skel-body { padding: 14px 16px; }

        .hp-skel-line {
          border-radius: 6px;
          background: rgba(255,255,255,0.06);
          animation: shimmer 1.5s infinite;
          height: 12px;
          margin-top: 10px;
        }

        @keyframes shimmer {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        /* Empty */
        .hp-empty {
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
          padding: 48px 32px;
          text-align: center;
          color: rgba(255,255,255,0.3);
          font-size: 14px;
          grid-column: 1 / -1;
        }

        /* ── ABOUT ── */
        .hp-about {
          margin-top: 24px;
          border-radius: 26px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.025);
          backdrop-filter: blur(12px);
          padding: 32px;
          overflow: hidden;
        }

        .hp-about-grid {
          display: grid;
          gap: 28px;
          grid-template-columns: 1fr;
        }
        @media (min-width: 1024px) { .hp-about-grid { grid-template-columns: 1fr 1.1fr 0.9fr; align-items: start; } }

        .hp-about-title {
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.03em;
          margin-top: 6px;
        }

        .hp-about-sub { font-size: 14px; color: rgba(255,255,255,0.7); margin-top: 6px; line-height: 1.65; }
        .hp-about-text { font-size: 13px; color: rgba(255,255,255,0.5); margin-top: 12px; line-height: 1.7; }

        .hp-about-cta {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-top: 20px;
          border-radius: 14px;
          border: 1px solid rgba(34,211,238,0.22);
          background: rgba(34,211,238,0.08);
          padding: 11px 20px;
          font-size: 13px;
          font-weight: 600;
          color: rgba(34,211,238,0.9);
          text-decoration: none;
          transition: background 0.15s;
        }
        .hp-about-cta:hover { background: rgba(34,211,238,0.14); }

        .hp-about-img {
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
          position: relative;
        }
        .hp-about-img img { width: 100%; height: 280px; object-fit: cover; display: block; }
        .hp-about-img::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.4), transparent);
          border-radius: 20px;
        }

        .hp-stat {
          display: flex;
          gap: 14px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          margin-bottom: 20px;
        }
        .hp-stat:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }

        .hp-stat-num {
          font-family: 'Syne', sans-serif;
          font-size: 30px;
          font-weight: 800;
          letter-spacing: -0.04em;
          color: rgba(34,211,238,0.85);
          line-height: 1;
        }

        .hp-stat-label { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.85); }
        .hp-stat-desc { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 2px; line-height: 1.5; }

        /* Brand marquee */
        .hp-brands-section {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.07);
        }

        .hp-brands-track {
          overflow: hidden;
          position: relative;
        }

        .hp-brands-track::before, .hp-brands-track::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          width: 80px;
          z-index: 2;
        }
        .hp-brands-track::before { left: 0; background: linear-gradient(to right, rgba(5,10,20,0.95), transparent); }
        .hp-brands-track::after  { right: 0; background: linear-gradient(to left,  rgba(5,10,20,0.95), transparent); }

        .hp-brands-inner {
          display: flex;
          gap: 12px;
          animation: marquee 22s linear infinite;
          width: max-content;
        }

        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        .hp-brand-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 140px;
          height: 60px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          flex-shrink: 0;
          padding: 12px 16px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .hp-brand-logo:hover {
          border-color: rgba(34,211,238,0.18);
          box-shadow: 0 0 20px rgba(34,211,238,0.1);
        }
        .hp-brand-logo img { max-height: 38px; width: auto; object-fit: contain; opacity: 0.85; }
        .hp-brand-logo:hover img { opacity: 1; }
        `}</style>

      <div className="hp">

        {/* ── HERO ── */}
        <section className="hp-hero">

          {/* Main slide */}
          <div className="hp-main-slide">
            <div className="hp-main-slide-bg">
              {s.image
                ? <img src={s.image} alt={s.title} draggable={false} />
                : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, rgba(34,211,238,0.12), rgba(99,102,241,0.1))" }} />
              }
            </div>
            <div className="hp-slide-overlay" />
            <div className="hp-slide-grid" />

            <div className="hp-slide-content">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="hp-slide-tag">{s.tag}</span>
                  <span className="hp-slide-eyebrow">Diamond Grid Store</span>
                </div>

                <h2 className="hp-slide-title">{s.title}</h2>
                <p className="hp-slide-sub">{s.subtitle}</p>

                <div className="hp-slide-actions">
                  <Link to={s.href} className="hp-btn-white">
                    {s.cta} <span>→</span>
                  </Link>
                  <a href="#catalogo" className="hp-btn-ghost-slide">
                    Ver catálogo
                  </a>
                </div>
              </div>

              <div className="hp-slide-bottom">
                <div>
                  {brands.length > 0 && (
                    <>
                      <p className="hp-brands-label">Marcas disponibles</p>
                      <div className="hp-brand-pills">
                        {brands.map(b => (
                          <button key={b} className="hp-brand-pill" onClick={() => setQ(b)}>{b}</button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="hp-slide-dots">
                  {SLIDES.map((_, i) => (
                    <button key={i} className={`hp-dot ${i === slide ? "active" : ""}`} onClick={() => setSlide(i)} aria-label={`Slide ${i + 1}`} />
                  ))}
                  <button className="hp-nav-btn" onClick={() => setSlide((slide - 1 + SLIDES.length) % SLIDES.length)}>‹</button>
                  <button className="hp-nav-btn" onClick={() => setSlide((slide + 1) % SLIDES.length)}>›</button>
                </div>
              </div>
            </div>
          </div>

          {/* Side promos */}
          <div className="hp-side">
            {([SIDE_PROMOS.top, SIDE_PROMOS.bottom] as const).map((promo, i) => (
              <div className="hp-promo" key={i}>
                <div className="hp-promo-bg">
                  {promo.image
                    ? <img src={promo.image} alt={promo.title} draggable={false} />
                    : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, rgba(34,211,238,0.08), rgba(99,102,241,0.08))" }} />
                  }
                </div>
                <div className="hp-promo-overlay" />
                <div className="hp-promo-content">
                  <span className="hp-promo-tag">{promo.tag}</span>
                  <h3 className="hp-promo-title">{promo.title}</h3>
                  <p className="hp-promo-price">{promo.subtitle} <strong>{promo.price}</strong></p>
                  <Link to={promo.href} className="hp-promo-cta">{promo.cta} →</Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FILTER BAR ── */}
        <section className="hp-filter-bar">
          <div>
            <p className="hp-section-eye">Explora por categoría</p>
            <h3 className="hp-section-title">Encuentra el componente ideal</h3>
            <p className="hp-section-sub">Filtra por tipo y revisa el catálogo disponible.</p>
          </div>
          <div className="hp-type-pills">
            {TYPES.map(t => (
              <button
                key={t}
                className={`hp-type-pill ${type === t ? "active" : ""}`}
                onClick={() => setType(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        {/* ── CATALOG ── */}
        <section id="catalogo">
          <div className="hp-catalog-header">
            <div>
              <p className="hp-section-eye">Catálogo</p>
              <h3 className="hp-section-title">Productos disponibles</h3>
              <p className="hp-catalog-count">
                {loading ? "Cargando…" : `${filtered.length} producto(s)`}
                {type !== "ALL" ? ` · ${type}` : ""}
                {q.trim() ? ` · "${q}"` : ""}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="hp-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div className="hp-skeleton" key={i}>
                  <div className="hp-skel-img" />
                  <div className="hp-skel-body">
                    <div className="hp-skel-line" style={{ width: "45%" }} />
                    <div className="hp-skel-line" style={{ width: "70%", marginTop: 8 }} />
                    <div className="hp-skel-line" style={{ width: "100%", height: 36, marginTop: 16, borderRadius: 12 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="hp-grid">
              {filtered.map(c => {
                const stock = Number(c.stock ?? 0);
                const status = (c.status ?? "active") as "active" | "inactive";
                const disabled = stock <= 0 || status === "inactive";
                const img = c.imageUrl && typeof c.imageUrl === "string" ? `${API_BASE}${c.imageUrl}` : null;

                return (
                  <div className="hp-card" key={c.id}>
                    <Link to={`/components/${c.id}`} className="hp-card-img">
                      {img
                        ? <img src={img} alt={`${c.brand} ${c.model}`} draggable={false} />
                        : <div className="hp-card-img-placeholder" />
                      }
                      <div className="hp-card-badges">
                        <span className="hp-badge hp-badge-type">{c.type}</span>
                        {status === "inactive" || stock <= 0
                          ? <span className="hp-badge hp-badge-out">{status === "inactive" ? "Inactivo" : "Sin stock"}</span>
                          : <span className="hp-badge hp-badge-ok">Stock {stock}</span>
                        }
                      </div>
                    </Link>

                    <div className="hp-card-body">
                      <Link to={`/components/${c.id}`} className="hp-card-brand">{c.brand}</Link>
                      <Link to={`/components/${c.id}`} className="hp-card-model">{c.model}</Link>

                      <div className="hp-card-footer">
                        <span className="hp-card-meta">{c.brand} · {c.type}</span>
                        <span className="hp-price">${Number(c.price).toFixed(2)}</span>
                      </div>

                      <div className="hp-card-actions">
                        <Link to={`/components/${c.id}`} className="hp-btn-detail">Ver detalles</Link>
                        <button
                          className={`hp-btn-add ${disabled ? "disabled" : "available"}`}
                          disabled={disabled}
                          onClick={() => {
                            if (disabled) return;
                            cart.add({ id: c.id, type: c.type, brand: c.brand, model: c.model, price: Number(c.price ?? 0), imageUrl: c.imageUrl ?? null });
                          }}
                        >
                          {disabled ? "No disponible" : <>+ Añadir</>}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="hp-empty">
                  No hay productos para mostrar.<br />
                  <span style={{ fontSize: 12, opacity: 0.6 }}>Revisa los filtros o la búsqueda.</span>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── ABOUT ── */}
        <section className="hp-about">
          <div className="hp-about-grid">
            <div>
              <p className="hp-section-eye">Nosotros</p>
              <h3 className="hp-about-title">{ABOUT.title}</h3>
              <p className="hp-about-sub">{ABOUT.subtitle}</p>
              <p className="hp-about-text">{ABOUT.text1}</p>
              <p className="hp-about-text">{ABOUT.text2}</p>
              <Link to={ABOUT.ctaHref} className="hp-about-cta">
                {ABOUT.cta} →
              </Link>
            </div>

            <div className="hp-about-img">
              {ABOUT.image
                ? <img src={ABOUT.image} alt="about" draggable={false} />
                : <div style={{ height: 280, background: "linear-gradient(135deg, rgba(34,211,238,0.08), rgba(99,102,241,0.08))" }} />
              }
            </div>

            <div>
              {ABOUT.stats.map(st => (
                <div className="hp-stat" key={st.label}>
                  <div className="hp-stat-num">{st.big}</div>
                  <div>
                    <div className="hp-stat-label">{st.label}</div>
                    <div className="hp-stat-desc">{st.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Brand marquee */}
          <div className="hp-brands-section">
            <div className="hp-brands-track">
              <div className="hp-brands-inner">
                {[...BRAND_LOGOS, ...BRAND_LOGOS].map((b, i) => (
                  <div className="hp-brand-logo" key={`${b.name}-${i}`} title={b.name}>
                    <img src={b.src} alt={b.name} draggable={false} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>

      </Layout>
      <Chatbot />
    </>
  );
}
