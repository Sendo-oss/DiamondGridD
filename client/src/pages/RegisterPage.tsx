import { useState } from "react";
import { Layout } from "../components/Layout";
import { authRegister } from "../lib/api";
import { useAuth } from "../app/auth";
import { useNavigate, Link } from "react-router-dom";

export function RegisterPage() {
  const [name, setName] = useState("");
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

    const data = await authRegister({ name, email, password });
    setLoading(false);

    if (!data.ok) return setErr(data.message || "Error al registrarse");

    login({ user: data.user, token: data.token });
    nav("/");
  }

  return (
    <Layout>
      <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-2xl font-semibold">Registrarse</h2>
        <p className="mt-1 text-white/70">Crea tu cuenta en Diamond Grid.</p>

        {err && (
          <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
            {err}
          </div>
        )}

        <form className="mt-5 grid gap-3" onSubmit={onSubmit}>
          <input
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2"
            placeholder="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            disabled={loading}
            className="rounded-xl bg-gradient-to-r from-diamond-400 to-diamond-600 px-4 py-2 font-semibold shadow-glow disabled:opacity-60"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-4 text-sm text-white/70">
          ¿Ya tienes cuenta?{" "}
          <Link className="text-diamond-200 hover:underline" to="/login">
            Inicia sesión
          </Link>
        </p>
      </div>
    </Layout>
  );
}
