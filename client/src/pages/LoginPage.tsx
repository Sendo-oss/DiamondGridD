import { useState } from "react";
import { authLogin } from "../lib/api";
import { useAuth } from "../app/auth";
import { useNavigate, Link } from "react-router-dom";

function GoogleIcon() {
  // Logo "G" de Google en SVG (se ve nítido en cualquier tamaño)
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.23 1.53 7.66 2.8l5.27-5.27C33.72 4.12 29.34 2 24 2 14.73 2 6.93 7.3 3.69 14.97l6.17 4.78C11.57 13.6 17.3 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.5 24.5c0-1.64-.15-2.84-.47-4.09H24v7.75h12.9c-.26 2.04-1.66 5.11-4.78 7.17l6.02 4.66c3.6-3.32 5.66-8.2 5.66-13.49z"
      />
      <path
        fill="#FBBC05"
        d="M9.86 28.25A14.43 14.43 0 0 1 9.1 24c0-1.48.26-2.9.73-4.25l-6.17-4.78A23.94 23.94 0 0 0 2 24c0 3.87.93 7.53 2.57 10.78l6.29-6.53z"
      />
      <path
        fill="#34A853"
        d="M24 46c6.54 0 12.03-2.16 16.04-5.86l-6.02-4.66c-1.61 1.12-3.77 1.9-10.02 1.9-6.7 0-12.39-4.1-14.11-9.78l-6.29 6.53C6.93 40.7 14.73 46 24 46z"
      />
      <path fill="none" d="M2 2h44v44H2z" />
    </svg>
  );
}

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const nav = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const data = await authLogin({ email, password });

      if (!data.ok) return setErr(data.message || "Error al iniciar sesión");

      login({ user: data.user, token: data.token });

      // redirección por rol:
      if (data.user.role === "admin") nav("/admin");
      else if (data.user.role === "worker") nav("/worker");
      else nav("/");
    } catch (e: any) {
      setErr(e?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  // OJO: esto solo redirige; necesitas tener esa ruta en tu backend.
  // Ej: GET http://localhost:4000/api/auth/google
  function onGoogleLogin() {
    window.location.href = "http://localhost:4000/api/auth/google";
  }

  return (
    <div className="min-h-screen bg-ink-950 text-white">
      {/* Fondo “digital” */}
      <div className="pointer-events-none fixed inset-0 opacity-70">
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900 via-ink-950 to-ink-950" />
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-diamond-500/15 blur-3xl" />
        <div className="absolute bottom-[-180px] right-[-120px] h-[520px] w-[520px] rounded-full bg-diamond-300/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(34,211,238,0.10)_1px,transparent_0)] [background-size:22px_22px]" />
      </div>

      {/* Full pantalla: SOLO login */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-10">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">Iniciar sesión</h2>
            <p className="mt-1 text-white/70">Entra con tu cuenta para continuar.</p>
          </div>

          {err && (
            <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
              {err}
            </div>
          )}

          {/* ✅ Google (con logo) */}
          <button
            type="button"
            onClick={onGoogleLogin}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white/90 hover:bg-white/10"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white">
              <GoogleIcon />
            </span>
            <span>Continuar con Google</span>
          </button>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-white/50">o</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* ✅ Email + password */}
          <form className="grid gap-3" onSubmit={onSubmit}>
            <div>
              <label className="text-xs text-white/60">Email</label>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 outline-none focus:border-diamond-300/40"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="text-xs text-white/60">Contraseña</label>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 outline-none focus:border-diamond-300/40"
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button
              disabled={loading}
              className="mt-1 rounded-xl bg-gradient-to-r from-diamond-400 to-diamond-600 px-4 py-2 font-semibold shadow-glow disabled:opacity-60"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="mt-4 text-sm text-white/70">
            ¿No tienes cuenta?{" "}
            <Link className="text-diamond-200 hover:underline" to="/register">
              Regístrate
            </Link>
          </p>

          <p className="mt-3 text-xs text-white/50">
            Nota: el botón de Google solo funcionará cuando tu backend tenga la ruta{" "}
            <span className="text-white/70">/api/auth/google</span> implementada.
          </p>
        </div>
      </div>
    </div>
  );
}