import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { fetchMe, updateMe, uploadAvatar, API_BASE, fetchMyOrders } from "../lib/api";
import { useAuth } from "../app/auth";
import { openInvoiceWindow } from "../lib/invoice";

type Me = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "worker" | "user";
  nickname?: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
};

function money(n: number) {
  return `$${Number(n || 0).toFixed(2)}`;
}

function orderBadgeStyle(status: string) {
  switch (status) {
    case "PAID":     return { border: "rgba(45,212,191,0.25)",  bg: "rgba(45,212,191,0.08)",  text: "rgba(94,234,212,0.9)",   label: "Pagado" };
    case "REJECTED": return { border: "rgba(244,63,94,0.25)",   bg: "rgba(244,63,94,0.08)",   text: "rgba(252,165,165,0.9)", label: "Rechazado" };
    case "CANCELLED":return { border: "rgba(251,146,60,0.25)",  bg: "rgba(251,146,60,0.08)",  text: "rgba(253,186,116,0.9)", label: "Cancelado" };
    default:         return { border: "rgba(251,191,36,0.25)",  bg: "rgba(251,191,36,0.08)",  text: "rgba(253,224,71,0.9)",  label: "Pendiente" };
  }
}

const ROLE_STYLES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  admin:  { label: "Admin",  color: "rgba(252,165,165,0.9)", bg: "rgba(244,63,94,0.08)",  border: "rgba(244,63,94,0.25)"  },
  worker: { label: "Worker", color: "rgba(196,181,253,0.9)", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.25)" },
  user:   { label: "Cliente",color: "rgba(94,234,212,0.9)",  bg: "rgba(45,212,191,0.08)", border: "rgba(45,212,191,0.25)" },
};

// ── Icons ─────────────────────────────────────────────────────────────────────
const CameraIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
  </svg>
);

const SaveIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const ReceiptIcon = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
  </svg>
);

const UserIcon = () => (
  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);
const AtIcon = () => (
  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25" />
  </svg>
);
const PhoneIcon = () => (
  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);
const EditIcon = () => (
  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user: authUser, token, login } = useAuth();

  const [me, setMe] = useState<Me | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "orders">("profile");

  const [form, setForm] = useState({
    name: authUser?.name || "",
    nickname: "",
    phone: "",
    bio: "",
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [meRes, ordersRes] = await Promise.all([fetchMe(), fetchMyOrders()]);
        const u = meRes.user;
        setMe(u);
        setForm({ name: u?.name || authUser?.name || "", nickname: u?.nickname || "", phone: u?.phone || "", bio: u?.bio || "" });
        setOrders(Array.isArray(ordersRes?.orders) ? ordersRes.orders : []);
      } catch {} finally { setLoading(false); }
    })();
  }, [authUser?.name]);

  async function onSave() {
    try {
      setSaving(true);
      const updated = await updateMe(form);
      setMe(updated.user);
      if (token) login({ user: updated.user, token });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  }

  async function onPickAvatar(file: File | null) {
    if (!file) return;
    const updated = await uploadAvatar(file);
    setMe(updated.user);
    if (token) login({ user: updated.user, token });
  }

  async function generateInvoice(order: any) {
    const opened = await openInvoiceWindow(order, {
      customerName: me?.name || authUser?.name,
      customerEmail: me?.email || authUser?.email,
    });
    if (!opened) {
      alert("No se pudo abrir la factura. Revisa si el navegador bloqueo la ventana emergente.");
    }
  }

  const role = me?.role || authUser?.role || "user";
  const roleStyle = ROLE_STYLES[role] ?? ROLE_STYLES.user;
  const initials = (form.nickname?.[0] || form.name?.[0] || "U").toUpperCase();

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        .prof { font-family: 'Inter', sans-serif; color: #fff; }
        .prof * { box-sizing: border-box; }

        /* ── PAGE HEADER ── */
        .prof-page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 24px;
        }

        .prof-page-eye {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(34,211,238,0.55);
          margin-bottom: 5px;
        }

        .prof-page-title {
          font-family: 'Syne', sans-serif;
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .prof-page-sub { font-size: 13px; color: rgba(255,255,255,0.4); margin-top: 4px; }

        /* ── TABS (mobile) ── */
        .prof-tabs {
          display: flex;
          gap: 4px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          padding: 4px;
          width: fit-content;
          margin-bottom: 20px;
        }
        @media (min-width: 1024px) { .prof-tabs { display: none; } }

        .prof-tab {
          border-radius: 10px;
          padding: 8px 18px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          background: none;
          color: rgba(255,255,255,0.4);
          transition: all 0.2s;
          font-family: 'Inter', sans-serif;
        }
        .prof-tab.active { background: rgba(255,255,255,0.07); color: #fff; box-shadow: 0 1px 8px rgba(0,0,0,0.3); }

        /* ── GRID ── */
        .prof-grid {
          display: grid;
          gap: 16px;
          grid-template-columns: 1fr;
        }
        @media (min-width: 1024px) {
          .prof-grid { grid-template-columns: 1fr 1.2fr; }
          .prof-col-profile { display: block !important; }
          .prof-col-orders  { display: block !important; }
        }

        /* ── PANEL ── */
        .prof-panel {
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.025);
          backdrop-filter: blur(14px);
          overflow: hidden;
        }

        .prof-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .prof-panel-title {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        /* ── AVATAR ── */
        .prof-avatar-wrap {
          position: relative;
          width: 88px;
          height: 88px;
          flex-shrink: 0;
        }

        .prof-avatar {
          width: 88px;
          height: 88px;
          border-radius: 22px;
          object-fit: cover;
          border: 2px solid rgba(34,211,238,0.2);
        }

        .prof-avatar-placeholder {
          width: 88px;
          height: 88px;
          border-radius: 22px;
          border: 2px solid rgba(34,211,238,0.15);
          background: linear-gradient(135deg, rgba(34,211,238,0.08), rgba(99,102,241,0.08));
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Syne', sans-serif;
          font-size: 28px;
          font-weight: 800;
          color: rgba(34,211,238,0.7);
        }

        .prof-avatar-upload {
          position: absolute;
          bottom: -6px;
          right: -6px;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          border: 1.5px solid rgba(255,255,255,0.1);
          background: rgba(20,30,50,0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: rgba(34,211,238,0.7);
          transition: background 0.15s, color 0.15s;
        }
        .prof-avatar-upload:hover { background: rgba(34,211,238,0.1); color: rgba(34,211,238,1); }

        /* ── USER INFO ── */
        .prof-user-block {
          display: flex;
          align-items: flex-start;
          gap: 18px;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .prof-user-name {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .prof-user-email {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          margin-top: 3px;
          font-family: 'JetBrains Mono', monospace;
        }

        .prof-role-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border-radius: 8px;
          border: 1px solid;
          padding: 3px 10px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-top: 8px;
          width: fit-content;
        }

        /* ── FORM ── */
        .prof-form {
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .prof-section-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.22);
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 2px;
        }
        .prof-section-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }

        .prof-field label {
          display: block;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.28);
          margin-bottom: 7px;
        }

        .prof-input-wrap { position: relative; }

        .prof-input-wrap input,
        .prof-input-wrap textarea {
          width: 100%;
          border-radius: 13px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.04);
          padding: 11px 12px 11px 40px;
          color: #fff;
          font-size: 13.5px;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }

        .prof-input-wrap input::placeholder,
        .prof-input-wrap textarea::placeholder { color: rgba(255,255,255,0.18); }

        .prof-input-wrap input:focus,
        .prof-input-wrap textarea:focus {
          border-color: rgba(34,211,238,0.22);
          background: rgba(255,255,255,0.06);
          box-shadow: 0 0 0 3px rgba(34,211,238,0.05);
        }

        .prof-input-wrap textarea {
          resize: vertical;
          min-height: 90px;
          padding-left: 40px;
          line-height: 1.6;
        }

        .prof-field-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.2);
          pointer-events: none;
          transition: color 0.2s;
          display: flex;
          align-items: center;
        }
        .prof-input-wrap:has(textarea) .prof-field-icon { top: 14px; transform: none; }
        .prof-input-wrap:focus-within .prof-field-icon { color: rgba(34,211,238,0.45); }

        /* ── SAVE BTN ── */
        .prof-save-btn {
          width: 100%;
          border-radius: 14px;
          padding: 13px;
          font-size: 14px;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          position: relative;
          overflow: hidden;
        }

        .prof-save-btn.active {
          background: linear-gradient(135deg, #22d3ee, #6366f1);
          color: #fff;
          box-shadow: 0 4px 20px rgba(34,211,238,0.22);
        }
        .prof-save-btn.active:hover { transform: scale(1.012); box-shadow: 0 5px 28px rgba(34,211,238,0.3); }

        .prof-save-btn.success {
          background: rgba(45,212,191,0.15);
          border: 1px solid rgba(45,212,191,0.3);
          color: rgba(94,234,212,0.9);
          cursor: default;
        }

        .prof-save-btn.loading {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.3);
          cursor: not-allowed;
        }

        .prof-spinner {
          width: 15px;
          height: 15px;
          border: 2px solid rgba(255,255,255,0.2);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── ORDERS ── */
        .prof-orders-list {
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 680px;
          overflow-y: auto;
        }

        .prof-orders-list::-webkit-scrollbar { width: 4px; }
        .prof-orders-list::-webkit-scrollbar-track { background: transparent; }
        .prof-orders-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

        .prof-order-card {
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.025);
          padding: 16px 18px;
          transition: border-color 0.2s;
        }
        .prof-order-card:hover { border-color: rgba(255,255,255,0.12); }

        .prof-order-num {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          color: rgba(34,211,238,0.8);
          font-weight: 500;
        }

        .prof-order-date { font-size: 11.5px; color: rgba(255,255,255,0.35); margin-top: 3px; }

        .prof-order-status {
          border-radius: 9px;
          padding: 4px 11px;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .prof-item-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.05);
          background: rgba(0,0,0,0.15);
          padding: 9px 12px;
          margin-top: 8px;
        }

        .prof-item-name { font-size: 13px; font-weight: 600; }
        .prof-item-type { font-size: 11px; color: rgba(255,255,255,0.38); margin-top: 1px; }
        .prof-item-qty  { font-size: 12px; color: rgba(255,255,255,0.45); text-align: right; }
        .prof-item-total { font-size: 13px; font-weight: 700; color: rgba(34,211,238,0.85); }

        .prof-order-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 10px;
        }

        .prof-meta-box {
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.05);
          background: rgba(0,0,0,0.15);
          padding: 10px 12px;
        }

        .prof-meta-label { font-size: 10px; color: rgba(255,255,255,0.32); font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 4px; }
        .prof-meta-val { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.85); }

        .prof-receipt-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
          border-radius: 11px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          padding: 8px 14px;
          font-size: 12.5px;
          font-weight: 500;
          color: rgba(255,255,255,0.65);
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
        }
        button.prof-receipt-link {
          font-family: 'Inter', sans-serif;
          cursor: pointer;
        }
        .prof-receipt-link:hover { background: rgba(255,255,255,0.08); color: #fff; }

        .prof-empty {
          text-align: center;
          padding: 48px 24px;
          color: rgba(255,255,255,0.28);
          font-size: 14px;
        }

        .prof-empty-icon {
          font-size: 40px;
          margin-bottom: 12px;
          opacity: 0.4;
        }

        .prof-skeleton {
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
          padding: 16px 18px;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer { 0%,100%{opacity:.5} 50%{opacity:1} }

        .prof-skel-line {
          border-radius: 6px;
          background: rgba(255,255,255,0.06);
          height: 11px;
          margin-top: 10px;
          animation: shimmer 1.5s infinite;
        }
      `}</style>

      <div className="prof">
        {/* ── PAGE HEADER ── */}
        <div className="prof-page-header">
          <div>
            <p className="prof-page-eye">Diamond Grid</p>
            <h1 className="prof-page-title">Mi cuenta</h1>
            <p className="prof-page-sub">Gestiona tu perfil y consulta el historial de pedidos.</p>
          </div>
        </div>

        {/* ── TABS (mobile only) ── */}
        <div className="prof-tabs">
          <button className={`prof-tab ${activeTab === "profile" ? "active" : ""}`} onClick={() => setActiveTab("profile")}>
            Mi perfil
          </button>
          <button className={`prof-tab ${activeTab === "orders" ? "active" : ""}`} onClick={() => setActiveTab("orders")}>
            Pedidos
            {orders.length > 0 && (
              <span style={{ background: "rgba(34,211,238,0.15)", color: "rgba(34,211,238,0.9)", borderRadius: 99, padding: "1px 7px", fontSize: 10, fontWeight: 700, marginLeft: 5 }}>
                {orders.length}
              </span>
            )}
          </button>
        </div>

        {/* ── GRID ── */}
        <div className="prof-grid">

          {/* ── PROFILE PANEL ── */}
          <div
            className="prof-col-profile"
            style={{ display: activeTab === "profile" ? "block" : "none" }}
          >
            <div className="prof-panel">
              <div className="prof-panel-header">
                <span className="prof-panel-title">Información personal</span>
                <EditIcon />
              </div>

              {/* Avatar + user info */}
              <div className="prof-user-block">
                <div className="prof-avatar-wrap">
                  {me?.avatarUrl ? (
                    <img src={`${API_BASE}${me.avatarUrl}`} className="prof-avatar" alt="avatar" />
                  ) : (
                    <div className="prof-avatar-placeholder">{initials}</div>
                  )}
                  <label className="prof-avatar-upload" title="Cambiar foto">
                    <CameraIcon />
                    <input type="file" accept="image/*" className="hidden" style={{ display: "none" }} onChange={e => onPickAvatar(e.target.files?.[0] || null)} />
                  </label>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {loading ? (
                    <>
                      <div className="prof-skel-line" style={{ width: "60%" }} />
                      <div className="prof-skel-line" style={{ width: "80%", marginTop: 8 }} />
                    </>
                  ) : (
                    <>
                      <div className="prof-user-name">{form.name || "Tu nombre"}</div>
                      <div className="prof-user-email">{me?.email || authUser?.email}</div>
                      <div
                        className="prof-role-badge"
                        style={{ color: roleStyle.color, background: roleStyle.bg, borderColor: roleStyle.border }}
                      >
                        {roleStyle.label}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Form */}
              <div className="prof-form">
                <div className="prof-section-label">Datos personales</div>

                <div className="prof-field">
                  <label>Nombre completo</label>
                  <div className="prof-input-wrap">
                    <span className="prof-field-icon"><UserIcon /></span>
                    <input type="text" placeholder="Tu nombre" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                </div>

                <div className="prof-field">
                  <label>Apodo</label>
                  <div className="prof-input-wrap">
                    <span className="prof-field-icon"><AtIcon /></span>
                    <input type="text" placeholder="tu_apodo" value={form.nickname} onChange={e => setForm(p => ({ ...p, nickname: e.target.value.replace("@", "") }))} />
                  </div>
                </div>

                <div className="prof-field">
                  <label>Teléfono</label>
                  <div className="prof-input-wrap">
                    <span className="prof-field-icon"><PhoneIcon /></span>
                    <input type="tel" placeholder="+593 999 999 999" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                </div>

                <div className="prof-section-label">Acerca de ti</div>

                <div className="prof-field">
                  <label>Bio</label>
                  <div className="prof-input-wrap">
                    <span className="prof-field-icon"><EditIcon /></span>
                    <textarea placeholder="Cuéntanos algo sobre ti…" rows={4} value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
                  </div>
                </div>

                <button
                  onClick={onSave}
                  disabled={saving}
                  className={`prof-save-btn ${saved ? "success" : saving ? "loading" : "active"}`}
                >
                  {saving ? (
                    <><div className="prof-spinner" /> Guardando...</>
                  ) : saved ? (
                    <><SaveIcon /> Cambios guardados</>
                  ) : (
                    <><SaveIcon /> Guardar cambios</>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ── ORDERS PANEL ── */}
          <div
            className="prof-col-orders"
            style={{ display: activeTab === "orders" ? "block" : "none" }}
          >
            <div className="prof-panel" style={{ height: "100%" }}>
              <div className="prof-panel-header">
                <span className="prof-panel-title">Mis pedidos</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "JetBrains Mono, monospace" }}>
                  {orders.length} pedido{orders.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="prof-orders-list">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div className="prof-skeleton" key={i}>
                      <div className="prof-skel-line" style={{ width: "40%" }} />
                      <div className="prof-skel-line" style={{ width: "65%" }} />
                      <div className="prof-skel-line" style={{ width: "100%", height: 56, borderRadius: 12, marginTop: 14 }} />
                    </div>
                  ))
                ) : orders.length === 0 ? (
                  <div className="prof-empty">
                    <div className="prof-empty-icon">📦</div>
                    Aún no tienes pedidos registrados.
                    <br />
                    <span style={{ fontSize: 12, opacity: 0.6 }}>Cuando realices una compra aparecerá aquí.</span>
                  </div>
                ) : orders.map(order => {
                  const badge = orderBadgeStyle(order.status);
                  return (
                    <div className="prof-order-card" key={order.id}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                        <div>
                          <div className="prof-order-num">#{order.orderNumber || order.id.slice(0, 10)}</div>
                          <div className="prof-order-date">{new Date(order.createdAt).toLocaleString()}</div>
                        </div>
                        <span
                          className="prof-order-status"
                          style={{ color: badge.text, background: badge.bg, border: `1px solid ${badge.border}` }}
                        >
                          {badge.label}
                        </span>
                      </div>

                      {order.items?.map((it: any) => (
                        <div className="prof-item-row" key={it.id}>
                          <div>
                            <div className="prof-item-name">{it.brand} {it.model}</div>
                            <div className="prof-item-type">{it.type}</div>
                          </div>
                          <div>
                            <div className="prof-item-qty">{it.qty} × {money(it.price)}</div>
                            <div className="prof-item-total">{money(it.qty * it.price)}</div>
                          </div>
                        </div>
                      ))}

                      <div className="prof-order-meta">
                        <div className="prof-meta-box">
                          <div className="prof-meta-label">Banco</div>
                          <div className="prof-meta-val">{order.payment?.bank || "—"}</div>
                        </div>
                        <div className="prof-meta-box">
                          <div className="prof-meta-label">Total</div>
                          <div className="prof-meta-val" style={{ color: "rgba(34,211,238,0.85)" }}>{money(order.total)}</div>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                        <button
                          type="button"
                          onClick={() => void generateInvoice(order)}
                          className="prof-receipt-link"
                        >
                          <ReceiptIcon /> Generar factura
                        </button>

                        {order.payment?.receiptUrl && (
                          <a
                            href={`${API_BASE}${order.payment.receiptUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="prof-receipt-link"
                          >
                            <ReceiptIcon /> Ver comprobante
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
