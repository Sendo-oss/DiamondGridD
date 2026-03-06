import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { API_BASE, fetchComponents } from "../lib/api";
import { Link } from "react-router-dom";

export function OffersPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComponents()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        // Por ahora simulamos ofertas con los primeros productos
        setItems(list.slice(0, 6));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-3xl font-bold">Ofertas</h1>
          <p className="mt-2 text-white/60">
            Descubre promociones y productos destacados.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4"
              >
                <div className="h-40 animate-pulse rounded-2xl bg-white/10" />
                <div className="mt-4 h-4 w-24 animate-pulse rounded bg-white/10" />
                <div className="mt-2 h-4 w-40 animate-pulse rounded bg-white/10" />
              </div>
            ))
          ) : (
            items.map((c) => (
              <div
                key={c.id}
                className="overflow-hidden rounded-3xl border border-white/10 bg-ink-900/60"
              >
                <Link
                  to={`/components/${c.id}`}
                  className="relative block h-44 border-b border-white/10 bg-white/5"
                >
                  {c.imageUrl ? (
                    <img
                      src={`${API_BASE}${c.imageUrl}`}
                      alt={`${c.brand} ${c.model}`}
                      className="h-full w-full object-contain p-3"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-diamond-500/15 via-white/5 to-transparent" />
                  )}
                </Link>

                <div className="p-4">
                  <p className="text-lg font-semibold">{c.brand}</p>
                  <p className="text-white/70">{c.model}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="rounded-full border border-diamond-300/20 bg-diamond-500/10 px-3 py-1 text-sm font-semibold text-diamond-200">
                      ${Number(c.price).toFixed(2)}
                    </span>
                    <span className="text-sm text-emerald-200">Oferta</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}