import { Layout } from "../components/Layout";

const news = [
  {
    title: "Nuevas GPUs disponibles",
    text: "Ya contamos con nuevas tarjetas gráficas de última generación en Diamond Grid.",
  },
  {
    title: "Promoción en SSD NVMe",
    text: "Aprovecha descuentos especiales en almacenamiento de alto rendimiento.",
  },
  {
    title: "Más stock en procesadores AMD",
    text: "Hemos renovado inventario de procesadores para gaming y trabajo.",
  },
];

export function NewsPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-3xl font-bold">Noticias</h1>
          <p className="mt-2 text-white/60">
            Mantente al día con novedades y actualizaciones de Diamond Grid.
          </p>
        </div>

        <div className="mt-6 grid gap-4">
          {news.map((n) => (
            <div
              key={n.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-6"
            >
              <h2 className="text-xl font-semibold">{n.title}</h2>
              <p className="mt-2 text-white/70">{n.text}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}