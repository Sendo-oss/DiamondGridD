import { useEffect, useMemo, useState } from "react";
import { Layout } from "../components/Layout";
import { useAuth } from "../app/auth";
import { useCart } from "../app/cart";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import { createOrder, uploadOrderReceipt } from "../lib/api";

type BankKey = "PICHINCHA" | "PRODUBANCO" | "GUAYAQUIL";

const BANKS: Record<BankKey, {
  label: string; short: string; color: string;
  accountName: string; accountType: string; accountNumber: string;
  id: string; note?: string;
  accent: string; accentBg: string; accentBorder: string;
}> = {
  PICHINCHA: {
    label: "Banco Pichincha", short: "Pichincha",
    color: "from-yellow-400/20 to-amber-500/10",
    accent: "rgba(251,191,36,0.9)", accentBg: "rgba(251,191,36,0.07)", accentBorder: "rgba(251,191,36,0.2)",
    accountName: "Diamond Grid S.A.", accountType: "Cuenta Corriente",
    accountNumber: "2100-123456-7", id: "1799999999001",
    note: "Transferencia bancaria (Ecuador).",
  },
  PRODUBANCO: {
    label: "Produbanco", short: "Produbanco",
    color: "from-emerald-400/20 to-green-500/10",
    accent: "rgba(52,211,153,0.9)", accentBg: "rgba(52,211,153,0.07)", accentBorder: "rgba(52,211,153,0.2)",
    accountName: "Diamond Grid S.A.", accountType: "Cuenta Ahorros",
    accountNumber: "0987-654321-0", id: "1799999999001",
    note: "Puedes transferir o depositar directamente.",
  },
  GUAYAQUIL: {
    label: "Banco Guayaquil", short: "Guayaquil",
    color: "from-sky-400/20 to-blue-500/10",
    accent: "rgba(56,189,248,0.9)", accentBg: "rgba(56,189,248,0.07)", accentBorder: "rgba(56,189,248,0.2)",
    accountName: "Diamond Grid S.A.", accountType: "Cuenta Corriente",
    accountNumber: "001-222333444", id: "1799999999001",
    note: "Ideal para transferencias inmediatas.",
  },
};

function money(n: number) { return `$${Number(n || 0).toFixed(2)}`; }

async function copy(text: string, setCopied?: (v: string) => void, key?: string) {
  try {
    await navigator.clipboard.writeText(text);
    if (setCopied && key) { setCopied(key); setTimeout(() => setCopied(""), 1800); }
  } catch {}
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const ArrowLeftIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);
const CopyIcon = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
  </svg>
);
const QRIcon = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 17.25h.75v.75h-.75v-.75zM17.25 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75H13.5V13.5zM13.5 19.5h.75v.75H13.5V19.5zM19.5 13.5h.75v.75h-.75V13.5zM19.5 19.5h.75v.75h-.75V19.5zM16.5 16.5h.75v.75h-.75V16.5z" />
  </svg>
);
const WhatsappIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);
const UploadIcon = () => (
  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);
const CheckIcon = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);
const SpinnerIcon = () => (
  <div style={{ width: 15, height: 15, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", animation: "ck-spin 0.7s linear infinite" }} />
);

export function CheckoutPage() {
  const { user } = useAuth();
  const cart = useCart();
  const nav = useNavigate();

  const [bank, setBank] = useState<BankKey>("PICHINCHA");
  const [contactEmail, setContactEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [holderName, setHolderName] = useState("");
  const [reference, setReference] = useState("");
  const [qrOpen, setQrOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [creatingQR, setCreatingQR] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    if (!user) { nav("/login"); return; }
    setContactEmail(user.email || "");
    setHolderName(user.name || "");
  }, [user, nav]);

  const bankInfo = BANKS[bank];
  const subtotal = useMemo(() => cart.total, [cart.total]);
  const shipping = 0;
  const total = useMemo(() => subtotal + shipping, [subtotal]);
  const totalItems = useMemo(() => cart.items.reduce((a, i) => a + Number(i.qty || 0), 0), [cart.items]);

  const qrText = useMemo(() => [
    `Diamond Grid - Pago por transferencia`,
    `Banco: ${bankInfo.label}`, `Titular: ${bankInfo.accountName}`,
    `Tipo: ${bankInfo.accountType}`, `Cuenta: ${bankInfo.accountNumber}`,
    `ID: ${bankInfo.id}`, `Monto: ${money(total)}`,
    `Email: ${contactEmail || ""}`, `Referencia: ${reference || ""}`, `Notas: ${notes || ""}`,
  ].join("\n"), [bankInfo, total, contactEmail, reference, notes]);

  async function generateQR() {
    setCreatingQR(true);
    try {
      const url = await QRCode.toDataURL(qrText, { margin: 1, scale: 8 });
      setQrDataUrl(url); setQrOpen(true);
    } finally { setCreatingQR(false); }
  }

  function handleReceiptChange(file: File | null) {
    setReceiptFile(file);
    if (!file) { setReceiptPreview(null); return; }
    if (file.type.startsWith("image/")) setReceiptPreview(URL.createObjectURL(file));
    else setReceiptPreview(null);
  }

  function openWhatsapp() {
    const msg = encodeURIComponent(`Hola, ya realicé el pago de mi compra en Diamond Grid.\nBanco: ${bankInfo.label}\nMonto: ${money(total)}\nCorreo: ${contactEmail}\nReferencia: ${reference || "Sin referencia"}`);
    window.open(`https://wa.me/593000000000?text=${msg}`, "_blank");
  }

  async function submitOrder() {
    if (cart.items.length === 0) { alert("Tu carrito está vacío."); return; }
    if (!contactEmail.trim()) { alert("Ingresa un email de contacto."); return; }
    setSubmitting(true);
    try {
      const payload = {
        method: "BANK_TRANSFER" as const,
        bank: bankInfo.label,
        reference: reference.trim() || undefined,
        holderName: holderName.trim() || undefined,
        notes: notes.trim() || undefined,
        items: cart.items.map(it => ({ id: it.id, qty: Number(it.qty) })),
      };
      const res = await createOrder(payload);
      if (res?.ok === false) throw new Error(res.message || "No se pudo crear la orden.");
      const orderId = res?.order?.id;
      const orderNumber = res?.order?.orderNumber || res?.order?.id;
      if (receiptFile && orderId) {
        const up = await uploadOrderReceipt(orderId, receiptFile);
        if (up?.ok === false) throw new Error(up.message || "Orden creada pero no se pudo subir el comprobante.");
      }
      alert(`✅ Orden creada correctamente.\nNúmero: ${orderNumber}`);
      cart.clear(); nav("/profile");
    } catch (e: any) {
      alert(`❌ ${e.message || "Error al crear la orden."}`);
    } finally { setSubmitting(false); }
  }

  if (!user) return null;

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        @keyframes ck-spin { to { transform: rotate(360deg); } }
        @keyframes ck-fadein { from { opacity:0; transform:scale(0.97); } to { opacity:1; transform:scale(1); } }

        .ck { font-family: 'Inter', sans-serif; color: #fff; }
        .ck * { box-sizing: border-box; }

        /* ── PAGE HEADER ── */
        .ck-hero {
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

        .ck-hero-eye {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(34,211,238,0.55);
          margin-bottom: 6px;
        }

        .ck-hero-title {
          font-family: 'Syne', sans-serif;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .ck-hero-sub { font-size: 13.5px; color: rgba(255,255,255,0.4); margin-top: 5px; max-width: 480px; }

        .ck-back-btn {
          display: flex; align-items: center; gap: 7px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.04);
          padding: 9px 16px;
          font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.6);
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: background 0.15s, color 0.15s;
        }
        .ck-back-btn:hover { background: rgba(255,255,255,0.07); color: #fff; }

        /* ── STEPS ── */
        .ck-steps {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          margin-bottom: 20px;
        }
        @media (min-width: 768px) { .ck-steps { grid-template-columns: repeat(3, 1fr); } }

        .ck-step {
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
          padding: 18px 20px;
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .ck-step-num {
          flex-shrink: 0;
          width: 30px; height: 30px;
          border-radius: 9px;
          border: 1px solid rgba(34,211,238,0.2);
          background: rgba(34,211,238,0.07);
          display: flex; align-items: center; justify-content: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px; font-weight: 700;
          color: rgba(34,211,238,0.8);
        }

        .ck-step-title { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; margin-bottom: 4px; }
        .ck-step-desc { font-size: 12px; color: rgba(255,255,255,0.4); line-height: 1.55; }

        /* ── MAIN GRID ── */
        .ck-grid {
          display: grid;
          gap: 16px;
          grid-template-columns: 1fr;
        }
        @media (min-width: 1024px) { .ck-grid { grid-template-columns: 1.65fr 1fr; } }

        /* ── PANEL ── */
        .ck-panel {
          border-radius: 22px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.025);
          backdrop-filter: blur(14px);
          overflow: hidden;
          margin-bottom: 14px;
        }

        .ck-panel-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .ck-panel-title {
          font-family: 'Syne', sans-serif;
          font-size: 16px; font-weight: 700;
          letter-spacing: -0.02em;
        }

        .ck-panel-sub { font-size: 12.5px; color: rgba(255,255,255,0.38); margin-top: 4px; }

        .ck-panel-body { padding: 20px 24px; }

        /* ── FIELDS ── */
        .ck-fields-grid {
          display: grid;
          gap: 12px;
          grid-template-columns: 1fr;
        }
        @media (min-width: 640px) { .ck-fields-grid { grid-template-columns: 1fr 1fr; } }

        .ck-field label {
          display: block;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(255,255,255,0.28);
          margin-bottom: 7px;
        }

        .ck-input, .ck-select, .ck-textarea {
          width: 100%;
          border-radius: 13px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.04);
          padding: 11px 14px;
          color: #fff;
          font-size: 13.5px;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          appearance: none;
        }
        .ck-input::placeholder, .ck-textarea::placeholder { color: rgba(255,255,255,0.18); }
        .ck-input:focus, .ck-select:focus, .ck-textarea:focus {
          border-color: rgba(34,211,238,0.22);
          background: rgba(255,255,255,0.06);
          box-shadow: 0 0 0 3px rgba(34,211,238,0.05);
        }
        .ck-textarea { resize: vertical; min-height: 100px; line-height: 1.6; }

        .ck-select-wrap { position: relative; }
        .ck-select-wrap::after {
          content: '▾';
          position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
          color: rgba(255,255,255,0.3); pointer-events: none; font-size: 12px;
        }

        /* ── BANK CARD ── */
        .ck-bank-card {
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.08);
          padding: 20px;
          margin-top: 18px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        @media (min-width: 900px) {
          .ck-bank-card { flex-direction: row; align-items: flex-start; justify-content: space-between; }
        }

        .ck-bank-label {
          font-size: 9.5px; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; color: rgba(255,255,255,0.3);
          margin-bottom: 8px;
        }

        .ck-bank-name {
          font-family: 'Syne', sans-serif;
          font-size: 20px; font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 16px;
        }

        .ck-bank-rows { display: flex; flex-direction: column; gap: 10px; }

        .ck-bank-row-label { font-size: 10px; color: rgba(255,255,255,0.35); margin-bottom: 2px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em; }
        .ck-bank-row-val { font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.9); }
        .ck-bank-row-val.mono { font-family: 'JetBrains Mono', monospace; font-size: 16px; font-weight: 700; letter-spacing: 0.06em; }

        .ck-bank-note { font-size: 11.5px; color: rgba(255,255,255,0.32); margin-top: 6px; }

        /* ── BANK ACTION BUTTONS ── */
        .ck-bank-actions { display: flex; flex-direction: column; gap: 8px; min-width: 148px; }

        .ck-btn-ghost-sm {
          display: flex; align-items: center; justify-content: center; gap: 7px;
          border-radius: 11px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          padding: 9px 12px;
          font-size: 12px; font-weight: 500;
          color: rgba(255,255,255,0.65);
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap;
        }
        .ck-btn-ghost-sm:hover { background: rgba(255,255,255,0.08); color: #fff; }
        .ck-btn-ghost-sm.copied {
          border-color: rgba(45,212,191,0.25);
          background: rgba(45,212,191,0.07);
          color: rgba(94,234,212,0.9);
        }

        .ck-btn-primary-sm {
          display: flex; align-items: center; justify-content: center; gap: 7px;
          border-radius: 11px;
          border: none;
          background: linear-gradient(135deg, #22d3ee, #6366f1);
          padding: 9px 12px;
          font-size: 12px; font-weight: 700;
          color: #fff;
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 3px 14px rgba(34,211,238,0.18);
        }
        .ck-btn-primary-sm:hover { transform: scale(1.02); box-shadow: 0 4px 20px rgba(34,211,238,0.28); }
        .ck-btn-primary-sm:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .ck-btn-wa {
          display: flex; align-items: center; justify-content: center; gap: 7px;
          border-radius: 11px;
          border: 1px solid rgba(52,211,153,0.2);
          background: rgba(52,211,153,0.07);
          padding: 9px 12px;
          font-size: 12px; font-weight: 600;
          color: rgba(110,231,183,0.9);
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: background 0.15s;
        }
        .ck-btn-wa:hover { background: rgba(52,211,153,0.12); }

        /* ── RECEIPT UPLOAD ── */
        .ck-upload-zone {
          border-radius: 16px;
          border: 1.5px dashed rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.02);
          padding: 28px 20px;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          position: relative;
        }
        .ck-upload-zone:hover { border-color: rgba(34,211,238,0.2); background: rgba(34,211,238,0.03); }
        .ck-upload-zone input[type=file] {
          position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%;
        }

        .ck-upload-icon { color: rgba(255,255,255,0.2); margin: 0 auto 10px; }
        .ck-upload-text { font-size: 13px; color: rgba(255,255,255,0.4); }
        .ck-upload-hint { font-size: 11px; color: rgba(255,255,255,0.22); margin-top: 4px; }

        .ck-file-preview {
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.025);
          padding: 14px;
          margin-top: 12px;
        }

        .ck-file-name { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.85); margin-top: 4px; word-break: break-all; }
        .ck-file-label { font-size: 10px; color: rgba(255,255,255,0.3); font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }

        /* ── SUBMIT ROW ── */
        .ck-submit-row { display: flex; gap: 10px; flex-wrap: wrap; }

        .ck-btn-submit {
          flex: 1; min-width: 180px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(135deg, #22d3ee, #6366f1);
          padding: 14px 24px;
          font-size: 14.5px; font-weight: 700;
          color: #fff;
          cursor: pointer; font-family: 'Inter', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 9px;
          box-shadow: 0 4px 22px rgba(34,211,238,0.22);
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          position: relative; overflow: hidden;
        }
        .ck-btn-submit:hover:not(:disabled) { transform: scale(1.01); box-shadow: 0 5px 28px rgba(34,211,238,0.32); }
        .ck-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .ck-btn-submit::after {
          content: '';
          position: absolute;
          top: 0; left: -100%; width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          animation: ck-shine 3s infinite;
        }
        @keyframes ck-shine { to { left: 160%; } }

        .ck-btn-secondary {
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          padding: 14px 20px;
          font-size: 14px; font-weight: 500;
          color: rgba(255,255,255,0.55);
          cursor: pointer; font-family: 'Inter', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap;
        }
        .ck-btn-secondary:hover { background: rgba(255,255,255,0.06); color: #fff; }

        /* ── ORDER SUMMARY ── */
        .ck-item-row {
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
          padding: 13px 14px;
          display: flex; align-items: center; justify-content: space-between; gap: 10px;
          margin-bottom: 8px;
        }
        .ck-item-name { font-size: 13.5px; font-weight: 600; }
        .ck-item-type { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 2px; }
        .ck-item-qty  { font-size: 12px; color: rgba(255,255,255,0.4); text-align: right; }
        .ck-item-total { font-size: 13.5px; font-weight: 700; color: rgba(34,211,238,0.85); font-family: 'JetBrains Mono', monospace; }

        .ck-totals {
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
          padding: 14px;
          margin-top: 12px;
        }
        .ck-total-row { display: flex; align-items: center; justify-content: space-between; font-size: 13px; color: rgba(255,255,255,0.5); margin-bottom: 8px; }
        .ck-total-row span:last-child { color: rgba(255,255,255,0.75); font-weight: 600; font-family: 'JetBrains Mono', monospace; }
        .ck-total-final {
          display: flex; align-items: center; justify-content: space-between;
          border-top: 1px solid rgba(255,255,255,0.07);
          padding-top: 12px; margin-top: 4px;
        }
        .ck-total-final-label { font-size: 13px; color: rgba(255,255,255,0.5); }
        .ck-total-final-val { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800; color: rgba(34,211,238,0.9); }

        /* ── INFO CARDS ── */
        .ck-info-card {
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.05);
          background: rgba(255,255,255,0.02);
          padding: 13px 14px;
          margin-bottom: 8px;
          display: flex; align-items: flex-start; gap: 10px;
        }
        .ck-info-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
        .ck-info-title { font-size: 13px; font-weight: 600; margin-bottom: 3px; }
        .ck-info-desc { font-size: 12px; color: rgba(255,255,255,0.38); line-height: 1.5; }

        /* ── QR MODAL ── */
        .ck-modal-backdrop {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
        }

        .ck-modal {
          width: 100%; max-width: 480px;
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(8,14,28,0.98);
          padding: 28px;
          animation: ck-fadein 0.2s ease;
        }

        .ck-modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
        .ck-modal-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800; }
        .ck-modal-close {
          border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04); padding: 6px 12px;
          font-size: 12px; color: rgba(255,255,255,0.55); cursor: pointer;
          font-family: 'Inter', sans-serif; transition: background 0.15s;
        }
        .ck-modal-close:hover { background: rgba(255,255,255,0.08); color: #fff; }
        .ck-modal-sub { font-size: 12.5px; color: rgba(255,255,255,0.38); margin-bottom: 20px; }

        .ck-qr-wrap {
          border-radius: 16px; border: 1px solid rgba(255,255,255,0.08);
          background: #fff; padding: 16px;
          display: flex; justify-content: center; margin-bottom: 16px;
        }
      `}</style>

      <div className="ck">
        {/* ── HERO ── */}
        <div className="ck-hero">
          <div>
            <p className="ck-hero-eye">Diamond Grid · Checkout</p>
            <h1 className="ck-hero-title">Finalizar compra</h1>
            <p className="ck-hero-sub">Pago por transferencia bancaria. Sube tu comprobante y nuestro equipo verificará tu orden.</p>
          </div>
          <button className="ck-back-btn" onClick={() => nav("/")}>
            <ArrowLeftIcon /> Seguir comprando
          </button>
        </div>

        {/* ── STEPS ── */}
        <div className="ck-steps">
          {[
            { n: "01", title: "Transfiere o deposita", desc: "Usa una de nuestras cuentas bancarias y realiza el pago del total de tu orden." },
            { n: "02", title: "Sube tu comprobante", desc: "Adjunta la captura o PDF de tu transferencia para acelerar la validación." },
            { n: "03", title: "Confirmamos tu orden", desc: "Verás el pedido en tu perfil. El equipo lo verificará y procesará." },
          ].map(s => (
            <div className="ck-step" key={s.n}>
              <div className="ck-step-num">{s.n}</div>
              <div>
                <div className="ck-step-title">{s.title}</div>
                <div className="ck-step-desc">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── MAIN GRID ── */}
        <div className="ck-grid">

          {/* ── LEFT COL ── */}
          <div>
            {/* Payment method */}
            <div className="ck-panel">
              <div className="ck-panel-header">
                <div className="ck-panel-title">Método de pago</div>
                <div className="ck-panel-sub">Selecciona el banco, revisa los datos y realiza la transferencia.</div>
              </div>
              <div className="ck-panel-body">
                <div className="ck-fields-grid">
                  <div className="ck-field">
                    <label>Banco</label>
                    <div className="ck-select-wrap">
                      <select className="ck-select" value={bank} onChange={e => setBank(e.target.value as BankKey)}>
                        <option value="PICHINCHA">Banco Pichincha</option>
                        <option value="PRODUBANCO">Produbanco</option>
                        <option value="GUAYAQUIL">Banco Guayaquil</option>
                      </select>
                    </div>
                  </div>
                  <div className="ck-field">
                    <label>Email de contacto</label>
                    <input className="ck-input" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="tu@gmail.com" />
                  </div>
                  <div className="ck-field">
                    <label>Nombre del depositante</label>
                    <input className="ck-input" value={holderName} onChange={e => setHolderName(e.target.value)} placeholder="Nombre completo" />
                  </div>
                  <div className="ck-field">
                    <label>Referencia / N° comprobante</label>
                    <input className="ck-input" value={reference} onChange={e => setReference(e.target.value)} placeholder="Ej: 458712" />
                  </div>
                </div>

                {/* Bank card */}
                <div className="ck-bank-card" style={{ background: bankInfo.accentBg, borderColor: bankInfo.accentBorder }}>
                  <div style={{ flex: 1 }}>
                    <div className="ck-bank-label">Deposita / Transfiere a</div>
                    <div className="ck-bank-name" style={{ color: bankInfo.accent }}>{bankInfo.label}</div>
                    <div className="ck-bank-rows">
                      {[
                        { label: "Titular", val: bankInfo.accountName, mono: false },
                        { label: "Tipo", val: bankInfo.accountType, mono: false },
                        { label: "Número de cuenta", val: bankInfo.accountNumber, mono: true },
                        { label: "RUC / CI", val: bankInfo.id, mono: false },
                      ].map(r => (
                        <div key={r.label}>
                          <div className="ck-bank-row-label">{r.label}</div>
                          <div className={`ck-bank-row-val ${r.mono ? "mono" : ""}`}>{r.val}</div>
                        </div>
                      ))}
                      {bankInfo.note && <div className="ck-bank-note">{bankInfo.note}</div>}
                    </div>
                  </div>

                  <div className="ck-bank-actions">
                    <button
                      className={`ck-btn-ghost-sm ${copied === "account" ? "copied" : ""}`}
                      onClick={() => copy(bankInfo.accountNumber, setCopied, "account")}
                    >
                      {copied === "account" ? <><CheckIcon /> Copiado</> : <><CopyIcon /> Copiar cuenta</>}
                    </button>
                    <button
                      className={`ck-btn-ghost-sm ${copied === "data" ? "copied" : ""}`}
                      onClick={() => copy(qrText, setCopied, "data")}
                    >
                      {copied === "data" ? <><CheckIcon /> Copiado</> : <><CopyIcon /> Copiar datos</>}
                    </button>
                    <button className="ck-btn-primary-sm" onClick={generateQR} disabled={creatingQR}>
                      <QRIcon /> {creatingQR ? "Generando…" : "Generar QR"}
                    </button>
                    <button className="ck-btn-wa" onClick={openWhatsapp}>
                      <WhatsappIcon /> WhatsApp
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div className="ck-field" style={{ marginTop: 18 }}>
                  <label>Notas del pedido (opcional)</label>
                  <textarea className="ck-textarea" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Dirección de entrega, indicaciones, observaciones…" />
                </div>
              </div>
            </div>

            {/* Receipt upload */}
            <div className="ck-panel">
              <div className="ck-panel-header">
                <div className="ck-panel-title">Comprobante de pago</div>
                <div className="ck-panel-sub">Adjunta una captura, foto o PDF de tu transferencia.</div>
              </div>
              <div className="ck-panel-body">
                <div className="ck-upload-zone">
                  <input type="file" accept="image/*,.pdf" onChange={e => handleReceiptChange(e.target.files?.[0] ?? null)} />
                  <div className="ck-upload-icon"><UploadIcon /></div>
                  <div className="ck-upload-text">Arrastra un archivo o haz clic para seleccionar</div>
                  <div className="ck-upload-hint">JPG, PNG, PDF — máx. 10 MB</div>
                </div>

                {receiptFile && (
                  <div className="ck-file-preview">
                    <div className="ck-file-label">Archivo seleccionado</div>
                    <div className="ck-file-name">{receiptFile.name}</div>
                    {receiptPreview && (
                      <div style={{ marginTop: 12, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.2)", padding: 8 }}>
                        <img src={receiptPreview} alt="Comprobante" style={{ maxHeight: 280, maxWidth: "100%", margin: "0 auto", display: "block", borderRadius: 8, objectFit: "contain" }} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="ck-submit-row">
              <button className="ck-btn-submit" onClick={submitOrder} disabled={cart.items.length === 0 || submitting}>
                {submitting ? <><SpinnerIcon /> Creando orden…</> : "Confirmar y crear orden"}
              </button>
              <button className="ck-btn-secondary" onClick={() => nav("/")}>
                <ArrowLeftIcon /> Volver
              </button>
            </div>
          </div>

          {/* ── RIGHT COL ── */}
          <div>
            {/* Order summary */}
            <div className="ck-panel">
              <div className="ck-panel-header">
                <div className="ck-panel-title">Resumen de orden</div>
                <div className="ck-panel-sub">{totalItems} producto{totalItems !== 1 ? "s" : ""} en tu compra.</div>
              </div>
              <div className="ck-panel-body">
                {cart.items.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px 0", color: "rgba(255,255,255,0.28)", fontSize: 13 }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>🛒</div>
                    Tu carrito está vacío.
                  </div>
                ) : cart.items.map(it => (
                  <div className="ck-item-row" key={it.id}>
                    <div>
                      <div className="ck-item-name">{it.brand} {it.model}</div>
                      <div className="ck-item-type">{it.type}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div className="ck-item-qty">{it.qty} × {money(it.price)}</div>
                      <div className="ck-item-total">{money(it.qty * it.price)}</div>
                    </div>
                  </div>
                ))}

                <div className="ck-totals">
                  <div className="ck-total-row"><span>Subtotal</span><span>{money(subtotal)}</span></div>
                  <div className="ck-total-row"><span>Envío</span><span>{money(shipping)}</span></div>
                  <div className="ck-total-final">
                    <span className="ck-total-final-label">Total</span>
                    <span className="ck-total-final-val">{money(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="ck-panel">
              <div className="ck-panel-header">
                <div className="ck-panel-title">Información importante</div>
              </div>
              <div className="ck-panel-body">
                {[
                  { icon: "🔒", title: "Pago seguro", desc: "Tu compra será validada manualmente por el administrador.", color: "rgba(110,231,183,0.85)" },
                  { icon: "🧾", title: "Verificación de comprobante", desc: "Tu orden inicia en estado pendiente hasta que el pago sea confirmado.", color: "rgba(34,211,238,0.85)" },
                  { icon: "📩", title: "Seguimiento desde tu perfil", desc: "Después de crear la orden, podrás verla en la sección «Mis pedidos».", color: "rgba(255,255,255,0.85)" },
                ].map(info => (
                  <div className="ck-info-card" key={info.title}>
                    <div className="ck-info-icon">{info.icon}</div>
                    <div>
                      <div className="ck-info-title" style={{ color: info.color }}>{info.title}</div>
                      <div className="ck-info-desc">{info.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── QR MODAL ── */}
      {qrOpen && (
        <div className="ck-modal-backdrop" onClick={() => setQrOpen(false)}>
          <div className="ck-modal" onClick={e => e.stopPropagation()}>
            <div className="ck-modal-header">
              <div className="ck-modal-title">QR de transferencia</div>
              <button className="ck-modal-close" onClick={() => setQrOpen(false)}>✕ Cerrar</button>
            </div>
            <div className="ck-modal-sub">Escanea o comparte este QR con los datos del pago.</div>
            <div className="ck-qr-wrap">
              {qrDataUrl && <img src={qrDataUrl} alt="QR" style={{ width: 280, height: 280 }} />}
            </div>
            <button
              className="ck-btn-ghost-sm"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => copy(qrText, setCopied, "qr")}
            >
              {copied === "qr" ? <><CheckIcon /> Texto copiado</> : <><CopyIcon /> Copiar texto del QR</>}
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}