import { useState } from "react";
import { Layout } from "../components/Layout";
import { authRegister } from "../lib/api";
import { useAuth } from "../app/auth";
import { useNavigate, Link } from "react-router-dom";

export function RegisterPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [receiveNews, setReceiveNews] = useState(false);

  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const nav = useNavigate();

  function validateEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validateForm() {
    if (!name.trim()) return "Ingresa tu nombre completo.";
    if (!email.trim()) return "Ingresa tu correo electrónico.";
    if (!validateEmail(email)) return "Ingresa un correo electrónico válido.";
    if (!password.trim()) return "Ingresa una contraseña.";
    if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
    if (!confirmPassword.trim()) return "Confirma tu contraseña.";
    if (password !== confirmPassword) return "Las contraseñas no coinciden.";
    if (!acceptTerms) return "Debes aceptar los términos y condiciones.";
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSuccess(null);

    const validationError = validateForm();
    if (validationError) {
      setErr(validationError);
      return;
    }

    try {
      setLoading(true);

      const data = await authRegister({
        name,
        username,
        email,
        phone,
        password,
        receiveNews,
      });

      if (!data.ok) {
        setErr(data.message || "Error al registrarse");
        return;
      }

      setSuccess("Cuenta creada correctamente.");

      login({ user: data.user, token: data.token });
      nav("/");
    } catch {
      setErr("Ocurrió un error inesperado al crear la cuenta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-5xl">
        <div className="grid overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-xl lg:grid-cols-[1fr_1.1fr]">
          <div className="border-b border-white/10 bg-gradient-to-br from-diamond-500/15 to-cyan-500/10 p-8 lg:border-b-0 lg:border-r">
            <h1 className="text-3xl font-bold">Únete a Diamond Grid</h1>
            <p className="mt-3 text-white/70">
              Crea tu cuenta para acceder a una experiencia más rápida, segura y personalizada.
            </p>

            <div className="mt-8 grid gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h3 className="font-semibold">Compra más rápido</h3>
                <p className="mt-1 text-sm text-white/60">
                  Guarda tus datos y agiliza tus futuras compras.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h3 className="font-semibold">Sigue tus pedidos</h3>
                <p className="mt-1 text-sm text-white/60">
                  Consulta el estado de tus compras y pedidos en un solo lugar.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h3 className="font-semibold">Recibe novedades</h3>
                <p className="mt-1 text-sm text-white/60">
                  Mantente al día con promociones, stock nuevo y lanzamientos.
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <h2 className="text-2xl font-semibold">Crear cuenta</h2>
            <p className="mt-1 text-white/65">
              Completa el formulario para registrarte.
            </p>

            {err && (
              <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
                {err}
              </div>
            )}

            {success && (
              <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                {success}
              </div>
            )}

            <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
              <div>
                <label className="text-sm text-white/60">Nombre completo</label>
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-diamond-300/40"
                  placeholder="Michael Buitrón"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm text-white/60">Nombre de usuario</label>
                  <input
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-diamond-300/40"
                    placeholder="michaelbg"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm text-white/60">Teléfono</label>
                  <input
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-diamond-300/40"
                    placeholder="+593 999 999 999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-white/60">Correo electrónico</label>
                <input
                  type="email"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-diamond-300/40"
                  placeholder="correo@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm text-white/60">Contraseña</label>
                  <input
                    type="password"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-diamond-300/40"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-white/45">
                    Mínimo 8 caracteres.
                  </p>
                </div>

                <div>
                  <label className="text-sm text-white/60">Confirmar contraseña</label>
                  <input
                    type="password"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-diamond-300/40"
                    placeholder="********"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-2 grid gap-3">
                <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                  />
                  <span>
                    Acepto los términos y condiciones y la política de privacidad.
                  </span>
                </label>

                <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={receiveNews}
                    onChange={(e) => setReceiveNews(e.target.checked)}
                  />
                  <span>
                    Quiero recibir promociones, novedades y lanzamientos de Diamond Grid.
                  </span>
                </label>
              </div>

              <button
                disabled={loading}
                className="mt-2 rounded-2xl bg-gradient-to-r from-diamond-400 to-diamond-600 px-6 py-3 font-semibold text-white shadow-glow transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </button>
            </form>

            <p className="mt-5 text-sm text-white/70">
              ¿Ya tienes cuenta?{" "}
              <Link className="text-diamond-200 hover:underline" to="/login">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}