import { useState } from "react";
import { Layout } from "../components/Layout";

type ContactForm = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

// ── Icons ─────────────────────────────────────────────────────────────────────
const MailIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);
const PhoneIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);
const ClockIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const MapIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);
const UserIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);
const AtIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25" />
  </svg>
);
const TagIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
  </svg>
);
const MsgIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
  </svg>
);
const SendIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);
const CheckCircleIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const AlertIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
  </svg>
);

const CONTACT_ITEMS = [
  {
    icon: <MailIcon />,
    label: "Correo electrónico",
    value: "soporte@diamondgrid.com",
    desc: "Atención para consultas generales y soporte.",
    color: "rgba(34,211,238,0.9)",
    bg: "rgba(34,211,238,0.07)",
    border: "rgba(34,211,238,0.15)",
  },
  {
    icon: <PhoneIcon />,
    label: "WhatsApp",
    value: "+593 96 337 6099",
    desc: "Soporte rápido para pedidos y seguimiento.",
    color: "rgba(52,211,153,0.9)",
    bg: "rgba(52,211,153,0.07)",
    border: "rgba(52,211,153,0.15)",
  },
  {
    icon: <ClockIcon />,
    label: "Horario de atención",
    value: "Lunes a Viernes • 09:00 – 18:00",
    desc: "Respuesta dentro de horario laboral.",
    color: "rgba(251,191,36,0.9)",
    bg: "rgba(251,191,36,0.07)",
    border: "rgba(251,191,36,0.15)",
  },
  {
    icon: <MapIcon />,
    label: "Ubicación",
    value: "Frente a la parada El Florón",
    desc: "Av. 10 de Agosto 34-97 y, Quito 170508",
    color: "rgba(196,181,253,0.9)",
    bg: "rgba(139,92,246,0.07)",
    border: "rgba(139,92,246,0.15)",
  },
];

export function ContactPage() {
  const [form, setForm] = useState<ContactForm>({ name: "", email: "", subject: "", message: "" });
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg(null);
  }

  function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!form.name.trim())          return setErrorMsg("Por favor, ingresa tu nombre.");
    if (!form.email.trim())         return setErrorMsg("Por favor, ingresa tu correo electrónico.");
    if (!validateEmail(form.email)) return setErrorMsg("Ingresa un correo electrónico válido.");
    if (!form.subject.trim())       return setErrorMsg("Por favor, ingresa un asunto.");
    if (!form.message.trim())       return setErrorMsg("Por favor, escribe tu mensaje.");
    if (form.message.trim().length < 10) return setErrorMsg("El mensaje debe tener al menos 10 caracteres.");

    try {
      setLoading(true);
      await new Promise(res => setTimeout(res, 1200));
      setSuccessMsg("Tu mensaje fue enviado correctamente. Te responderemos pronto.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setErrorMsg("Ocurrió un error al enviar el mensaje. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        @keyframes ct-spin { to { transform: rotate(360deg); } }
        @keyframes ct-fadein { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }

        .ct { font-family: 'Inter', sans-serif; color: #fff; }
        .ct * { box-sizing: border-box; }

        /* ── HERO ── */
        .ct-hero {
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.025);
          backdrop-filter: blur(14px);
          padding: 28px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }

        .ct-hero-eye {
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: rgba(34,211,238,0.55); margin-bottom: 5px;
        }

        .ct-hero-title {
          font-family: 'Syne', sans-serif;
          font-size: 26px; font-weight: 800; letter-spacing: -0.03em;
        }

        .ct-hero-sub { font-size: 13px; color: rgba(255,255,255,0.38); margin-top: 4px; max-width: 480px; }

        .ct-online-badge {
          display: inline-flex; align-items: center; gap: 7px;
          border-radius: 99px;
          border: 1px solid rgba(52,211,153,0.18);
          background: rgba(52,211,153,0.06);
          padding: 6px 14px;
          font-size: 12px; font-weight: 600;
          color: rgba(110,231,183,0.8);
        }

        .ct-online-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: rgba(52,211,153,0.9);
          box-shadow: 0 0 6px rgba(52,211,153,0.5);
          animation: ct-blink 2s infinite;
        }
        @keyframes ct-blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        /* ── GRID ── */
        .ct-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          align-items: start;
        }
        @media (min-width: 1024px) {
          .ct-grid { grid-template-columns: 1fr 1.3fr; }
        }

        /* ── PANEL ── */
        .ct-panel {
          border-radius: 22px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.025);
          backdrop-filter: blur(14px);
          overflow: hidden;
        }

        .ct-panel-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .ct-panel-title {
          font-family: 'Syne', sans-serif;
          font-size: 16px; font-weight: 700; letter-spacing: -0.02em;
        }

        .ct-panel-sub { font-size: 12.5px; color: rgba(255,255,255,0.35); margin-top: 4px; }

        /* ── CONTACT ITEMS ── */
        .ct-info-list {
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .ct-info-item {
          border-radius: 16px;
          border: 1px solid;
          padding: 14px 16px;
          display: flex;
          align-items: flex-start;
          gap: 13px;
          transition: opacity 0.15s;
        }

        .ct-info-icon-wrap {
          width: 34px; height: 34px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          border: 1px solid;
        }

        .ct-info-label {
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(255,255,255,0.28);
          margin-bottom: 3px;
        }

        .ct-info-value { font-size: 13.5px; font-weight: 600; color: rgba(255,255,255,0.9); margin-bottom: 2px; }
        .ct-info-desc  { font-size: 11.5px; color: rgba(255,255,255,0.32); line-height: 1.5; }

        /* ── FORM ── */
        .ct-form-body { padding: 20px 24px; }

        .ct-form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 13px;
        }
        @media (min-width: 640px) { .ct-form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 13px; } }

        .ct-field label {
          display: block;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(255,255,255,0.28); margin-bottom: 7px;
        }

        .ct-input-wrap { position: relative; }

        .ct-input-wrap input,
        .ct-input-wrap textarea {
          width: 100%;
          border-radius: 13px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.04);
          padding: 11px 12px 11px 40px;
          color: #fff;
          font-size: 13.5px; font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .ct-input-wrap input::placeholder,
        .ct-input-wrap textarea::placeholder { color: rgba(255,255,255,0.18); }
        .ct-input-wrap input:focus,
        .ct-input-wrap textarea:focus {
          border-color: rgba(34,211,238,0.22);
          background: rgba(255,255,255,0.06);
          box-shadow: 0 0 0 3px rgba(34,211,238,0.05);
        }

        .ct-input-wrap textarea {
          resize: vertical; min-height: 130px;
          line-height: 1.65; padding-left: 40px;
        }

        .ct-field-icon {
          position: absolute; left: 13px; top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.2);
          pointer-events: none;
          display: flex; align-items: center;
          transition: color 0.2s;
        }
        .ct-input-wrap:has(textarea) .ct-field-icon { top: 13px; transform: none; }
        .ct-input-wrap:focus-within .ct-field-icon { color: rgba(34,211,238,0.45); }

        /* ── ALERT ── */
        .ct-alert {
          border-radius: 14px;
          padding: 13px 15px;
          display: flex; align-items: flex-start; gap: 10px;
          font-size: 13px; line-height: 1.5;
          animation: ct-fadein 0.2s ease;
          margin-bottom: 16px;
        }
        .ct-alert.success {
          border: 1px solid rgba(45,212,191,0.2);
          background: rgba(45,212,191,0.07);
          color: rgba(94,234,212,0.9);
        }
        .ct-alert.error {
          border: 1px solid rgba(244,63,94,0.2);
          background: rgba(244,63,94,0.07);
          color: rgba(252,165,165,0.9);
        }

        /* ── SUBMIT BTN ── */
        .ct-submit-btn {
          width: 100%;
          border-radius: 14px; border: none;
          background: linear-gradient(135deg, #22d3ee, #6366f1);
          padding: 13px;
          font-size: 14px; font-weight: 700; color: #fff;
          cursor: pointer; font-family: 'Inter', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 4px 22px rgba(34,211,238,0.2);
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          position: relative; overflow: hidden;
        }
        .ct-submit-btn:hover:not(:disabled) { transform: scale(1.01); box-shadow: 0 5px 28px rgba(34,211,238,0.3); }
        .ct-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .ct-submit-btn::after {
          content: '';
          position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          animation: ct-shine 3s infinite;
        }
        @keyframes ct-shine { to { left: 160%; } }

        .ct-spinner {
          width: 15px; height: 15px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.2);
          border-top-color: #fff;
          animation: ct-spin 0.7s linear infinite;
        }

        .ct-char-count {
          text-align: right;
          font-size: 11px;
          color: rgba(255,255,255,0.22);
          margin-top: 5px;
          font-family: 'JetBrains Mono', monospace;
        }

        .ct-map-wrap {
          padding: 0 20px 20px;
        }

        .ct-map-card {
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          overflow: hidden;
        }

        .ct-map-top {
          padding: 16px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .ct-map-title {
          font-size: 13px;
          font-weight: 700;
          color: rgba(255,255,255,0.9);
        }

        .ct-map-text {
          font-size: 12px;
          color: rgba(255,255,255,0.42);
          line-height: 1.6;
          margin-top: 4px;
        }

        .ct-map-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 12px;
        }

        .ct-map-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border-radius: 12px;
          padding: 10px 14px;
          border: 1px solid rgba(139,92,246,0.18);
          background: rgba(139,92,246,0.08);
          color: rgba(216,180,254,0.92);
          text-decoration: none;
          font-size: 12.5px;
          font-weight: 600;
        }

        .ct-map-btn:hover {
          background: rgba(139,92,246,0.14);
        }

        .ct-map-frame {
          width: 100%;
          height: 280px;
          border: 0;
          display: block;
          filter: grayscale(0.08) contrast(1.02);
        }
      `}</style>

      <div className="ct">
        {/* ── HERO ── */}
        <div className="ct-hero">
          <div>
            <p className="ct-hero-eye">Diamond Grid</p>
            <h1 className="ct-hero-title">Centro de contacto</h1>
            <p className="ct-hero-sub">¿Dudas sobre pedidos, productos o soporte? Estamos listos para ayudarte.</p>
          </div>
          <div className="ct-online-badge">
            <div className="ct-online-dot" />
            En línea ahora
          </div>
        </div>

        <div className="ct-grid">

          {/* ── CONTACT INFO ── */}
          <div className="ct-panel">
            <div className="ct-panel-header">
              <div className="ct-panel-title">Información de contacto</div>
              <div className="ct-panel-sub">Comunícate con nosotros por cualquier medio.</div>
            </div>
            <div className="ct-info-list">
              {CONTACT_ITEMS.map(item => (
                <div
                  key={item.label}
                  className="ct-info-item"
                  style={{ background: item.bg, borderColor: item.border }}
                >
                  <div
                    className="ct-info-icon-wrap"
                    style={{ color: item.color, background: item.bg, borderColor: item.border }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div className="ct-info-label">{item.label}</div>
                    <div className="ct-info-value">{item.value}</div>
                    <div className="ct-info-desc">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="ct-map-wrap">
              <div className="ct-map-card">
                <div className="ct-map-top">
                  <div className="ct-map-title">Como llegar</div>
                  <div className="ct-map-text">
                    Estamos frente a la parada El Florón, en Av. 10 de Agosto 34-97 y, Quito 170508.
                  </div>
                  <div className="ct-map-actions">
                    <a
                      className="ct-map-btn"
                      href="https://www.google.com/maps/search/?api=1&query=Frente%20a%20la%20parada%20El%20Flor%C3%B3n%2C%20Av.%2010%20de%20Agosto%2034-97%20y%2C%20Quito%20170508"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MapIcon /> Abrir en Google Maps
                    </a>
                  </div>
                </div>
                <iframe
                  className="ct-map-frame"
                  title="Ubicacion Diamond Grid"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://www.google.com/maps?q=Frente%20a%20la%20parada%20El%20Flor%C3%B3n%2C%20Av.%2010%20de%20Agosto%2034-97%20y%2C%20Quito%20170508&output=embed"
                />
              </div>
            </div>
          </div>

          {/* ── FORM ── */}
          <div className="ct-panel">
            <div className="ct-panel-header">
              <div className="ct-panel-title">Envíanos un mensaje</div>
              <div className="ct-panel-sub">Completa el formulario y te responderemos pronto.</div>
            </div>
            <div className="ct-form-body">
              {successMsg && (
                <div className="ct-alert success" aria-live="polite">
                  <CheckCircleIcon />
                  <span>{successMsg}</span>
                </div>
              )}
              {errorMsg && (
                <div className="ct-alert error" aria-live="polite">
                  <AlertIcon />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form className="ct-form-grid" onSubmit={handleSubmit} noValidate>

                {/* Name + Email */}
                <div className="ct-form-row-2">
                  <div className="ct-field">
                    <label htmlFor="name">Nombre completo</label>
                    <div className="ct-input-wrap">
                      <span className="ct-field-icon"><UserIcon /></span>
                      <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Tu nombre" />
                    </div>
                  </div>
                  <div className="ct-field">
                    <label htmlFor="email">Correo electrónico</label>
                    <div className="ct-input-wrap">
                      <span className="ct-field-icon"><AtIcon /></span>
                      <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="tucorreo@gmail.com" />
                    </div>
                  </div>
                </div>

                {/* Subject */}
                <div className="ct-field">
                  <label htmlFor="subject">Asunto</label>
                  <div className="ct-input-wrap">
                    <span className="ct-field-icon"><TagIcon /></span>
                    <input id="subject" name="subject" value={form.subject} onChange={handleChange} placeholder="Ej. Problema con un pedido" />
                  </div>
                </div>

                {/* Message */}
                <div className="ct-field">
                  <label htmlFor="message">Mensaje</label>
                  <div className="ct-input-wrap">
                    <span className="ct-field-icon"><MsgIcon /></span>
                    <textarea id="message" name="message" value={form.message} onChange={handleChange} placeholder="Escribe tu mensaje..." />
                  </div>
                  <div className="ct-char-count">{form.message.length} caracteres</div>
                </div>

                <button type="submit" disabled={loading} className="ct-submit-btn">
                  {loading
                    ? <><div className="ct-spinner" /> Enviando...</>
                    : <><SendIcon /> Enviar mensaje</>}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
