import { useEffect, useMemo, useRef, useState } from "react";
import {
  authGoogle,
  authLogin,
  getGoogleClientId,
  forgotPassword as forgotPasswordApi,
  resetPassword as resetPasswordApi,
} from "../lib/api";
import { useAuth } from "../app/auth";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

declare global {
  interface Window {
    google?: any;
  }
}

function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
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

type Mode = "login" | "forgot" | "reset";

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (!password) return { score: 0, label: "Vacía", width: "0%", barClass: "bg-white/10", textClass: "text-white/30" };
  if (score <= 2) return { score, label: "Débil", width: "33%", barClass: "bg-rose-500", textClass: "text-rose-300" };
  if (score <= 4) return { score, label: "Media", width: "66%", barClass: "bg-amber-400", textClass: "text-amber-300" };
  return { score, label: "Fuerte", width: "100%", barClass: "bg-teal-400", textClass: "text-teal-300" };
}

function PasswordStrength({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  return (
    <div className="mt-2.5 space-y-1.5">
      <div className="h-1 overflow-hidden rounded-full bg-white/8">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${strength.barClass}`}
          style={{ width: strength.width }}
        />
      </div>
      <p className={`text-[11px] font-medium tracking-wide ${strength.textClass}`}>
        Seguridad: {strength.label}
      </p>
    </div>
  );
}

const EyeIcon = ({ open }: { open: boolean }) => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    {open ? (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </>
    ) : (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </>
    )}
  </svg>
);

const ArrowLeft = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

function InputField({
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  icon,
  showToggle,
  isVisible,
  onToggle,
  children,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  autoComplete?: string;
  icon?: React.ReactNode;
  showToggle?: boolean;
  isVisible?: boolean;
  onToggle?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-widest text-white/40">
        {label}
      </label>
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-cyan-400/70 transition-colors duration-200">
            {icon}
          </div>
        )}
        <input
          className={[
            "w-full rounded-2xl border bg-white/4 py-3.5 outline-none transition-all duration-200",
            "text-white placeholder:text-white/20 text-sm",
            "border-white/8 focus:border-cyan-400/30 focus:bg-white/7 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.06)]",
            icon ? "pl-11 pr-4" : "px-4",
            showToggle ? "pr-12" : "",
          ].join(" ")}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
        {showToggle && onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors duration-150"
          >
            <EyeIcon open={!!isVisible} />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function Alert({ type, message }: { type: "error" | "success"; message: string }) {
  const styles = {
    error: "border-rose-500/20 bg-rose-500/8 text-rose-300",
    success: "border-teal-400/20 bg-teal-500/8 text-teal-300",
  };
  const icons = {
    error: "✕",
    success: "✓",
  };
  return (
    <div className={`flex items-start gap-3 rounded-2xl border p-3.5 text-sm ${styles[type]}`}>
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold opacity-70">
        {icons[type]}
      </span>
      <span className="leading-relaxed">{message}</span>
    </div>
  );
}

function PrimaryButton({ loading, disabled, loadingText, text }: {
  loading: boolean;
  disabled?: boolean;
  loadingText: string;
  text: string;
}) {
  return (
    <button
      disabled={loading || disabled}
      className={[
        "relative w-full rounded-2xl py-3.5 text-sm font-semibold tracking-wide transition-all duration-200 overflow-hidden",
        loading || disabled
          ? "cursor-not-allowed bg-white/5 text-white/30 border border-white/8"
          : "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_4px_24px_rgba(34,211,238,0.18)] hover:shadow-[0_4px_32px_rgba(34,211,238,0.28)] hover:scale-[1.015] active:scale-[0.99]",
      ].join(" ")}
    >
      {!(loading || disabled) && (
        <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200" />
      )}
      <span className="relative">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {loadingText}
          </span>
        ) : text}
      </span>
    </button>
  );
}

const FEATURES = [
  {
    icon: <ShieldIcon />,
    label: "Autenticación segura",
    desc: "JWT + sesiones protegidas con encriptación de extremo a extremo.",
  },
  {
    icon: <MailIcon />,
    label: "Recuperación por email",
    desc: "Enlace temporal con expiración para restablecer tu contraseña.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
      </svg>
    ),
    label: "Acceso con Google",
    desc: "Un clic para entrar usando tu cuenta de Google.",
  },
];

export function LoginPage() {
  const [params, setParams] = useSearchParams();
  const resetToken = params.get("token");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>(resetToken ? "reset" : "login");

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { login } = useAuth();
  const nav = useNavigate();

  const googleBtnRef = useRef<HTMLDivElement | null>(null);
  const [googleReady, setGoogleReady] = useState(false);

  const passwordStrength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);
  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;

  useEffect(() => {
    if (resetToken) setMode("reset");
  }, [resetToken]);

  useEffect(() => {
    if (mode !== "login") return;
    let cancelled = false;

    async function setupGoogle() {
      try {
        const clientId = await getGoogleClientId();
        if (!clientId) return;
        await loadGoogleScript();
        if (cancelled || !window.google?.accounts?.id) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (resp: any) => {
            try {
              setErr(null);
              setMsg(null);
              const data = await authGoogle(resp.credential);
              if (!data?.ok) { setErr(data?.message || "No se pudo iniciar con Google"); return; }
              login({ user: data.user, token: data.token });
              if (data.user.role === "admin") nav("/admin");
              else if (data.user.role === "worker") nav("/worker");
              else nav("/");
            } catch (e: any) { setErr(e?.message || "Error con Google"); }
          },
        });

        if (googleBtnRef.current) {
          googleBtnRef.current.innerHTML = "";
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: "outline", size: "large", shape: "pill", width: 360, text: "continue_with",
          });
        }
        setGoogleReady(true);
      } catch { setGoogleReady(false); }
    }

    setupGoogle();
    return () => { cancelled = true; };
  }, [mode, login, nav]);

  function switchMode(nextMode: Mode) {
    setErr(null);
    setMsg(null);
    setLoading(false);
    if (nextMode !== "reset") {
      setNewPassword("");
      setConfirmPassword("");
      if (!resetToken && mode === "reset") setParams({});
    }
    setMode(nextMode);
  }

  async function onSubmitLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setMsg(null); setLoading(true);
    try {
      const data = await authLogin({ email, password });
      if (!data.ok) { setErr(data.message || "Error al iniciar sesión"); return; }
      login({ user: data.user, token: data.token });
      if (data.user.role === "admin") nav("/admin");
      else if (data.user.role === "worker") nav("/worker");
      else nav("/");
    } catch (e: any) { setErr(e?.message || "Error al iniciar sesión"); }
    finally { setLoading(false); }
  }

  async function onForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setMsg(null); setLoading(true);
    try {
      const data = await forgotPasswordApi(email);
      if (!data.ok) { setErr(data.message || "No se pudo enviar el correo"); return; }
      setMsg(data.message || "Si el correo existe, se enviaron instrucciones a tu bandeja");
    } catch (e: any) { setErr(e?.message || "Error al solicitar recuperación"); }
    finally { setLoading(false); }
  }

  async function onResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setMsg(null);
    if (!resetToken) { setErr("Falta token de recuperación"); return; }
    if (newPassword.length < 6) { setErr("La nueva contraseña debe tener al menos 6 caracteres"); return; }
    if (newPassword !== confirmPassword) { setErr("Las contraseñas no coinciden"); return; }
    setLoading(true);
    try {
      const data = await resetPasswordApi(resetToken, newPassword);
      if (!data.ok) { setErr(data.message || "No se pudo restablecer la contraseña"); return; }
      setMsg("✅ Contraseña actualizada. Ahora puedes iniciar sesión.");
      setNewPassword(""); setConfirmPassword("");
      setTimeout(() => { setParams({}); switchMode("login"); }, 1200);
    } catch (e: any) { setErr(e?.message || "Error al restablecer la contraseña"); }
    finally { setLoading(false); }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap');

        .login-root {
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          background: #050810;
          color: #fff;
          position: relative;
          overflow: hidden;
        }

        .login-root * { box-sizing: border-box; }

        .bg-mesh {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .bg-mesh::before {
          content: '';
          position: absolute;
          top: -200px;
          left: 50%;
          transform: translateX(-60%);
          width: 900px;
          height: 700px;
          background: radial-gradient(ellipse at center, rgba(34,211,238,0.07) 0%, rgba(59,130,246,0.05) 40%, transparent 70%);
          filter: blur(60px);
        }

        .bg-mesh::after {
          content: '';
          position: absolute;
          bottom: -200px;
          right: -100px;
          width: 600px;
          height: 600px;
          background: radial-gradient(ellipse at center, rgba(99,102,241,0.07) 0%, transparent 70%);
          filter: blur(60px);
        }

        .grid-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse at 50% 0%, black 0%, transparent 70%);
        }

        .panel {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 40px 24px;
        }

        .card {
          display: grid;
          width: 100%;
          max-width: 1040px;
          border-radius: 28px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(24px);
          overflow: hidden;
          box-shadow: 0 32px 96px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset;
        }

        @media (min-width: 1024px) {
          .card { grid-template-columns: 1.1fr 0.9fr; }
        }

        .left-panel {
          display: none;
          border-right: 1px solid rgba(255,255,255,0.06);
          padding: 48px;
          background: linear-gradient(135deg, rgba(34,211,238,0.04) 0%, rgba(99,102,241,0.04) 100%);
          position: relative;
        }

        @media (min-width: 1024px) {
          .left-panel { display: flex; flex-direction: column; justify-content: space-between; }
        }

        .left-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(34,211,238,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,211,238,0.05) 1px, transparent 1px);
          background-size: 32px 32px;
          border-radius: 28px 0 0 28px;
          opacity: 0.5;
        }

        .brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(0,0,0,0.3);
          padding: 12px 16px;
          backdrop-filter: blur(12px);
          width: fit-content;
        }

        .brand-name {
          font-family: 'Syne', sans-serif;
          font-size: 17px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .brand-sub {
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .left-headline {
          font-family: 'Syne', sans-serif;
          font-size: 38px;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.03em;
          margin-top: 40px;
          max-width: 380px;
        }

        .left-headline span {
          background: linear-gradient(135deg, #22d3ee, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .left-sub {
          margin-top: 16px;
          font-size: 14px;
          line-height: 1.7;
          color: rgba(255,255,255,0.5);
          max-width: 340px;
        }

        .feature-list {
          margin-top: 36px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(0,0,0,0.2);
          padding: 16px;
          transition: border-color 0.2s;
        }

        .feature-item:hover { border-color: rgba(34,211,238,0.2); }

        .feature-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(34,211,238,0.08);
          color: rgba(34,211,238,0.7);
          flex-shrink: 0;
          margin-top: 1px;
        }

        .feature-label {
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.85);
        }

        .feature-desc {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          margin-top: 2px;
          line-height: 1.6;
        }

        .tech-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 32px;
        }

        .pill {
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          padding: 5px 12px;
          font-size: 11px;
          color: rgba(255,255,255,0.5);
          font-weight: 500;
          letter-spacing: 0.04em;
        }

        .pill-cyan {
          border-color: rgba(34,211,238,0.2);
          background: rgba(34,211,238,0.07);
          color: rgba(34,211,238,0.8);
        }

        .right-panel {
          padding: 40px;
        }

        @media (min-width: 640px) {
          .right-panel { padding: 48px; }
        }

        .form-inner {
          max-width: 400px;
          margin: 0 auto;
          transition: opacity 0.2s, transform 0.2s;
        }

        .mode-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(34,211,238,0.6);
          margin-bottom: 8px;
          font-family: 'Syne', sans-serif;
        }

        .form-title {
          font-family: 'Syne', sans-serif;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.2;
        }

        .form-subtitle {
          font-size: 14px;
          color: rgba(255,255,255,0.45);
          margin-top: 8px;
          line-height: 1.6;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 14px;
          margin: 24px 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.07);
        }

        .divider-text {
          font-size: 11px;
          color: rgba(255,255,255,0.3);
          font-weight: 500;
          letter-spacing: 0.08em;
        }

        .link-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(34,211,238,0.7);
          font-size: 13px;
          font-weight: 600;
          padding: 0;
          transition: color 0.15s;
          font-family: 'Inter', sans-serif;
        }

        .link-btn:hover { color: rgba(34,211,238,1); }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 20px;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.35);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: color 0.15s;
          font-family: 'Inter', sans-serif;
        }

        .back-btn:hover { color: rgba(255,255,255,0.7); }

        .forgot-link {
          font-size: 12px;
          color: rgba(34,211,238,0.5);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          font-family: 'Inter', sans-serif;
          transition: color 0.15s;
          text-align: right;
          display: block;
          margin-top: 8px;
          margin-left: auto;
        }

        .forgot-link:hover { color: rgba(34,211,238,0.9); }

        .register-row {
          margin-top: 24px;
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          text-align: center;
        }

        .no-token-warn {
          border-radius: 16px;
          border: 1px solid rgba(239,68,68,0.2);
          background: rgba(239,68,68,0.06);
          padding: 14px 16px;
          font-size: 13px;
          color: rgba(252,165,165,0.9);
          margin-bottom: 20px;
        }

        .google-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 4px;
          min-height: 44px;
        }

        .google-pulse {
          text-align: center;
          font-size: 12px;
          color: rgba(255,255,255,0.3);
          animation: pulse 2s infinite;
          padding: 12px 0;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }

        .form-grid {
          display: grid;
          gap: 18px;
        }

        .confirm-match {
          font-size: 11px;
          margin-top: 6px;
          font-weight: 500;
        }

        .hint-text {
          font-size: 11px;
          color: rgba(251,191,36,0.7);
          margin-top: 8px;
        }

        label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin-bottom: 7px;
        }

        input {
          width: 100%;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.04);
          padding: 13px 14px 13px 44px;
          color: #fff;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }

        input::placeholder { color: rgba(255,255,255,0.18); }

        input:focus {
          border-color: rgba(34,211,238,0.25);
          background: rgba(255,255,255,0.06);
          box-shadow: 0 0 0 3px rgba(34,211,238,0.05);
        }

        .input-wrap {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.2);
          transition: color 0.2s;
          pointer-events: none;
          display: flex;
          align-items: center;
        }

        .input-wrap:focus-within .input-icon {
          color: rgba(34,211,238,0.5);
        }

        .input-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.2);
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }

        .input-toggle:hover { color: rgba(255,255,255,0.6); }

        input.no-icon { padding-left: 14px; }
        input.with-toggle { padding-right: 44px; }
      `}</style>

      <div className="login-root">
        <div className="bg-mesh" />
        <div className="grid-bg" />

        <div className="panel">
          <div className="card">
            {/* LEFT PANEL */}
            <div className="left-panel">
              <div className="left-grid" />

              <div style={{ position: "relative" }}>
                <div className="brand-badge">
                  <img src="/logo.png" alt="Diamond Grid" style={{ height: 40, width: "auto", objectFit: "contain" }} />
                  <div>
                    <div className="brand-name">Diamond Grid</div>
                    <div className="brand-sub">Sistema de Componentes</div>
                  </div>
                </div>

                <h2 className="left-headline">
                  Tu cuenta,<br />
                  <span>protegida</span><br />
                  y lista.
                </h2>

                <p className="left-sub">
                  Accede de forma segura, recupera tu contraseña y continúa explorando los mejores componentes del mercado.
                </p>

                <div className="feature-list">
                  {FEATURES.map((f, i) => (
                    <div className="feature-item" key={i}>
                      <div className="feature-icon">{f.icon}</div>
                      <div>
                        <div className="feature-label">{f.label}</div>
                        <div className="feature-desc">{f.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="tech-pills" style={{ position: "relative" }}>
                <span className="pill pill-cyan">Dark UI + Glow</span>
                <span className="pill">JWT + Prisma</span>
                <span className="pill">Google OAuth</span>
                <span className="pill">React + TS</span>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="right-panel">
              <div className="form-inner" style={{ opacity: loading ? 0.92 : 1, transform: loading ? "scale(0.998)" : "scale(1)" }}>

                {/* LOGIN MODE */}
                {mode === "login" && (
                  <>
                    <div className="mode-label">Diamond Grid</div>
                    <h2 className="form-title">Bienvenido de nuevo</h2>
                    <p className="form-subtitle">Ingresa a tu cuenta para continuar comprando.</p>

                    <div style={{ marginTop: 28 }}>
                      {err && <div style={{ marginBottom: 16 }}><Alert type="error" message={err} /></div>}
                      {msg && <div style={{ marginBottom: 16 }}><Alert type="success" message={msg} /></div>}

                      <div className="google-wrap">
                        <div ref={googleBtnRef} />
                      </div>

                      {!googleReady && (
                        <p className="google-pulse">Cargando acceso con Google...</p>
                      )}

                      <div className="divider">
                        <div className="divider-line" />
                        <span className="divider-text">o continúa con email</span>
                        <div className="divider-line" />
                      </div>

                      <form className="form-grid" onSubmit={onSubmitLogin}>
                        <div>
                          <label>Email</label>
                          <div className="input-wrap">
                            <span className="input-icon"><MailIcon /></span>
                            <input
                              type="email"
                              placeholder="tu@email.com"
                              value={email}
                              onChange={e => setEmail(e.target.value)}
                              autoComplete="email"
                              className="with-icon"
                            />
                          </div>
                        </div>

                        <div>
                          <label>Contraseña</label>
                          <div className="input-wrap">
                            <span className="input-icon"><LockIcon /></span>
                            <input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={password}
                              onChange={e => setPassword(e.target.value)}
                              autoComplete="current-password"
                              className="with-toggle"
                            />
                            <button type="button" className="input-toggle" onClick={() => setShowPassword(v => !v)}>
                              <EyeIcon open={showPassword} />
                            </button>
                          </div>
                          <button type="button" className="forgot-link" onClick={() => switchMode("forgot")}>
                            ¿Olvidaste tu contraseña?
                          </button>
                        </div>

                        <PrimaryButton loading={loading} loadingText="Entrando..." text="Iniciar sesión" />
                      </form>

                      <p className="register-row">
                        ¿No tienes cuenta?{" "}
                        <Link to="/register" style={{ color: "rgba(34,211,238,0.7)", fontWeight: 600, textDecoration: "none" }}>
                          Regístrate gratis
                        </Link>
                      </p>
                    </div>
                  </>
                )}

                {/* FORGOT MODE */}
                {mode === "forgot" && (
                  <>
                    <div className="mode-label">Recuperación</div>
                    <h2 className="form-title">Olvidé mi contraseña</h2>
                    <p className="form-subtitle">Te enviaremos un enlace temporal para crear una nueva.</p>

                    <div style={{ marginTop: 28 }}>
                      {err && <div style={{ marginBottom: 16 }}><Alert type="error" message={err} /></div>}
                      {msg && <div style={{ marginBottom: 16 }}><Alert type="success" message={msg} /></div>}

                      <form className="form-grid" onSubmit={onForgotPassword}>
                        <div>
                          <label>Correo electrónico</label>
                          <div className="input-wrap">
                            <span className="input-icon"><MailIcon /></span>
                            <input
                              type="email"
                              placeholder="tu@email.com"
                              value={email}
                              onChange={e => setEmail(e.target.value)}
                              autoComplete="email"
                            />
                          </div>
                        </div>

                        <PrimaryButton loading={loading} loadingText="Enviando enlace..." text="Enviar enlace de recuperación" />
                      </form>

                      <button type="button" className="back-btn" onClick={() => switchMode("login")}>
                        <ArrowLeft /> Volver al inicio de sesión
                      </button>
                    </div>
                  </>
                )}

                {/* RESET MODE */}
                {mode === "reset" && (
                  <>
                    <div className="mode-label">Nueva contraseña</div>
                    <h2 className="form-title">Restablece tu acceso</h2>
                    <p className="form-subtitle">Elige una contraseña segura para tu cuenta.</p>

                    <div style={{ marginTop: 28 }}>
                      {!resetToken && (
                        <div className="no-token-warn">
                          El enlace de recuperación no es válido o ha expirado.
                        </div>
                      )}

                      {err && <div style={{ marginBottom: 16 }}><Alert type="error" message={err} /></div>}
                      {msg && <div style={{ marginBottom: 16 }}><Alert type="success" message={msg} /></div>}

                      <form className="form-grid" onSubmit={onResetPassword}>
                        <div>
                          <label>Nueva contraseña</label>
                          <div className="input-wrap">
                            <span className="input-icon"><LockIcon /></span>
                            <input
                              type={showNewPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={newPassword}
                              onChange={e => setNewPassword(e.target.value)}
                              autoComplete="new-password"
                              className="with-toggle"
                            />
                            <button type="button" className="input-toggle" onClick={() => setShowNewPassword(v => !v)}>
                              <EyeIcon open={showNewPassword} />
                            </button>
                          </div>
                          <PasswordStrength password={newPassword} />
                        </div>

                        <div>
                          <label>Confirmar contraseña</label>
                          <div className="input-wrap">
                            <span className="input-icon"><LockIcon /></span>
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={confirmPassword}
                              onChange={e => setConfirmPassword(e.target.value)}
                              autoComplete="new-password"
                              className="with-toggle"
                            />
                            <button type="button" className="input-toggle" onClick={() => setShowConfirmPassword(v => !v)}>
                              <EyeIcon open={showConfirmPassword} />
                            </button>
                          </div>

                          {confirmPassword.length > 0 && (
                            <p className="confirm-match" style={{ color: passwordsMatch ? "rgba(52,211,153,0.8)" : "rgba(248,113,113,0.8)" }}>
                              {passwordsMatch ? "✓ Las contraseñas coinciden" : "✕ Las contraseñas no coinciden"}
                            </p>
                          )}

                          {newPassword.length > 0 && passwordStrength.score <= 2 && (
                            <p className="hint-text">
                              Añade mayúsculas, números o símbolos para mayor seguridad.
                            </p>
                          )}
                        </div>

                        <PrimaryButton
                          loading={loading}
                          disabled={!resetToken}
                          loadingText="Guardando..."
                          text="Guardar nueva contraseña"
                        />
                      </form>

                      <button
                        type="button"
                        className="back-btn"
                        onClick={() => { setParams({}); switchMode("login"); }}
                      >
                        <ArrowLeft /> Volver al inicio de sesión
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}