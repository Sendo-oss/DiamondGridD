import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { API_BASE } from "../lib/api";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [okMessage, setOkMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setOkMessage("");
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "No se pudo procesar la solicitud");
      }

      setOkMessage(
        data?.message ||
          "Si el correo existe, se enviaron instrucciones para recuperar la contraseña"
      );
      setEmail("");
    } catch (err: any) {
      setError(err?.message || "Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout hideSiteChrome>
      <section className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-3xl border border-cyan-400/10 bg-ink-900/60 shadow-[0_0_60px_rgba(34,211,238,0.08)] backdrop-blur">
          <div className="relative overflow-hidden border-b border-white/10 px-6 py-8 sm:px-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(34,211,238,0.10)_1px,transparent_0)] [background-size:22px_22px] opacity-35" />
            <div className="relative">
              <p className="text-xs uppercase tracking-[0.18em] text-diamond-200">
                Seguridad
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                Recuperar contraseña
              </h1>
              <p className="mt-3 max-w-xl text-sm text-white/70 sm:text-base">
                Ingresa tu correo electrónico y te enviaremos un enlace para
                restablecer tu contraseña.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/85">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-diamond-300/30 focus:bg-white/10"
                />
              </div>

              {okMessage && (
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  {okMessage}
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={[
                  "w-full rounded-2xl px-4 py-3 text-sm font-semibold transition",
                  loading
                    ? "cursor-not-allowed border border-white/10 bg-white/5 text-white/50"
                    : "bg-gradient-to-r from-diamond-400 to-diamond-600 shadow-glow hover:scale-[1.01]"
                ].join(" ")}
              >
                {loading ? "Enviando..." : "Enviar enlace de recuperación"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-sm font-medium text-diamond-200 transition hover:text-white"
              >
                Volver a iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
