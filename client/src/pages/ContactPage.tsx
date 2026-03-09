import { useState } from "react";
import { Layout } from "../components/Layout";

type ContactForm = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export function ContactPage() {
  const [form, setForm] = useState<ContactForm>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!form.name.trim()) {
      setErrorMsg("Por favor, ingresa tu nombre.");
      return;
    }

    if (!form.email.trim()) {
      setErrorMsg("Por favor, ingresa tu correo electrónico.");
      return;
    }

    if (!validateEmail(form.email)) {
      setErrorMsg("Ingresa un correo electrónico válido.");
      return;
    }

    if (!form.subject.trim()) {
      setErrorMsg("Por favor, ingresa un asunto.");
      return;
    }

    if (!form.message.trim()) {
      setErrorMsg("Por favor, escribe tu mensaje.");
      return;
    }

    if (form.message.trim().length < 10) {
      setErrorMsg("El mensaje debe tener al menos 10 caracteres.");
      return;
    }

    try {
      setLoading(true);

      // Simulación temporal de envío
      await new Promise((resolve) => setTimeout(resolve, 1200));

      setSuccessMsg("✅ Tu mensaje fue enviado correctamente. Te responderemos pronto.");
      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch {
      setErrorMsg("Ocurrió un error al enviar el mensaje. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg backdrop-blur-sm">
          <h1 className="text-3xl font-bold">Centro de contacto</h1>
          <p className="mt-2 max-w-2xl text-white/60">
            ¿Tienes dudas sobre pedidos, productos, pagos o soporte técnico?
            En Diamond Grid estamos listos para ayudarte.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.2fr]">
          <div className="rounded-3xl border border-white/10 bg-ink-900/60 p-6 shadow-lg">
            <h2 className="text-2xl font-semibold">Información de contacto</h2>
            <p className="mt-2 text-sm text-white/55">
              Puedes comunicarte con nosotros a través de los siguientes medios.
            </p>

            <div className="mt-6 grid gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-white/50">Correo electrónico</p>
                <p className="mt-1 font-semibold text-white">
                  soporte@diamondgrid.com
                </p>
                <p className="mt-1 text-sm text-white/45">
                  Atención para consultas generales y soporte.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-white/50">WhatsApp</p>
                <p className="mt-1 font-semibold text-white">
                  +593 96 337 6099
                </p>
                <p className="mt-1 text-sm text-white/45">
                  Soporte rápido para pedidos y seguimiento.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-white/50">Horario de atención</p>
                <p className="mt-1 font-semibold text-white">
                  Lunes a Viernes • 09:00 - 18:00
                </p>
                <p className="mt-1 text-sm text-white/45">
                  Respuesta dentro de horario laboral.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-white/50">Ubicación</p>
                <p className="mt-1 font-semibold text-white">Ecuador</p>
                <p className="mt-1 text-sm text-white/45">
                  Operamos con atención en línea y gestión de pedidos.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg backdrop-blur-sm">
            <h2 className="text-2xl font-semibold">Envíanos un mensaje</h2>
            <p className="mt-2 text-sm text-white/55">
              Completa el formulario y nos pondremos en contacto contigo.
            </p>

            {successMsg && (
              <div
                className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200"
                aria-live="polite"
              >
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div
                className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200"
                aria-live="polite"
              >
                {errorMsg}
              </div>
            )}

            <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="text-sm text-white/60">
                  Nombre completo
                </label>
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-diamond-300/40"
                  placeholder="Tu nombre completo"
                />
              </div>

              <div>
                <label htmlFor="email" className="text-sm text-white/60">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-diamond-300/40"
                  placeholder="tucorreo@gmail.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="text-sm text-white/60">
                  Asunto
                </label>
                <input
                  id="subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-diamond-300/40"
                  placeholder="Ej. Problema con un pedido"
                />
              </div>

              <div>
                <label htmlFor="message" className="text-sm text-white/60">
                  Mensaje
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  className="mt-2 min-h-[160px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-diamond-300/40"
                  placeholder="Escribe tu mensaje..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-gradient-to-r from-diamond-400 to-diamond-600 px-6 py-3 font-semibold text-white shadow-glow transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Enviando..." : "Enviar mensaje"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}