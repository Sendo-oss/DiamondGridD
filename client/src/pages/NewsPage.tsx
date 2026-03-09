import { Layout } from "../components/Layout";

const news = [
  {
    id: 1,
    title: "Nuevas GPUs disponibles",
    text: "Ya contamos con nuevas tarjetas gráficas de última generación en Diamond Grid.",
    date: "10 de marzo de 2026",
    category: "Productos",
  },
  {
    id: 2,
    title: "Promoción en SSD NVMe",
    text: "Aprovecha descuentos especiales en almacenamiento de alto rendimiento.",
    date: "8 de marzo de 2026",
    category: "Promociones",
  },
  {
    id: 3,
    title: "Más stock en procesadores AMD",
    text: "Hemos renovado inventario de procesadores para gaming y trabajo.",
    date: "5 de marzo de 2026",
    category: "Inventario",
  },
];

export function NewsPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg backdrop-blur-sm">
          <h1 className="text-3xl font-bold">Noticias</h1>
          <p className="mt-2 text-white/60">
            Mantente al día con novedades, promociones y actualizaciones de Diamond Grid.
          </p>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {news.map((n) => (
            <article
              key={n.id}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-white/10 hover:shadow-xl"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-300">
                  {n.category}
                </span>
                <span className="text-sm text-white/50">{n.date}</span>
              </div>

              <h2 className="text-xl font-semibold text-white">{n.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/70">{n.text}</p>

              <button className="mt-5 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-400">
                Leer más
              </button>
            </article>
          ))}
        </div>
      </div>
    </Layout>
  );
}