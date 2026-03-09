import { Layout } from "../components/Layout";

const stats = [
  {
    value: "1",
    title: "Tienda",
    text: "Actualmente contamos con una tienda completamente digital. En el futuro planeamos expandirnos con una tienda física para brindar una experiencia más completa a nuestros clientes.",
  },
  {
    value: "+75",
    title: "Marcas",
    text: "Trabajamos con fabricantes reconocidos por su calidad y rendimiento.",
  },
  {
    value: "+100",
    title: "Productos",
    text: "Amplio catálogo de componentes de computadoras.",
  },
];

const values = [
  {
    title: "Calidad",
    text: "Seleccionamos productos confiables y de marcas reconocidas en el sector tecnológico.",
  },
  {
    title: "Innovación",
    text: "Buscamos ofrecer una experiencia moderna, intuitiva y alineada con las nuevas tendencias digitales.",
  },
  {
    title: "Confianza",
    text: "Queremos que cada cliente se sienta seguro al comprar y al recibir soporte.",
  },
];

export function AboutPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg backdrop-blur-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-diamond-200">
            Sobre Diamond Grid
          </p>
          <h1 className="mt-3 text-3xl font-bold md:text-4xl">
            Tecnología, rendimiento y confianza en un solo lugar
          </h1>
          <p className="mt-4 max-w-3xl text-white/75">
            En Diamond Grid somos apasionados por la tecnología y el hardware.
            Nuestro objetivo es ofrecer componentes de calidad, precios competitivos
            y una experiencia moderna para cada cliente. Nos enfocamos en brindar
            un servicio confiable para quienes buscan armar, mejorar o mantener sus equipos.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {stats.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 transition duration-300 hover:-translate-y-1 hover:border-diamond-300/30 hover:bg-white/10"
            >
              <p className="text-3xl font-bold text-diamond-200">{item.value}</p>
              <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-white/60">{item.text}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-2xl font-semibold">Nuestra misión</h2>
            <p className="mt-4 text-white/70">
              Proporcionar productos tecnológicos y componentes de alto rendimiento,
              acompañados de una experiencia de compra clara, segura y moderna,
              adaptada a las necesidades de cada cliente.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-2xl font-semibold">Nuestra visión</h2>
            <p className="mt-4 text-white/70">
              Convertirnos en una referencia en la comercialización de componentes
              tecnológicos, destacando por nuestra innovación, confiabilidad y
              compromiso con la satisfacción del cliente.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <h2 className="text-2xl font-semibold">Nuestros valores</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <h3 className="text-lg font-semibold text-diamond-200">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm text-white/65">{value.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-2xl font-semibold">¿Qué ofrecemos?</h2>
            <p className="mt-4 text-white/70">
              En Diamond Grid ponemos a disposición de nuestros clientes una
              selección de productos pensada para gamers, estudiantes,
              profesionales y entusiastas del hardware.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/75">
                Procesadores
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/75">
                Tarjetas gráficas
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/75">
                Memorias RAM
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/75">
                SSD y almacenamiento
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/75">
                Placas madre
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/75">
                Periféricos y accesorios
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-diamond-500/15 to-cyan-500/10 p-8">
            <h2 className="text-2xl font-semibold">¿Por qué elegirnos?</h2>
            <div className="mt-5 space-y-4 text-white/70">
              <p>• Catálogo actualizado con productos de marcas reconocidas.</p>
              <p>• Atención enfocada en resolver dudas y acompañar cada compra.</p>
              <p>• Experiencia digital moderna y orientada al usuario.</p>
              <p>• Compromiso con calidad, confianza y rendimiento.</p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}