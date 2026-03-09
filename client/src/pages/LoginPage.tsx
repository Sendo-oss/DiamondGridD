import { useEffect, useRef, useState } from "react";
import { authGoogle, authLogin, getGoogleClientId } from "../lib/api";
import { useAuth } from "../app/auth";
import { Link, useNavigate } from "react-router-dom";

declare global {
  interface Window {
    google?: any;
  }
}

function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) return resolve();

    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("No se pudo cargar Google Identity script"));
    document.head.appendChild(s);
  });
}

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const nav = useNavigate();

  const googleBtnRef = useRef<HTMLDivElement | null>(null);
  const [googleReady, setGoogleReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function setupGoogle() {
      try {
        const clientId = await getGoogleClientId();
        if (!clientId) {
          setErr("Falta GOOGLE_CLIENT_ID en el servidor");
          return;
        }

        await loadGoogleScript();

        if (cancelled) return;
        if (!window.google?.accounts?.id) {
          setErr("No se pudo cargar Google");
          return;
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (resp: any) => {
            try {
              setErr(null);
              const data = await authGoogle(resp.credential);

              if (!data?.ok) {
                setErr(data?.message || "No se pudo iniciar con Google");
                return;
              }

              login({ user: data.user, token: data.token });

              if (data.user.role === "admin") nav("/admin");
              else if (data.user.role === "worker") nav("/worker");
              else nav("/");
            } catch (e: any) {
              setErr(e?.message || "Error con Google");
            }
          },
        });

        if (googleBtnRef.current) {
          googleBtnRef.current.innerHTML = "";
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: "outline",
            size: "large",
            shape: "pill",
            width: 360,
            text: "continue_with",
          });
        }

        setGoogleReady(true);
      } catch (e: any) {
        setErr(e?.message || "No se pudo iniciar Google");
      }
    }

    setupGoogle();
    return () => {
      cancelled = true;
    };
  }, [login, nav]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const data = await authLogin({ email, password });

      if (!data.ok) {
        setErr(data.message || "Error al iniciar sesión");
        return;
      }

      login({ user: data.user, token: data.token });

      if (data.user.role === "admin") nav("/admin");
      else if (data.user.role === "worker") nav("/worker");
      else nav("/");
    } catch (e: any) {
      setErr(e?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink-950 text-white">
      <div className="pointer-events-none fixed inset-0 opacity-70">
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900 via-ink-950 to-ink-950" />
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-diamond-500/15 blur-3xl" />
        <div className="absolute bottom-[-180px] right-[-120px] h-[520px] w-[520px] rounded-full bg-diamond-300/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(34,211,238,0.10)_1px,transparent_0)] [background-size:22px_22px]" />
      </div>

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

          {/* Botón Google real */}
          <div className="mb-4 flex justify-center">
            <div ref={googleBtnRef} />
          </div>

          {!googleReady && (
            <p className="mb-4 text-center text-xs text-white/50">
              Cargando Google...
            </p>
          )}

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-white/50">o</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

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
        </div>
      </div>
    </div>
  );
}