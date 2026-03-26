import { useMemo, useState } from "react";
import { Layout } from "../components/Layout";
import { authRegister } from "../lib/api";
import { useAuth } from "../app/auth";
import { useNavigate, Link } from "react-router-dom";

// ─── Icons ────────────────────────────────────────────────────────────────────

const UserIcon = () => (
  <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const AtIcon = () => (
  <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);

const MailIcon = () => (
  <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const LockIcon = () => (
  <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const EyeIcon = ({ open }: { open: boolean }) => (
  <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    {open ? (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </>
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    )}
  </svg>
);

const CheckIcon = () => (
  <svg style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const PASSWORD_RULES = [
  { id: "length", label: "Minimo 8 caracteres", test: (value: string) => value.length >= 8 },
  { id: "upper", label: "Al menos 1 letra mayuscula", test: (value: string) => /[A-Z]/.test(value) },
  { id: "number", label: "Al menos 1 numero", test: (value: string) => /[0-9]/.test(value) },
  { id: "symbol", label: "Al menos 1 simbolo especial", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
] as const;

// ─── Password strength ─────────────────────────────────────────────────────────

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (!password) return { score: 0, label: "Vacía", pct: 0, color: "rgba(255,255,255,0.1)", text: "rgba(255,255,255,0.25)" };
  if (score <= 2) return { score, label: "Débil", pct: 33, color: "#f43f5e", text: "rgba(252,165,165,0.8)" };
  if (score <= 4) return { score, label: "Media", pct: 66, color: "#f59e0b", text: "rgba(252,211,77,0.8)" };
  return { score, label: "Fuerte", pct: 100, color: "#2dd4bf", text: "rgba(94,234,212,0.8)" };
}

// ─── Benefits ─────────────────────────────────────────────────────────────────

const BENEFITS = [
  {
    icon: (
      <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: "Compra más rápido",
    desc: "Guarda tus datos de envío y pago para agilizar futuras compras.",
  },
  {
    icon: (
      <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    title: "Sigue tus pedidos",
    desc: "Estado en tiempo real de cada compra, directo desde tu panel.",
  },
  {
    icon: (
      <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    title: "Ofertas exclusivas",
    desc: "Accede a promociones, stock nuevo y lanzamientos antes que nadie.",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function RegisterPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [receiveNews, setReceiveNews] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [legalModal, setLegalModal] = useState<"terms" | "privacy" | null>(null);

  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const nav = useNavigate();

  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const passwordChecks = useMemo(
    () => PASSWORD_RULES.map(rule => ({ ...rule, ok: rule.test(password) })),
    [password]
  );
  const passwordIsValid = passwordChecks.every(rule => rule.ok);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  function validateEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function validateForm() {
    if (!name.trim()) return "Ingresa tu nombre completo.";
    if (!email.trim()) return "Ingresa tu correo electrónico.";
    if (!validateEmail(email)) return "Ingresa un correo electrónico válido.";
    if (!password.trim()) return "Ingresa una contraseña.";
    if (!passwordIsValid) return "La contraseña debe cumplir todos los requisitos de seguridad.";
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
    if (validationError) { setErr(validationError); return; }

    try {
      setLoading(true);
      const data = await authRegister({ name, username, email, phone, password, receiveNews });
      if (!data.ok) { setErr(data.message || "Error al registrarse"); return; }
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
    <Layout hideSiteChrome>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap');

        .rp-root { font-family: 'Inter', sans-serif; color: #fff; }
        .rp-root * { box-sizing: border-box; }

        .rp-card {
          display: grid;
          border-radius: 28px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(24px);
          overflow: hidden;
          box-shadow: 0 32px 96px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04) inset;
        }

        @media (min-width: 1024px) {
          .rp-card { grid-template-columns: 0.85fr 1.15fr; }
        }

        /* LEFT */
        .rp-left {
          display: none;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
          border-right: 1px solid rgba(255,255,255,0.06);
          background: linear-gradient(160deg, rgba(34,211,238,0.05) 0%, rgba(99,102,241,0.05) 100%);
          position: relative;
        }

        @media (min-width: 1024px) { .rp-left { display: flex; } }

        .rp-left-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(34,211,238,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,211,238,0.045) 1px, transparent 1px);
          background-size: 32px 32px;
          border-radius: 28px 0 0 28px;
          opacity: 0.6;
          pointer-events: none;
        }

        .rp-brand {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(0,0,0,0.3);
          padding: 12px 16px;
          width: fit-content;
          position: relative;
        }

        .rp-brand-name {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .rp-brand-sub {
          font-size: 10px;
          color: rgba(255,255,255,0.35);
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .rp-headline {
          font-family: 'Syne', sans-serif;
          font-size: 34px;
          font-weight: 800;
          line-height: 1.18;
          letter-spacing: -0.03em;
          margin-top: 36px;
          position: relative;
        }

        .rp-headline span {
          background: linear-gradient(135deg, #22d3ee, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .rp-sub {
          margin-top: 14px;
          font-size: 14px;
          color: rgba(255,255,255,0.45);
          line-height: 1.7;
          max-width: 300px;
          position: relative;
        }

        .rp-benefits {
          margin-top: 32px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          position: relative;
        }

        .rp-benefit {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(0,0,0,0.2);
          padding: 14px 16px;
          transition: border-color 0.2s;
        }

        .rp-benefit:hover { border-color: rgba(34,211,238,0.18); }

        .rp-benefit-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(34,211,238,0.08);
          color: rgba(34,211,238,0.65);
          flex-shrink: 0;
        }

        .rp-benefit-title {
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.85);
        }

        .rp-benefit-desc {
          font-size: 12px;
          color: rgba(255,255,255,0.38);
          margin-top: 2px;
          line-height: 1.55;
        }

        .rp-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          position: relative;
        }

        .rp-pill {
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.04);
          padding: 4px 11px;
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          font-weight: 500;
        }

        .rp-pill-cyan {
          border-color: rgba(34,211,238,0.2);
          background: rgba(34,211,238,0.07);
          color: rgba(34,211,238,0.75);
        }

        /* RIGHT */
        .rp-right {
          padding: 36px 36px 40px;
        }

        @media (min-width: 640px) { .rp-right { padding: 44px 48px 52px; } }

        .rp-mode-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(34,211,238,0.55);
          font-family: 'Syne', sans-serif;
          margin-bottom: 7px;
        }

        .rp-title {
          font-family: 'Syne', sans-serif;
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.2;
        }

        .rp-subtitle {
          font-size: 14px;
          color: rgba(255,255,255,0.4);
          margin-top: 7px;
          line-height: 1.6;
        }

        /* Form */
        .rp-form { margin-top: 28px; display: flex; flex-direction: column; gap: 16px; }

        .rp-section-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.22);
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .rp-section-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }

        .rp-grid-2 { display: grid; gap: 12px; }
        @media (min-width: 640px) { .rp-grid-2 { grid-template-columns: 1fr 1fr; } }

        .rp-field label {
          display: block;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          margin-bottom: 7px;
        }

        .rp-input-wrap { position: relative; }

        .rp-input-wrap input {
          width: 100%;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.04);
          padding: 12px 14px 12px 42px;
          color: #fff;
          font-size: 13.5px;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }

        .rp-input-wrap input::placeholder { color: rgba(255,255,255,0.16); }

        .rp-input-wrap input:focus {
          border-color: rgba(34,211,238,0.22);
          background: rgba(255,255,255,0.06);
          box-shadow: 0 0 0 3px rgba(34,211,238,0.05);
        }

        .rp-input-wrap input.no-icon { padding-left: 14px; }
        .rp-input-wrap input.with-toggle { padding-right: 42px; }

        .icon { width: 16px; height: 16px; }

        .rp-icon {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.18);
          display: flex;
          align-items: center;
          pointer-events: none;
          transition: color 0.2s;
        }

        .rp-input-wrap:focus-within .rp-icon { color: rgba(34,211,238,0.45); }

        .rp-toggle {
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

        .rp-toggle:hover { color: rgba(255,255,255,0.55); }

        .rp-hint {
          font-size: 11px;
          color: rgba(255,255,255,0.22);
          margin-top: 5px;
        }

        /* Password strength */
        .pw-bar-track {
          height: 3px;
          border-radius: 99px;
          background: rgba(255,255,255,0.07);
          margin-top: 8px;
          overflow: hidden;
        }

        .pw-bar-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 0.4s ease, background-color 0.4s ease;
        }

        .pw-label {
          font-size: 10px;
          font-weight: 600;
          margin-top: 4px;
        }

        .pw-rules {
          margin-top: 10px;
          display: grid;
          gap: 7px;
        }

        .pw-rule {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 11px;
          color: rgba(255,255,255,0.28);
        }

        .pw-rule-dot {
          width: 16px;
          height: 16px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.04);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: transparent;
          transition: all 0.2s ease;
        }

        .pw-rule.ok {
          color: rgba(94,234,212,0.86);
        }

        .pw-rule.ok .pw-rule-dot {
          border-color: rgba(45,212,191,0.45);
          background: rgba(45,212,191,0.16);
          color: rgba(94,234,212,0.95);
        }

        /* Match hint */
        .match-hint {
          font-size: 11px;
          font-weight: 500;
          margin-top: 5px;
        }

        /* Checkbox */
        .rp-checkbox-wrap {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .rp-checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.03);
          padding: 14px 16px;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          position: relative;
        }

        .rp-checkbox-label:hover { border-color: rgba(34,211,238,0.15); background: rgba(34,211,238,0.03); }

        .rp-checkbox-label.checked { border-color: rgba(34,211,238,0.2); background: rgba(34,211,238,0.05); }

        .rp-checkbox-box {
          width: 18px;
          height: 18px;
          border-radius: 6px;
          border: 1.5px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.04);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
          transition: border-color 0.2s, background 0.2s;
        }

        .rp-checkbox-box.checked {
          border-color: rgba(34,211,238,0.6);
          background: rgba(34,211,238,0.15);
          color: rgba(34,211,238,0.9);
        }

        .rp-checkbox-text {
          font-size: 12.5px;
          color: rgba(255,255,255,0.5);
          line-height: 1.55;
        }

        .rp-checkbox-text a {
          color: rgba(34,211,238,0.7);
          text-decoration: none;
        }

        .rp-checkbox-text a:hover { color: rgba(34,211,238,1); }

        .rp-legal-link {
          appearance: none;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          color: rgba(34,211,238,0.7);
          font: inherit;
        }

        .rp-legal-link:hover { color: rgba(34,211,238,1); }

        .rp-legal-note {
          margin-top: 10px;
          padding: 12px 14px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.025);
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          line-height: 1.6;
        }

        /* Alert */
        .rp-alert {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          border-radius: 14px;
          border: 1px solid;
          padding: 12px 14px;
          font-size: 13px;
          line-height: 1.5;
        }

        .rp-alert-icon {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 1.5px solid currentColor;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          flex-shrink: 0;
          margin-top: 1px;
          opacity: 0.7;
        }

        .rp-alert.error {
          border-color: rgba(244,63,94,0.2);
          background: rgba(244,63,94,0.07);
          color: rgba(252,165,165,0.9);
        }

        .rp-alert.success {
          border-color: rgba(45,212,191,0.2);
          background: rgba(45,212,191,0.07);
          color: rgba(94,234,212,0.9);
        }

        /* Submit button */
        .rp-submit {
          width: 100%;
          border-radius: 14px;
          padding: 13.5px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          letter-spacing: 0.02em;
          border: none;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          position: relative;
          overflow: hidden;
        }

        .rp-submit.active {
          background: linear-gradient(135deg, #22d3ee, #6366f1);
          color: #fff;
          box-shadow: 0 4px 24px rgba(34,211,238,0.2);
        }

        .rp-submit.active:hover {
          transform: scale(1.012);
          box-shadow: 0 6px 32px rgba(34,211,238,0.28);
        }

        .rp-submit.active:active { transform: scale(0.99); }

        .rp-submit.disabled {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.28);
          cursor: not-allowed;
          border: 1px solid rgba(255,255,255,0.07);
        }

        .rp-submit-shine {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transform: translateX(-100%);
          transition: transform 0.5s;
        }

        .rp-submit.active:hover .rp-submit-shine { transform: translateX(100%); }

        .rp-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.25);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
          margin-right: 8px;
          vertical-align: middle;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .rp-login-row {
          margin-top: 20px;
          text-align: center;
          font-size: 13px;
          color: rgba(255,255,255,0.35);
        }

        .rp-login-row a {
          color: rgba(34,211,238,0.7);
          font-weight: 600;
          text-decoration: none;
        }

        .rp-login-row a:hover { color: rgba(34,211,238,1); }

        .rp-legal-modal {
          position: fixed;
          inset: 0;
          z-index: 80;
          background: rgba(3,7,18,0.8);
          backdrop-filter: blur(14px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .rp-legal-card {
          width: min(680px, 100%);
          max-height: min(86vh, 760px);
          overflow: auto;
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.08);
          background: linear-gradient(180deg, rgba(17,24,39,0.97), rgba(8,15,30,0.98));
          box-shadow: 0 32px 96px rgba(0,0,0,0.45);
          padding: 28px 24px 24px;
        }

        .rp-legal-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .rp-legal-kicker {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(34,211,238,0.6);
          margin-bottom: 8px;
        }

        .rp-legal-title {
          font-family: 'Syne', sans-serif;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .rp-legal-subtitle {
          margin-top: 8px;
          font-size: 13px;
          color: rgba(255,255,255,0.42);
          line-height: 1.6;
        }

        .rp-legal-close {
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.7);
          width: 38px;
          height: 38px;
          border-radius: 12px;
          cursor: pointer;
        }

        .rp-legal-body {
          margin-top: 20px;
          display: grid;
          gap: 16px;
        }

        .rp-legal-section {
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.03);
          padding: 16px 18px;
        }

        .rp-legal-section h4 {
          margin: 0 0 8px;
          font-size: 13px;
          color: rgba(255,255,255,0.9);
        }

        .rp-legal-section p,
        .rp-legal-section li {
          font-size: 12.5px;
          color: rgba(255,255,255,0.56);
          line-height: 1.7;
        }

        .rp-legal-section ul {
          margin: 0;
          padding-left: 18px;
        }
      `}</style>

      <div className="rp-root">
        <div className="rp-card">

          {/* ── LEFT PANEL ── */}
          <div className="rp-left">
            <div className="rp-left-grid" />

            <div style={{ position: "relative" }}>
              <div className="rp-brand">
                <img src="/logo.png" alt="Diamond Grid" style={{ height: 38, width: "auto", objectFit: "contain" }} />
                <div>
                  <div className="rp-brand-name">Diamond Grid</div>
                  <div className="rp-brand-sub">Sistema de Componentes</div>
                </div>
              </div>

              <h2 className="rp-headline">
                Únete a la<br />
                <span>comunidad</span><br />
                más técnica.
              </h2>

              <p className="rp-sub">
                Tu cuenta te abre la puerta a una experiencia de compra profesional, rápida y personalizada.
              </p>

              <div className="rp-benefits">
                {BENEFITS.map((b, i) => (
                  <div className="rp-benefit" key={i}>
                    <div className="rp-benefit-icon">{b.icon}</div>
                    <div>
                      <div className="rp-benefit-title">{b.title}</div>
                      <div className="rp-benefit-desc">{b.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rp-pills" style={{ position: "relative" }}>
              <span className="rp-pill rp-pill-cyan">Dark UI + Glow</span>
              <span className="rp-pill">JWT + Prisma</span>
              <span className="rp-pill">React + TS</span>
              <span className="rp-pill">Seguro</span>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="rp-right">
            <div className="rp-mode-label">Diamond Grid</div>
            <h2 className="rp-title">Crear cuenta</h2>
            <p className="rp-subtitle">Completa el formulario para empezar.</p>

            <form className="rp-form" onSubmit={onSubmit}>

              {/* Alerts */}
              {err && (
                <div className="rp-alert error">
                  <span className="rp-alert-icon">✕</span>
                  {err}
                </div>
              )}
              {success && (
                <div className="rp-alert success">
                  <span className="rp-alert-icon">✓</span>
                  {success}
                </div>
              )}

              {/* PERSONAL */}
              <div>
                <div className="rp-section-label">Datos personales</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div className="rp-field">
                    <label>Nombre completo</label>
                    <div className="rp-input-wrap">
                      <span className="rp-icon"><UserIcon /></span>
                      <input
                        type="text"
                        placeholder="Michael Buitrón"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        autoComplete="name"
                      />
                    </div>
                  </div>

                  <div className="rp-grid-2">
                    <div className="rp-field">
                      <label>Nombre de usuario</label>
                      <div className="rp-input-wrap">
                        <span className="rp-icon"><AtIcon /></span>
                        <input
                          type="text"
                          placeholder="michaelbg"
                          value={username}
                          onChange={e => setUsername(e.target.value)}
                          autoComplete="username"
                        />
                      </div>
                    </div>

                    <div className="rp-field">
                      <label>Teléfono</label>
                      <div className="rp-input-wrap">
                        <span className="rp-icon"><PhoneIcon /></span>
                        <input
                          type="tel"
                          placeholder="+593 999 999 999"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          autoComplete="tel"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rp-field">
                    <label>Correo electrónico</label>
                    <div className="rp-input-wrap">
                      <span className="rp-icon"><MailIcon /></span>
                      <input
                        type="email"
                        placeholder="correo@gmail.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECURITY */}
              <div>
                <div className="rp-section-label">Seguridad</div>
                <div className="rp-grid-2">
                  <div className="rp-field">
                    <label>Contraseña</label>
                    <div className="rp-input-wrap">
                      <span className="rp-icon"><LockIcon /></span>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        autoComplete="new-password"
                        className="with-toggle"
                      />
                      <button type="button" className="rp-toggle" onClick={() => setShowPassword(v => !v)}>
                        <EyeIcon open={showPassword} />
                      </button>
                    </div>
                    {password.length > 0 && (
                      <>
                        <div className="pw-bar-track">
                          <div
                            className="pw-bar-fill"
                            style={{ width: `${strength.pct}%`, backgroundColor: strength.color }}
                          />
                        </div>
                        <p className="pw-label" style={{ color: strength.text }}>
                          Seguridad: {strength.label}
                        </p>
                      </>
                    )}
                    <div className="pw-rules">
                      {passwordChecks.map(rule => (
                        <div key={rule.id} className={`pw-rule ${rule.ok ? "ok" : ""}`}>
                          <span className="pw-rule-dot">
                            <CheckIcon />
                          </span>
                          <span>{rule.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rp-field">
                    <label>Confirmar contraseña</label>
                    <div className="rp-input-wrap">
                      <span className="rp-icon"><LockIcon /></span>
                      <input
                        type={showConfirm ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        className="with-toggle"
                      />
                      <button type="button" className="rp-toggle" onClick={() => setShowConfirm(v => !v)}>
                        <EyeIcon open={showConfirm} />
                      </button>
                    </div>
                    {confirmPassword.length > 0 && (
                      <p className="match-hint" style={{ color: passwordsMatch ? "rgba(94,234,212,0.8)" : "rgba(252,165,165,0.8)" }}>
                        {passwordsMatch ? "✓ Las contraseñas coinciden" : "✕ No coinciden"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* PREFERENCES */}
              <div>
                <div className="rp-section-label">Preferencias</div>
                <div className="rp-checkbox-wrap">
                  <div
                    className={`rp-checkbox-label ${acceptTerms ? "checked" : ""}`}
                    onClick={() => setAcceptTerms(v => !v)}
                  >
                    <div className={`rp-checkbox-box ${acceptTerms ? "checked" : ""}`}>
                      {acceptTerms && <CheckIcon />}
                    </div>
                    <span className="rp-checkbox-text">
                      Acepto los{" "}
                      <button
                        type="button"
                        className="rp-legal-link"
                        onClick={e => {
                          e.stopPropagation();
                          setLegalModal("terms");
                        }}
                      >
                        términos y condiciones
                      </button>
                      {" "}y la{" "}
                      <button
                        type="button"
                        className="rp-legal-link"
                        onClick={e => {
                          e.stopPropagation();
                          setLegalModal("privacy");
                        }}
                      >
                        política de privacidad
                      </button>.
                    </span>
                  </div>

                  <div
                    className={`rp-checkbox-label ${receiveNews ? "checked" : ""}`}
                    onClick={() => setReceiveNews(v => !v)}
                  >
                    <div className={`rp-checkbox-box ${receiveNews ? "checked" : ""}`}>
                      {receiveNews && <CheckIcon />}
                    </div>
                    <span className="rp-checkbox-text">
                      Quiero recibir promociones, stock nuevo y lanzamientos de Diamond Grid.
                    </span>
                  </div>
                </div>
                <div className="rp-legal-note">
                  Al crear tu cuenta aceptas un uso responsable de la plataforma, el tratamiento de tus datos para operar pedidos y el envío de comunicaciones solo si marcas la casilla de novedades.
                </div>
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className={`rp-submit ${loading ? "disabled" : "active"}`}
              >
                <span className="rp-submit-shine" />
                <span style={{ position: "relative" }}>
                  {loading ? (
                    <><span className="rp-spinner" />Creando cuenta...</>
                  ) : "Crear cuenta"}
                </span>
              </button>
            </form>

            <p className="rp-login-row">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login">Inicia sesión</Link>
            </p>
          </div>
        </div>
      </div>

      {legalModal && (
        <div className="rp-legal-modal" onClick={() => setLegalModal(null)}>
          <div className="rp-legal-card" onClick={e => e.stopPropagation()}>
            <div className="rp-legal-top">
              <div>
                <div className="rp-legal-kicker">Diamond Grid</div>
                <div className="rp-legal-title">
                  {legalModal === "terms" ? "Terminos y condiciones" : "Politica de privacidad"}
                </div>
                <p className="rp-legal-subtitle">
                  {legalModal === "terms"
                    ? "Resumen claro de las condiciones de uso para compras, cuentas y pedidos dentro de la plataforma."
                    : "Resumen del tratamiento de datos personales necesario para operar tu cuenta y tus pedidos."}
                </p>
              </div>
              <button type="button" className="rp-legal-close" onClick={() => setLegalModal(null)}>
                X
              </button>
            </div>

            <div className="rp-legal-body">
              {legalModal === "terms" ? (
                <>
                  <div className="rp-legal-section">
                    <h4>Uso de la cuenta</h4>
                    <p>
                      Tu cuenta es personal y debes mantener segura tu contrasena. La informacion registrada debe ser real y actualizada para procesar pedidos, soporte y facturacion.
                    </p>
                  </div>
                  <div className="rp-legal-section">
                    <h4>Compras y pedidos</h4>
                    <ul>
                      <li>Los pedidos quedan sujetos a validacion de stock, pago y confirmacion administrativa.</li>
                      <li>Los precios y promociones pueden cambiar sin previo aviso antes de confirmar la compra.</li>
                      <li>Los comprobantes subidos deben corresponder al pedido realizado.</li>
                    </ul>
                  </div>
                  <div className="rp-legal-section">
                    <h4>Conducta y uso responsable</h4>
                    <ul>
                      <li>No debes usar la plataforma para fraude, suplantacion o cargas de archivos maliciosos.</li>
                      <li>Podemos suspender cuentas con actividad sospechosa o incumplimiento de estas condiciones.</li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <div className="rp-legal-section">
                    <h4>Datos que recopilamos</h4>
                    <p>
                      Podemos almacenar nombre, correo, telefono, datos de perfil, pedidos, comprobantes y actividad necesaria para brindarte acceso, soporte y seguimiento de compras.
                    </p>
                  </div>
                  <div className="rp-legal-section">
                    <h4>Para que usamos tus datos</h4>
                    <ul>
                      <li>Crear y administrar tu cuenta.</li>
                      <li>Procesar compras, pagos, envios y facturas.</li>
                      <li>Contactarte por soporte, seguridad o recuperacion de acceso.</li>
                      <li>Enviar promociones solo si aceptas comunicaciones opcionales.</li>
                    </ul>
                  </div>
                  <div className="rp-legal-section">
                    <h4>Proteccion y control</h4>
                    <ul>
                      <li>No usamos tus datos para fines ajenos a la operacion de la plataforma.</li>
                      <li>Puedes solicitar actualizar datos de perfil y dejar de recibir novedades promocionales.</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
