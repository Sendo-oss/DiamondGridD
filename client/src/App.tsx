import { Layout } from "./components/Layout";
import { Chatbot } from "./components/Chatbot";

export default function App() {
  return (
    <Layout>
      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h2 className="text-2xl font-semibold">Bienvenido a Diamond Grid</h2>
          <p className="mt-2 text-white/70">
            Un sistema moderno para explorar componentes, comparar precios y armar builds recomendadas.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-ink-900/60 p-4">
              <p className="text-sm text-white/60">Módulo</p>
              <p className="mt-1 font-semibold">Catálogo</p>
              <p className="mt-1 text-sm text-white/70">Lista y filtra componentes.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-ink-900/60 p-4">
              <p className="text-sm text-white/60">Módulo</p>
              <p className="mt-1 font-semibold">Recomendador</p>
              <p className="mt-1 text-sm text-white/70">DiamondBot arma tu PC ideal.</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full border border-diamond-300/20 bg-diamond-500/10 px-3 py-1 text-sm text-white/80">
              UI Dark + Glow
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/70">
              PostgreSQL + Prisma
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/70">
              API Express
            </span>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-diamond-500/10 p-6">
          <h3 className="text-xl font-semibold">To-do del proyecto</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-white/75">
            <li>Seed de componentes reales</li>
            <li>Filtros por tipo / precio / marca</li>
            <li>Compatibilidad (socket, PSU watts, etc.)</li>
            <li>Guardar builds en base</li>
            <li>Login (opcional)</li>
          </ol>

          <div className="mt-6 rounded-2xl border border-white/10 bg-ink-900/60 p-4 text-sm text-white/70">
            Tip: primero deja funcionando el recomendador (chatbot). Luego mejoras la lógica de compatibilidad.
          </div>
        </div>
      </section>

      <Chatbot />
    </Layout>
  );
}
