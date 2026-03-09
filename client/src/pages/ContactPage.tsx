import { useState } from "react";
import { Layout } from "../components/Layout";

export function ContactPage() {
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <Layout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-3xl font-bold">Centro de contacto</h1>
          <p className="mt-2 text-white/60">
            ¿Tienes dudas sobre pedidos, productos o pagos? Escríbenos.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div className="rounded-3xl border border-white/10 bg-ink-900/60 p-6">
            <h2 className="text-2xl font-semibold">Información</h2>

            <div className="mt-5 grid gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-white/50">Correo</p>
                <p className="mt-1 font-semibold">soporte@diamondgrid.com</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-white/50">WhatsApp</p>
                <p className="mt-1 font-semibold">+593 000 000 000</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-white/50">Horario</p>
                <p className="mt-1 font-semibold">Lunes a Viernes • 09:00 - 18:00</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-2xl font-semibold">Envíanos un mensaje</h2>

            {msg && (
              <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                {msg}
              </div>
            )}

            <form
              className="mt-6 grid gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                setMsg("✅ Tu mensaje fue enviado correctamente.");
              }}
            >
              <div>
                <label className="text-sm text-white/60">Nombre</label>
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-diamond-300/40"
                  placeholder="Tu nombre"
                />
              </div>

              <div>
                <label className="text-sm text-white/60">Correo</label>
                <input
                  type="email"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-diamond-300/40"
                  placeholder="tucorreo@gmail.com"
                />
              </div>

              <div>
                <label className="text-sm text-white/60">Mensaje</label>
                <textarea
                  className="mt-2 min-h-[160px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-diamond-300/40"
                  placeholder="Escribe tu mensaje..."
                />
              </div>

              <button className="rounded-2xl bg-gradient-to-r from-diamond-400 to-diamond-600 px-6 py-3 font-semibold shadow-glow">
                Enviar mensaje
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}