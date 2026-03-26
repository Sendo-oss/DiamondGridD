import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "../components/Layout";
import { API_BASE } from "../lib/api";

// ── Eye icon ──────────────────────────────────────────────────────────────────
const EyeIcon = ({ open }: { open: boolean }) => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
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

// ── Lock icon ─────────────────────────────────────────────────────────────────
const LockIcon = () => (
  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

// ── Shield icon ───────────────────────────────────────────────────────────────
const ShieldIcon = () => (
  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

// ── Password strength ─────────────────────────────────────────────────────────
function getStrength(pw: string) {
  if (!pw) return { score: 0, label: "", pct: 0, color: "transparent", text: "transparent" };
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 2) return { score: s, label: "Débil", pct: 33, color: "#f43f5e", text: "rgba(252,165,165,0.85)" };
  if (s <= 3) return { score: s, label: "Media", pct: 66, color: "#f59e0b", text: "rgba(252,211,77,0.85)" };
  return { score: s, label: "Fuerte", pct: 100, color: "#22d3ee", text: "rgba(94,234,212,0.85)" };
}

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = useMemo(() => params.get("token") || "", [params]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [okMessage, setOkMessage] = useState("");
  const [error, setError] = useState("");

  const strength = getStrength(newPassword);
  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setOkMessage("");

    if (!token) { setError("El enlace de recuperación no es válido"); return; }
    if (newPassword.length < 6) { setError("La contraseña debe tener al menos 6 caracteres"); return; }
    if (newPassword !== confirmPassword) { setError("Las contraseñas no coinciden"); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "No se pudo restablecer la contraseña");
      setOkMessage(data?.message || "¡Contraseña restablecida correctamente!");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(err?.message || "Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout hideSiteChrome>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        .rp2-root * { box-sizing: border-box; }
        .rp2-root { font-family: 'DM Sans', sans-serif; }

        /* Outer wrapper — centered */
        .rp2-wrap {
          min-height: 72vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
        }

        /* Card */
        .rp2-card {
          width: 100%;
          max-width: 480px;
          position: relative;
          border-radius: 28px;
          border: 1px solid rgba(34,211,238,0.1);
          background: rgba(255,255,255,0.028);
          backdrop-filter: blur(28px);
          box-shadow:
            0 0 0 1px rgba(34,211,238,0.04) inset,
            0 40px 100px rgba(0,0,0,0.5),
            0 0 80px rgba(6,182,212,0.06);
          overflow: hidden;
          animation: rp2-in 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }

        @keyframes rp2-in {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Card corner accents */
        .rp2-card::before,
        .rp2-card::after {
          content: '';
          position: absolute;
          width: 20px; height: 20px;
          border-color: rgba(34,211,238,0.4);
          border-style: solid;
          z-index: 2;
        }
        .rp2-card::before { top: 0; left: 0; border-width: 2px 0 0 2px; border-radius: 28px 0 0 0; }
        .rp2-card::after  { bottom: 0; right: 0; border-width: 0 2px 2px 0; border-radius: 0 0 28px 0; }

        /* Top glow accent line */
        .rp2-top-line {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(34,211,238,0.5), rgba(14,165,233,0.6), rgba(34,211,238,0.5), transparent);
        }

        /* Header section */
        .rp2-header {
          padding: 36px 36px 28px;
          position: relative;
          overflow: hidden;
        }

        .rp2-header-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(34,211,238,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,211,238,0.05) 1px, transparent 1px);
          background-size: 28px 28px;
          opacity: 0.5;
          pointer-events: none;
        }

        .rp2-header-glow {
          position: absolute;
          top: -60px; left: 50%;
          transform: translateX(-50%);
          width: 300px; height: 160px;
          background: radial-gradient(ellipse, rgba(34,211,238,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .rp2-icon-wrap {
          position: relative;
          width: 64px; height: 64px;
          border-radius: 20px;
          border: 1px solid rgba(34,211,238,0.2);
          background: rgba(34,211,238,0.07);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(34,211,238,0.8);
          margin-bottom: 20px;
          box-shadow: 0 4px 20px rgba(34,211,238,0.12);
          animation: rp2-icon-pulse 3s ease-in-out infinite;
        }

        @keyframes rp2-icon-pulse {
          0%,100% { box-shadow: 0 4px 20px rgba(34,211,238,0.12); }
          50%      { box-shadow: 0 4px 28px rgba(34,211,238,0.28); }
        }

        .rp2-eyebrow {
          font-family: 'Oxanium', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(34,211,238,0.6);
          margin-bottom: 8px;
        }

        .rp2-title {
          font-family: 'Oxanium', sans-serif;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #fff;
          line-height: 1.15;
          margin-bottom: 8px;
        }

        .rp2-subtitle {
          font-size: 13.5px;
          color: rgba(255,255,255,0.42);
          line-height: 1.6;
          max-width: 340px;
        }

        /* Divider */
        .rp2-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
          margin: 0 36px;
        }

        /* Body */
        .rp2-body {
          padding: 28px 36px 36px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        /* Field */
        .rp2-field label {
          display: block;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          margin-bottom: 8px;
          font-family: 'Oxanium', monospace;
        }

        .rp2-input-wrap {
          position: relative;
        }

        .rp2-input-icon {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          pointer-events: none;
          transition: color 0.2s;
        }

        .rp2-input-wrap:focus-within .rp2-input-icon {
          color: rgba(34,211,238,0.55);
        }

        .rp2-input-wrap input {
          width: 100%;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.04);
          padding: 12px 42px;
          color: #fff;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }

        .rp2-input-wrap input::placeholder { color: rgba(255,255,255,0.18); }

        .rp2-input-wrap input:focus {
          border-color: rgba(34,211,238,0.25);
          background: rgba(255,255,255,0.06);
          box-shadow: 0 0 0 3px rgba(34,211,238,0.06);
        }

        .rp2-eye-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.22);
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }
        .rp2-eye-btn:hover { color: rgba(255,255,255,0.6); }

        /* Strength bar */
        .rp2-strength-bar {
          margin-top: 8px;
          height: 3px;
          border-radius: 999px;
          background: rgba(255,255,255,0.06);
          overflow: hidden;
        }
        .rp2-strength-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 0.35s ease, background-color 0.35s ease;
        }
        .rp2-strength-label {
          font-size: 10px;
          font-weight: 600;
          margin-top: 4px;
          letter-spacing: 0.06em;
          font-family: 'Oxanium', monospace;
        }

        /* Match indicator */
        .rp2-match {
          font-size: 11px;
          font-weight: 600;
          margin-top: 5px;
          display: flex;
          align-items: center;
          gap: 5px;
          font-family: 'Oxanium', monospace;
          letter-spacing: 0.04em;
        }

        /* Alerts */
        .rp2-alert {
          border-radius: 14px;
          border: 1px solid;
          padding: 12px 14px;
          font-size: 13px;
          line-height: 1.5;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          animation: rp2-in 0.3s ease;
        }

        .rp2-alert-icon {
          width: 18px; height: 18px;
          border-radius: 50%;
          border: 1.5px solid currentColor;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: 800;
          flex-shrink: 0;
          margin-top: 1px;
          opacity: 0.75;
        }

        .rp2-alert.error {
          border-color: rgba(244,63,94,0.2);
          background: rgba(244,63,94,0.07);
          color: rgba(252,165,165,0.9);
        }

        .rp2-alert.success {
          border-color: rgba(34,211,238,0.2);
          background: rgba(34,211,238,0.07);
          color: rgba(94,234,212,0.9);
        }

        .rp2-alert.warning {
          border-color: rgba(251,191,36,0.2);
          background: rgba(251,191,36,0.07);
          color: rgba(253,230,138,0.9);
        }

        /* Submit button */
        .rp2-submit {
          width: 100%;
          border-radius: 14px;
          padding: 14px;
          font-size: 14px;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.03em;
          border: none;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
        }

        .rp2-submit.active {
          background: linear-gradient(135deg, #22d3ee, #0891b2);
          color: #fff;
          box-shadow: 0 4px 24px rgba(34,211,238,0.25);
        }

        .rp2-submit.active:hover {
          transform: scale(1.015);
          box-shadow: 0 6px 32px rgba(34,211,238,0.35);
        }

        .rp2-submit.active:active { transform: scale(0.99); }

        .rp2-submit.disabled {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.25);
          cursor: not-allowed;
          border: 1px solid rgba(255,255,255,0.07);
        }

        .rp2-submit-shine {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
          transform: translateX(-100%);
          transition: transform 0.5s;
        }
        .rp2-submit.active:hover .rp2-submit-shine { transform: translateX(100%); }

        .rp2-spinner {
          display: inline-block;
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,0.25);
          border-top-color: #fff;
          border-radius: 50%;
          animation: rp2-spin 0.7s linear infinite;
          vertical-align: middle;
          margin-right: 8px;
        }
        @keyframes rp2-spin { to { transform: rotate(360deg); } }

        /* Success state overlay */
        .rp2-success-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 14px;
          padding: 12px 0 4px;
          animation: rp2-in 0.4s ease;
        }

        .rp2-success-icon {
          width: 60px; height: 60px;
          border-radius: 50%;
          border: 2px solid rgba(34,211,238,0.35);
          background: rgba(34,211,238,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          box-shadow: 0 0 24px rgba(34,211,238,0.2);
          animation: rp2-icon-pulse 2s ease-in-out infinite;
        }

        .rp2-success-title {
          font-family: 'Oxanium', monospace;
          font-size: 18px;
          font-weight: 700;
          color: rgba(94,234,212,0.9);
          letter-spacing: -0.01em;
        }

        .rp2-success-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          line-height: 1.6;
        }

        .rp2-progress-bar {
          width: 100%;
          height: 3px;
          background: rgba(255,255,255,0.07);
          border-radius: 999px;
          overflow: hidden;
          margin-top: 4px;
        }

        .rp2-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #22d3ee, #0ea5e9);
          border-radius: 999px;
          animation: rp2-progress 2s linear forwards;
        }

        @keyframes rp2-progress {
          from { width: 100%; }
          to   { width: 0%; }
        }

        /* Footer link */
        .rp2-footer {
          text-align: center;
          padding-top: 4px;
        }

        .rp2-back-link {
          font-size: 13px;
          color: rgba(255,255,255,0.3);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: color 0.15s;
          font-weight: 500;
        }
        .rp2-back-link:hover { color: rgba(34,211,238,0.8); }

        /* Invalid token state */
        .rp2-invalid {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 16px;
          padding: 8px 0;
          animation: rp2-in 0.4s ease;
        }

        .rp2-invalid-icon {
          font-size: 40px;
          filter: grayscale(0.3);
        }

        .rp2-invalid-title {
          font-family: 'Oxanium', monospace;
          font-size: 17px;
          font-weight: 700;
          color: rgba(252,165,165,0.85);
        }

        .rp2-invalid-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.38);
          line-height: 1.65;
          max-width: 300px;
        }
      `}</style>

      <div className="rp2-root">
        <div className="rp2-wrap">
          <div className="rp2-card">
            <div className="rp2-top-line" />

            {/* Header */}
            <div className="rp2-header">
              <div className="rp2-header-grid" />
              <div className="rp2-header-glow" />

              <div className="rp2-icon-wrap">
                <ShieldIcon />
              </div>

              <p className="rp2-eyebrow">Diamond Grid · Seguridad</p>
              <h1 className="rp2-title">Restablecer<br />contraseña</h1>
              <p className="rp2-subtitle">
                Crea una nueva contraseña segura para recuperar el acceso a tu cuenta.
              </p>
            </div>

            <div className="rp2-divider" />

            {/* Body */}
            <div className="rp2-body">

              {/* Invalid token */}
              {!token ? (
                <div className="rp2-invalid">
                  <div className="rp2-invalid-icon">🔗</div>
                  <p className="rp2-invalid-title">Enlace no válido</p>
                  <p className="rp2-invalid-sub">
                    Este enlace de recuperación no contiene un token válido o ha expirado. Solicita un nuevo correo de recuperación.
                  </p>
                  <Link to="/login" className="rp2-back-link">
                    ← Volver al inicio de sesión
                  </Link>
                </div>

              ) : okMessage ? (
                /* Success state */
                <div className="rp2-success-wrap">
                  <div className="rp2-success-icon">✓</div>
                  <p className="rp2-success-title">{okMessage}</p>
                  <p className="rp2-success-sub">
                    Redirigiendo al inicio de sesión...
                  </p>
                  <div className="rp2-progress-bar">
                    <div className="rp2-progress-fill" />
                  </div>
                  <Link to="/login" className="rp2-back-link">
                    Ir ahora →
                  </Link>
                </div>

              ) : (
                /* Form */
                <>
                  {error && (
                    <div className="rp2-alert error">
                      <span className="rp2-alert-icon">✕</span>
                      {error}
                    </div>
                  )}

                  {/* New password */}
                  <div className="rp2-field">
                    <label>Nueva contraseña</label>
                    <div className="rp2-input-wrap">
                      <span className="rp2-input-icon"><LockIcon /></span>
                      <input
                        type={showNew ? "text" : "password"}
                        placeholder="Mínimo 6 caracteres"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                      <button type="button" className="rp2-eye-btn" onClick={() => setShowNew(v => !v)}>
                        <EyeIcon open={showNew} />
                      </button>
                    </div>
                    {newPassword.length > 0 && (
                      <>
                        <div className="rp2-strength-bar">
                          <div
                            className="rp2-strength-fill"
                            style={{ width: `${strength.pct}%`, backgroundColor: strength.color }}
                          />
                        </div>
                        <p className="rp2-strength-label" style={{ color: strength.text }}>
                          Seguridad: {strength.label}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div className="rp2-field">
                    <label>Confirmar contraseña</label>
                    <div className="rp2-input-wrap">
                      <span className="rp2-input-icon"><LockIcon /></span>
                      <input
                        type={showConfirm ? "text" : "password"}
                        placeholder="Repite la nueva contraseña"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                      <button type="button" className="rp2-eye-btn" onClick={() => setShowConfirm(v => !v)}>
                        <EyeIcon open={showConfirm} />
                      </button>
                    </div>
                    {confirmPassword.length > 0 && (
                      <p className="rp2-match" style={{ color: passwordsMatch ? "rgba(94,234,212,0.85)" : "rgba(252,165,165,0.85)" }}>
                        {passwordsMatch ? "✓ Las contraseñas coinciden" : "✕ No coinciden"}
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`rp2-submit ${loading ? "disabled" : "active"}`}
                  >
                    <span className="rp2-submit-shine" />
                    <span style={{ position: "relative" }}>
                      {loading
                        ? <><span className="rp2-spinner" />Guardando...</>
                        : "Guardar nueva contraseña"
                      }
                    </span>
                  </button>

                  <div className="rp2-footer">
                    <Link to="/login" className="rp2-back-link">
                      ← Volver a iniciar sesión
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
