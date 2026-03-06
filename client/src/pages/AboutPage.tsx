import { Layout } from "../components/Layout";

export function AboutPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-3xl font-bold">Quiénes somos</h1>
          <p className="mt-4 max-w-3xl text-white/75">
            En Diamond Grid somos apasionados por la tecnología y el hardware.
            Nuestro objetivo es ofrecer componentes de calidad, buenos precios
            y una experiencia moderna para cada cliente.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-3xl font-bold text-diamond-200">2+</p>
            <h3 className="mt-2 text-lg font-semibold">Tiendas</h3>
            <p className="mt-2 text-sm text-white/60">
              Tiendas físicas en puntos estratégicos de la ciudad.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-3xl font-bold text-diamond-200">115+</p>
            <h3 className="mt-2 text-lg font-semibold">Marcas</h3>
            <p className="mt-2 text-sm text-white/60">
              Trabajamos solo con fabricantes y marcas reconocidas.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-3xl font-bold text-diamond-200">100%</p>
            <h3 className="mt-2 text-lg font-semibold">Clientes felices</h3>
            <p className="mt-2 text-sm text-white/60">
              Nuestro compromiso es brindar la mejor experiencia.
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
}