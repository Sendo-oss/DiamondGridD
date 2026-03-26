import { useEffect, useMemo, useState } from "react";
import { Layout } from "../../components/Layout";
import { useNavigate } from "react-router-dom";
import {
  fetchComponents,
  createComponent,
  updateComponent,
  deleteComponent,
  adminExportCSV,
  updateComponentStock,
  updateComponentStatus,
  API_BASE,
  fetchAdminOrders,
  updateAdminOrderStatus,
} from "../../lib/api";
import { downloadCatalogPdf, openInvoiceWindow } from "../../lib/invoice";
import { useAuth } from "../../app/auth";
import { DashboardSidebar } from "../../components/DashboardSidebar";

const TYPES = ["CPU", "GPU", "RAM", "SSD", "PSU", "MOBO", "CASE"] as const;
type Status = "active" | "inactive";
type OrderStatus = "PENDING_PAYMENT" | "PAID" | "REJECTED" | "CANCELLED";

type FormState = {
  id?: string;
  type: string;
  brand: string;
  model: string;
  price: number;
  stock: number;
  status: Status;
  metaText: string;
  imageFile?: File | null;
  imagePreview?: string | null;
  galleryFiles?: File[];
};

const emptyForm: FormState = {
  type: "CPU", brand: "", model: "", price: 0,
  stock: 0, status: "active", metaText: "",
  imageFile: null, imagePreview: null, galleryFiles: [],
};

function authHeaders() {
  const token = localStorage.getItem("dg_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function uploadComponentGallery(componentId: string, files: File[]) {
  const fd = new FormData();
  for (const f of files) fd.append("images", f);
  const r = await fetch(`${API_BASE}/api/components/${componentId}/images`, {
    method: "POST", headers: { ...authHeaders() }, body: fd,
  });
  const text = await r.text();
  try { return JSON.parse(text); } catch { return { ok: false, message: text || "Respuesta no-JSON" }; }
}

function money(n: number) { return `$${Number(n || 0).toFixed(2)}`; }

function orderBadgeStyle(status: OrderStatus) {
  switch (status) {
    case "PAID":     return { border: "rgba(45,212,191,0.25)",  bg: "rgba(45,212,191,0.08)",  text: "rgba(94,234,212,0.9)" };
    case "REJECTED": return { border: "rgba(244,63,94,0.25)",   bg: "rgba(244,63,94,0.08)",   text: "rgba(252,165,165,0.9)" };
    case "CANCELLED":return { border: "rgba(251,146,60,0.25)",  bg: "rgba(251,146,60,0.08)",  text: "rgba(253,186,116,0.9)" };
    default:         return { border: "rgba(251,191,36,0.25)",  bg: "rgba(251,191,36,0.08)",  text: "rgba(253,224,71,0.9)" };
  }
}

const ORDER_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Pendiente", PAID: "Pagado", REJECTED: "Rechazado", CANCELLED: "Cancelado",
};

// ── Icons ─────────────────────────────────────────────────────────────────────
const RefreshIcon = () => (
  <svg style={{width:14,height:14}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);
const SearchIcon = () => (
  <svg style={{width:14,height:14}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
  </svg>
);
const TrashIcon = () => (
  <svg style={{width:13,height:13}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);
const EditIcon = () => (
  <svg style={{width:13,height:13}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);
const CheckIcon = () => (
  <svg style={{width:12,height:12}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);
const XIcon = () => (
  <svg style={{width:12,height:12}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const ReceiptIcon = () => (
  <svg style={{width:14,height:14}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
  </svg>
);
const ExportIcon = () => (
  <svg style={{width:14,height:14}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);
const WorkerBadge = () => (
  <svg style={{width:16,height:16}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────
export function WorkerDashboard() {
  const nav = useNavigate();
  const { logout, user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [orderFilter, setOrderFilter] = useState<"ALL" | OrderStatus>("ALL");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [msg, setMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"components" | "orders">("components");

  async function load() {
    setLoading(true);
    const data = await fetchComponents(typeFilter === "ALL" ? undefined : typeFilter);
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function loadOrders() {
    setOrdersLoading(true);
    try {
      const data = await fetchAdminOrders();
      setOrders(Array.isArray(data?.orders) ? data.orders : []);
    } finally { setOrdersLoading(false); }
  }

  useEffect(() => { load(); }, [typeFilter]);
  useEffect(() => { loadOrders(); }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter((x) => `${x.type} ${x.brand} ${x.model}`.toLowerCase().includes(t));
  }, [items, q]);

  const filteredOrders = useMemo(() =>
    orderFilter === "ALL" ? orders : orders.filter((o) => o.status === orderFilter),
    [orders, orderFilter]);

  function onEdit(c: any) {
    setMode("edit");
    setForm({
      id: c.id, type: c.type, brand: c.brand ?? "", model: c.model ?? "",
      price: Number(c.price ?? 0),
      stock: Number(c.stock ?? 0), status: c.status === "inactive" ? "inactive" : "active",
      metaText: c.meta ? JSON.stringify(c.meta, null, 2) : "",
      imageFile: null, imagePreview: c.imageUrl ? `${API_BASE}${c.imageUrl}` : null,
      galleryFiles: [],
    });
    setMsg(null);
  }

  function reset() { setMode("create"); setForm(emptyForm); setMsg(null); }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setMsg(null);
    let metaObj: any = undefined;
    const metaRaw = form.metaText.trim();
    if (metaRaw) {
      try { metaObj = JSON.parse(metaRaw); }
      catch { setMsg('❌ JSON inválido. Ej: {"socket":"AM4"}'); return; }
    }
    try {
      const fd = new FormData();
      fd.append("type", form.type); fd.append("brand", form.brand.trim());
      fd.append("model", form.model.trim()); fd.append("price", String(Number(form.price)));
      fd.append("stock", String(Number(form.stock ?? 0))); fd.append("status", form.status);
      if (metaObj !== undefined) fd.append("meta", JSON.stringify(metaObj));
      if (form.imageFile) fd.append("image", form.imageFile);

      let savedId = form.id;
      if (mode === "create") {
        const r = await createComponent(fd);
        if (r?.ok === false) throw new Error(r.message || "No se pudo crear");
        savedId = r?.component?.id ?? r?.id ?? savedId;
        setMsg("✅ Componente creado");
      } else {
        const r = await updateComponent(form.id!, fd);
        if (r?.ok === false) throw new Error(r.message || "No se pudo actualizar");
        setMsg("✅ Componente actualizado");
      }
      if (savedId && form.galleryFiles && form.galleryFiles.length > 0) {
        const gr = await uploadComponentGallery(savedId, form.galleryFiles);
        if (gr?.ok === false) setMsg(m => `${m}\n⚠️ Galería: ${gr.message}`);
        else setMsg(m => `${m}\n🖼️ Galería subida (${form.galleryFiles!.length})`);
      }
      reset(); await load();
    } catch (err: any) { setMsg(`❌ ${err.message || "Error"}`); }
  }

  async function onDelete(id: string) {
    if (!confirm("¿Seguro que deseas eliminar este componente?")) return;
    setMsg(null);
    try {
      const r = await deleteComponent(id);
      if (r?.ok === false) throw new Error(r.message || "No se pudo eliminar");
      setMsg("🗑️ Componente eliminado"); await load();
    } catch (e: any) { setMsg(`❌ ${e.message || "Error"}`); }
  }

  async function quickStock(id: string, delta: number) {
    try { await updateComponentStock(id, delta); await load(); } catch {}
  }

  async function toggleStatus(id: string, current: Status) {
    const next: Status = current === "active" ? "inactive" : "active";
    try { await updateComponentStatus(id, next); await load(); } catch {}
  }

  async function changeOrderStatus(orderId: string, status: OrderStatus) {
    try {
      const res = await updateAdminOrderStatus(orderId, status);
      if (res?.ok === false) throw new Error(res.message || "No se pudo actualizar");
      await loadOrders();
    } catch (e: any) { alert(`❌ ${e.message || "Error al actualizar pedido"}`); }
  }

  async function generateInvoice(order: any) {
    const opened = await openInvoiceWindow(order, {
      customerName: order.user?.name,
      customerEmail: order.user?.email,
    });
    if (!opened) {
      alert("No se pudo abrir la factura. Revisa si el navegador bloqueo la ventana emergente.");
    }
  }

  function handleLogout() {
    logout();
    nav("/", { replace: true });
  }

  async function exportCSV() {
    const blob = await adminExportCSV();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "diamond-grid-components.csv";
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  async function exportPDF() {
    await downloadCatalogPdf(filtered, {
      title: "Catalogo de componentes - Worker",
      filename: "diamond-grid-components-worker.pdf",
    });
  }

  const stats = useMemo(() => ({
    total: items.length,
    active: items.filter(i => i.status === "active").length,
    lowStock: items.filter(i => Number(i.stock) < 3).length,
    pendingOrders: orders.filter(o => o.status === "PENDING_PAYMENT").length,
  }), [items, orders]);

  return (
    <Layout hideSiteChrome>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        .wr { font-family: 'Inter', sans-serif; color: #fff; }
        .wr * { box-sizing: border-box; }
        .wr-shell {
          display: grid;
          grid-template-columns: 280px minmax(0, 1fr);
          gap: 18px;
          align-items: start;
        }
        .wr-sidebar {
          position: sticky;
          top: 16px;
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.035);
          backdrop-filter: blur(18px);
          padding: 18px;
        }
        .wr-side-brand {
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          margin-bottom: 14px;
        }
        .wr-side-eye {
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(196,181,253,0.68);
          font-weight: 700;
        }
        .wr-side-title {
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 800;
          margin-top: 6px;
        }
        .wr-side-sub {
          font-size: 12px;
          color: rgba(255,255,255,0.38);
          margin-top: 6px;
          line-height: 1.6;
        }
        .wr-side-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 14px;
        }
        .wr-side-btn {
          width: 100%;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.7);
          padding: 12px 14px;
          text-align: left;
          font-size: 13px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.18s;
        }
        .wr-side-btn:hover { background: rgba(255,255,255,0.06); color: #fff; }
        .wr-side-btn.active {
          background: rgba(139,92,246,0.12);
          border-color: rgba(139,92,246,0.25);
          color: rgba(196,181,253,0.95);
          box-shadow: 0 8px 24px rgba(139,92,246,0.08);
        }
        .wr-side-box {
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(0,0,0,0.14);
          padding: 14px;
          margin-top: 16px;
        }
        .wr-side-box-title {
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.34);
          margin-bottom: 10px;
          font-weight: 700;
        }
        .wr-side-stat {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: rgba(255,255,255,0.68);
          padding: 6px 0;
        }
        .wr-side-stat strong {
          color: rgba(255,255,255,0.92);
          font-family: 'Syne', sans-serif;
        }
        .wr-main { min-width: 0; }
        @media (max-width: 1080px) {
          .wr-shell { grid-template-columns: 1fr; }
          .wr-sidebar { position: static; }
        }

        .wr-header {
          border-radius: 22px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(16px);
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 20px;
        }

        .wr-title {
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.03em;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .wr-role-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border-radius: 8px;
          border: 1px solid rgba(139,92,246,0.3);
          background: rgba(139,92,246,0.1);
          color: rgba(196,181,253,0.9);
          padding: 3px 10px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .wr-subtitle { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 3px; }
        .wr-header-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }
        .wr-user-chip {
          display: flex;
          align-items: center;
          gap: 10px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          padding: 10px 12px;
          min-width: 0;
        }
        .wr-user-avatar {
          width: 34px;
          height: 34px;
          border-radius: 11px;
          background: linear-gradient(135deg, rgba(139,92,246,0.18), rgba(99,102,241,0.18));
          border: 1px solid rgba(139,92,246,0.22);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 800;
          color: rgba(255,255,255,0.88);
          flex-shrink: 0;
        }
        .wr-user-meta { min-width: 0; }
        .wr-user-name {
          font-size: 12.5px;
          font-weight: 700;
          color: rgba(255,255,255,0.9);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 180px;
        }
        .wr-user-role {
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(196,181,253,0.82);
          margin-top: 2px;
        }
        .wr-header-tools {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
          justify-content: flex-end;
        }

        .wr-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 20px;
        }
        @media (min-width: 640px) { .wr-stats { grid-template-columns: repeat(4, 1fr); } }

        .wr-stat {
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          padding: 16px 18px;
          transition: border-color 0.2s;
        }
        .wr-stat:hover { border-color: rgba(139,92,246,0.18); }

        .wr-stat-val {
          font-family: 'Syne', sans-serif;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1;
        }
        .wr-stat-label { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 6px; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; }

        .wr-tabs {
          display: flex;
          gap: 4px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          padding: 4px;
          width: fit-content;
          margin-bottom: 20px;
        }

        .wr-tab {
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
        .wr-tab.active { background: rgba(255,255,255,0.07); color: #fff; box-shadow: 0 1px 8px rgba(0,0,0,0.3); }

        .wr-panel {
          border-radius: 22px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.025);
          backdrop-filter: blur(12px);
          overflow: hidden;
        }

        .wr-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 22px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-wrap: wrap;
          gap: 12px;
        }

        .wr-panel-title {
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        /* Form */
        .wr-label {
          display: block;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.28);
          margin-bottom: 6px;
        }

        .wr-input, .wr-select, .wr-textarea {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.04);
          padding: 10px 12px;
          color: #fff;
          font-size: 13px;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .wr-input:focus, .wr-select:focus, .wr-textarea:focus {
          border-color: rgba(139,92,246,0.3);
          background: rgba(255,255,255,0.06);
        }
        .wr-input::placeholder { color: rgba(255,255,255,0.18); }
        .wr-select { appearance: none; cursor: pointer; }
        .wr-select option { background: #0d1117; }
        .wr-textarea {
          min-height: 100px; resize: vertical;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11.5px; line-height: 1.6;
        }

        .wr-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .wr-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }

        /* Buttons */
        .wr-btn {
          border-radius: 12px;
          padding: 9px 14px;
          font-size: 12.5px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s;
          white-space: nowrap;
        }

        .wr-btn-primary {
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          color: #fff;
          box-shadow: 0 3px 16px rgba(139,92,246,0.25);
        }
        .wr-btn-primary:hover { transform: scale(1.02); box-shadow: 0 4px 20px rgba(139,92,246,0.35); }

        .wr-btn-ghost {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.65);
        }
        .wr-btn-ghost:hover { background: rgba(255,255,255,0.09); color: #fff; }

        .wr-btn-danger {
          background: rgba(244,63,94,0.1);
          border: 1px solid rgba(244,63,94,0.2);
          color: rgba(252,165,165,0.9);
        }
        .wr-btn-danger:hover { background: rgba(244,63,94,0.18); }

        .wr-btn-success {
          background: rgba(45,212,191,0.1);
          border: 1px solid rgba(45,212,191,0.25);
          color: rgba(94,234,212,0.9);
        }
        .wr-btn-success:hover { background: rgba(45,212,191,0.18); }

        .wr-btn-warn {
          background: rgba(251,146,60,0.1);
          border: 1px solid rgba(251,146,60,0.2);
          color: rgba(253,186,116,0.9);
        }
        .wr-btn-warn:hover { background: rgba(251,146,60,0.18); }

        .wr-btn-export {
          background: rgba(139,92,246,0.1);
          border: 1px solid rgba(139,92,246,0.22);
          color: rgba(196,181,253,0.9);
        }
        .wr-btn-export:hover { background: rgba(139,92,246,0.18); }

        .wr-btn-sm { padding: 6px 10px; font-size: 11.5px; border-radius: 9px; }

        /* Search */
        .wr-search-wrap { position: relative; }
        .wr-search-wrap input {
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.04);
          padding: 9px 12px 9px 34px;
          color: #fff;
          font-size: 13px;
          font-family: 'Inter', sans-serif;
          outline: none;
          width: 220px;
          transition: border-color 0.2s, width 0.3s;
        }
        .wr-search-wrap input::placeholder { color: rgba(255,255,255,0.22); }
        .wr-search-wrap input:focus { border-color: rgba(139,92,246,0.28); width: 260px; }
        .wr-search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.25); pointer-events: none; }

        /* Component card */
        .comp-card {
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          padding: 14px 16px;
          transition: border-color 0.2s;
        }
        .comp-card:hover { border-color: rgba(255,255,255,0.12); }
        .comp-card.editing { border-color: rgba(139,92,246,0.3); background: rgba(139,92,246,0.04); }

        .comp-tag {
          border-radius: 8px;
          border: 1px solid rgba(139,92,246,0.25);
          background: rgba(139,92,246,0.1);
          color: rgba(196,181,253,0.85);
          padding: 3px 9px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          font-family: 'Syne', sans-serif;
        }

        .comp-status {
          border-radius: 8px;
          padding: 3px 9px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.04em;
        }
        .comp-status.active { border: 1px solid rgba(45,212,191,0.2); background: rgba(45,212,191,0.08); color: rgba(94,234,212,0.85); }
        .comp-status.inactive { border: 1px solid rgba(244,63,94,0.2); background: rgba(244,63,94,0.08); color: rgba(252,165,165,0.85); }

        .comp-name { font-size: 14px; font-weight: 600; margin-top: 8px; }
        .comp-price { font-size: 13px; color: rgba(196,181,253,0.9); font-weight: 600; }

        .stock-badge {
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          padding: 3px 9px;
          font-size: 11px;
          color: rgba(255,255,255,0.6);
          font-family: 'JetBrains Mono', monospace;
        }

        /* Order card */
        .order-card {
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.025);
          padding: 18px 20px;
          transition: border-color 0.2s;
        }
        .order-card:hover { border-color: rgba(255,255,255,0.1); }

        .order-num {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          color: rgba(196,181,253,0.85);
          font-weight: 500;
        }
        .order-meta { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 3px; }
        .order-total {
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .data-box {
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(0,0,0,0.2);
          padding: 14px 16px;
        }
        .data-label { font-size: 10px; color: rgba(255,255,255,0.35); font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; }
        .data-val { font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.85); }

        .order-item-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(0,0,0,0.15);
          padding: 10px 14px;
        }

        /* Msg */
        .wr-msg {
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          padding: 10px 14px;
          font-size: 12px;
          font-family: 'JetBrains Mono', monospace;
          color: rgba(255,255,255,0.7);
          white-space: pre-wrap;
          line-height: 1.6;
          margin-top: 12px;
        }

        /* File */
        .wr-file {
          width: 100%;
          border-radius: 12px;
          border: 1px dashed rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.02);
          padding: 10px 12px;
          font-size: 12px;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .wr-file:hover { border-color: rgba(139,92,246,0.25); }

        .img-preview {
          margin-top: 10px;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
          height: 120px;
        }
        .img-preview img { width: 100%; height: 100%; object-fit: cover; }

        .wr-empty { text-align: center; padding: 40px 20px; font-size: 13px; color: rgba(255,255,255,0.3); }

        /* Filter pills */
        .filter-pill {
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          color: rgba(255,255,255,0.5);
          transition: all 0.15s;
          font-family: 'Inter', sans-serif;
        }
        .filter-pill:hover { background: rgba(255,255,255,0.07); color: #fff; }
        .filter-pill.active {
          background: rgba(139,92,246,0.12);
          border-color: rgba(139,92,246,0.28);
          color: rgba(196,181,253,0.9);
        }

        .wr-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 14px 0; }
      `}</style>

      <div className="wr">
        <div className="wr-shell">
          <DashboardSidebar
            eyebrow="Operations Panel"
            title="Worker Hub"
            subtitle="Control operativo de catalogo, stock y verificacion de pedidos."
            accent="violet"
            items={[
              {
                key: "components",
                label: "Componentes y stock",
                icon: "▣",
                active: activeTab === "components",
                onClick: () => setActiveTab("components"),
              },
              {
                key: "orders",
                label: "Pedidos y revision",
                icon: "◫",
                active: activeTab === "orders",
                onClick: () => setActiveTab("orders"),
              },
            ]}
          />

          <div className="wr-main">
        {/* ── HEADER ── */}
        <div className="wr-header">
          <div>
            <div className="wr-title">
              Worker Dashboard
              <span className="wr-role-badge"><WorkerBadge /> Worker</span>
            </div>
            <p className="wr-subtitle">Gestiona componentes, stock y verificación de pedidos.</p>
          </div>
          <div className="wr-header-right">
            <div className="wr-header-tools">
            <div className="wr-search-wrap">
              <span className="wr-search-icon"><SearchIcon /></span>
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar componente…" />
            </div>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="wr-select" style={{ width: "auto", padding: "9px 14px" }}>
              <option value="ALL">Todos los tipos</option>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <button className="wr-btn wr-btn-export wr-btn-sm" onClick={exportCSV}>
              <ExportIcon /> Export CSV
            </button>
            <button className="wr-btn wr-btn-export wr-btn-sm" onClick={exportPDF}>
              <ExportIcon /> Export PDF
            </button>
            </div>
            <div className="wr-user-chip">
              <div className="wr-user-avatar">{(user?.name || "W")[0].toUpperCase()}</div>
              <div className="wr-user-meta">
                <div className="wr-user-name">{user?.name || "Worker"}</div>
                <div className="wr-user-role">Worker</div>
              </div>
              <button className="wr-btn wr-btn-danger wr-btn-sm" onClick={handleLogout}>
                <XIcon /> Cerrar sesion
              </button>
            </div>
          </div>
        </div>

        {/* ── STATS ── */}
        <div className="wr-stats">
          <div className="wr-stat">
            <div className="wr-stat-val" style={{ color: "rgba(196,181,253,0.9)" }}>{stats.total}</div>
            <div className="wr-stat-label">Componentes</div>
          </div>
          <div className="wr-stat">
            <div className="wr-stat-val" style={{ color: "rgba(94,234,212,0.9)" }}>{stats.active}</div>
            <div className="wr-stat-label">Activos</div>
          </div>
          <div className="wr-stat">
            <div className="wr-stat-val" style={{ color: "rgba(253,224,71,0.9)" }}>{stats.lowStock}</div>
            <div className="wr-stat-label">Stock bajo</div>
          </div>
          <div className="wr-stat">
            <div className="wr-stat-val" style={{ color: "rgba(253,186,116,0.9)" }}>{stats.pendingOrders}</div>
            <div className="wr-stat-label">Pendientes</div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="wr-tabs">
          <button className={`wr-tab ${activeTab === "components" ? "active" : ""}`} onClick={() => setActiveTab("components")}>
            Componentes
          </button>
          <button className={`wr-tab ${activeTab === "orders" ? "active" : ""}`} onClick={() => setActiveTab("orders")}>
            Pedidos
            {stats.pendingOrders > 0 && (
              <span style={{ background: "rgba(251,191,36,0.8)", color: "#000", borderRadius: 99, padding: "1px 6px", fontSize: 10, fontWeight: 700, marginLeft: 4 }}>
                {stats.pendingOrders}
              </span>
            )}
          </button>
        </div>

        {/* ── COMPONENTS TAB ── */}
        {activeTab === "components" && (
          <div style={{ display: "grid", gap: 16 }} className="wr-comp-grid">
            <style>{`.wr-comp-grid{grid-template-columns:1fr;}@media(min-width:1024px){.wr-comp-grid{grid-template-columns:1fr 1.15fr;}}`}</style>

            {/* FORM */}
            <div className="wr-panel">
              <div className="wr-panel-header">
                <div className="wr-panel-title">
                  {mode === "create" ? "➕ Nuevo componente" : "✏️ Editar componente"}
                </div>
                {mode === "edit" && (
                  <button className="wr-btn wr-btn-ghost wr-btn-sm" onClick={reset}>
                    <XIcon /> Cancelar
                  </button>
                )}
              </div>

              <div style={{ padding: "18px 22px" }}>
                {msg && <div className="wr-msg">{msg}</div>}

                <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: msg ? 12 : 0 }}>
                  <div className="wr-grid-2">
                    <div>
                      <label className="wr-label">Tipo</label>
                      <select className="wr-select" value={form.type} onChange={e => setForm(s => ({ ...s, type: e.target.value }))}>
                        {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="wr-label">Estado</label>
                      <select className="wr-select" value={form.status} onChange={e => setForm(s => ({ ...s, status: e.target.value as Status }))}>
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                      </select>
                    </div>
                  </div>

                  <div className="wr-grid-2">
                    <div>
                      <label className="wr-label">Marca</label>
                      <input className="wr-input" placeholder="AMD, NVIDIA…" value={form.brand} onChange={e => setForm(s => ({ ...s, brand: e.target.value }))} />
                    </div>
                    <div>
                      <label className="wr-label">Modelo</label>
                      <input className="wr-input" placeholder="RTX 4090" value={form.model} onChange={e => setForm(s => ({ ...s, model: e.target.value }))} />
                    </div>
                  </div>

                  <div className="wr-grid-2">
                    <div>
                      <label className="wr-label">Precio ($)</label>
                      <input type="number" className="wr-input" value={form.price} onChange={e => setForm(s => ({ ...s, price: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <label className="wr-label">Stock</label>
                      <input type="number" className="wr-input" value={form.stock} onChange={e => setForm(s => ({ ...s, stock: Number(e.target.value) }))} />
                    </div>
                  </div>

                  <div>
                    <label className="wr-label">Características (JSON)</label>
                    <textarea className="wr-textarea" value={form.metaText} onChange={e => setForm(s => ({ ...s, metaText: e.target.value }))} placeholder={'{"socket":"AM4","vram":"8GB"}'} />
                  </div>

                  <div>
                    <label className="wr-label">Imagen principal</label>
                    <input type="file" accept="image/*" className="wr-file"
                      onChange={e => {
                        const file = e.target.files?.[0] ?? null;
                        setForm(s => ({ ...s, imageFile: file, imagePreview: file ? URL.createObjectURL(file) : s.imagePreview }));
                      }}
                    />
                    {form.imagePreview && (
                      <div className="img-preview"><img src={form.imagePreview} alt="preview" /></div>
                    )}
                  </div>

                  <div>
                    <label className="wr-label">Galería (múltiple)</label>
                    <input type="file" accept="image/*" multiple className="wr-file"
                      onChange={e => setForm(s => ({ ...s, galleryFiles: Array.from(e.target.files ?? []) }))}
                    />
                  </div>

                  <div className="wr-grid-2" style={{ marginTop: 4 }}>
                    <button type="submit" className="wr-btn wr-btn-primary" style={{ justifyContent: "center" }}>
                      <CheckIcon /> {mode === "create" ? "Crear componente" : "Guardar cambios"}
                    </button>
                    <button type="button" className="wr-btn wr-btn-ghost" style={{ justifyContent: "center" }} onClick={reset}>
                      <XIcon /> Limpiar
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* LIST */}
            <div className="wr-panel">
              <div className="wr-panel-header">
                <div className="wr-panel-title">Componentes ({filtered.length})</div>
                <button className="wr-btn wr-btn-ghost wr-btn-sm" onClick={load}>
                  <RefreshIcon /> {loading ? "Cargando…" : "Refrescar"}
                </button>
              </div>

              <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 8, maxHeight: 620, overflowY: "auto" }}>
                {filtered.length === 0 ? (
                  <div className="wr-empty">No hay componentes para mostrar.</div>
                ) : filtered.map(c => (
                  <div key={c.id} className={`comp-card ${form.id === c.id ? "editing" : ""}`}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <span className="comp-tag">{c.type}</span>
                          <span className={`comp-status ${c.status}`}>{c.status === "active" ? "Activo" : "Inactivo"}</span>
                          <span className="comp-price" style={{ marginLeft: "auto" }}>{money(c.price)}</span>
                        </div>
                        <p className="comp-name">{c.brand} {c.model}</p>

                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                          <span className="stock-badge">Stock: {Number(c.stock ?? 0)}</span>
                          <button className="wr-btn wr-btn-ghost wr-btn-sm" onClick={() => quickStock(c.id, +1)}>+1</button>
                          <button className="wr-btn wr-btn-ghost wr-btn-sm" onClick={() => quickStock(c.id, -1)}>-1</button>
                          <button className="wr-btn wr-btn-sm" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.22)", color: "rgba(196,181,253,0.9)", marginLeft: "auto" }}
                            onClick={() => toggleStatus(c.id, c.status)}>
                            {c.status === "active" ? "Desactivar" : "Activar"}
                          </button>
                        </div>

                        {c.imageUrl && (
                          <img src={`${API_BASE}${c.imageUrl}`} alt={`${c.brand} ${c.model}`}
                            style={{ marginTop: 10, height: 80, width: "100%", objectFit: "cover", borderRadius: 10, border: "1px solid rgba(255,255,255,0.07)" }}
                          />
                        )}
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                        <button className="wr-btn wr-btn-ghost wr-btn-sm" onClick={() => onEdit(c)}>
                          <EditIcon /> Editar
                        </button>
                        <button className="wr-btn wr-btn-danger wr-btn-sm" onClick={() => onDelete(c.id)}>
                          <TrashIcon /> Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {activeTab === "orders" && (
          <div className="wr-panel">
            <div className="wr-panel-header">
              <div className="wr-panel-title">Pedidos y pagos</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                {(["ALL", "PENDING_PAYMENT", "PAID", "REJECTED", "CANCELLED"] as const).map(f => (
                  <button key={f} className={`filter-pill ${orderFilter === f ? "active" : ""}`} onClick={() => setOrderFilter(f)}>
                    {f === "ALL" ? "Todos" : ORDER_LABELS[f]}
                  </button>
                ))}
                <button className="wr-btn wr-btn-ghost wr-btn-sm" onClick={loadOrders}>
                  <RefreshIcon /> {ordersLoading ? "…" : ""}
                </button>
              </div>
            </div>

            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
              {filteredOrders.length === 0 ? (
                <div className="wr-empty">No hay pedidos para mostrar.</div>
              ) : filteredOrders.map(order => {
                const badge = orderBadgeStyle(order.status);
                return (
                  <div key={order.id} className="order-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                      <div>
                        <p className="order-num">#{order.orderNumber || order.id.slice(0, 8)}</p>
                        <p className="order-meta">{order.user?.name || "—"} · {order.user?.email || "—"}</p>
                        <p className="order-meta">{new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ borderRadius: 10, border: `1px solid ${badge.border}`, background: badge.bg, color: badge.text, padding: "4px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                          {ORDER_LABELS[order.status]}
                        </span>
                        <p className="order-total" style={{ marginTop: 8, color: "rgba(196,181,253,0.9)" }}>{money(order.total)}</p>
                      </div>
                    </div>

                    <div style={{ display: "grid", gap: 10, marginTop: 14 }} className="wr-order-data">
                      <style>{`.wr-order-data{grid-template-columns:1fr;}@media(min-width:640px){.wr-order-data{grid-template-columns:1fr 1fr;}}`}</style>

                      <div className="data-box">
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          {[["Banco", order.payment?.bank], ["Método", order.payment?.method], ["Referencia", order.payment?.reference], ["Titular", order.payment?.holderName]].map(([label, val]) => (
                            <div key={label as string}>
                              <div className="data-label">{label}</div>
                              <div className="data-val">{val || "—"}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="data-box">
                        <div className="data-label">Notas</div>
                        <div className="data-val" style={{ marginBottom: 12 }}>{order.notes || "Sin notas."}</div>
                        {order.payment?.receiptUrl ? (
                          <a href={`${API_BASE}${order.payment.receiptUrl}`} target="_blank" rel="noreferrer"
                            className="wr-btn wr-btn-ghost wr-btn-sm" style={{ textDecoration: "none", display: "inline-flex" }}>
                            <ReceiptIcon /> Ver comprobante
                          </a>
                        ) : (
                          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Sin comprobante.</span>
                        )}
                      </div>
                    </div>

                    {order.items?.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
                        {order.items.map((it: any) => (
                          <div key={it.id} className="order-item-row">
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 600 }}>{it.brand} {it.model}</p>
                              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{it.type}</p>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{it.qty} × {money(it.price)}</p>
                              <p style={{ fontSize: 13, fontWeight: 700, color: "rgba(196,181,253,0.85)" }}>{money(it.qty * it.price)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                      <button className="wr-btn wr-btn-ghost wr-btn-sm" onClick={() => void generateInvoice(order)}>
                        <ReceiptIcon /> Generar factura
                      </button>
                      <button className="wr-btn wr-btn-success wr-btn-sm" onClick={() => changeOrderStatus(order.id, "PAID")}>
                        <CheckIcon /> Aprobar pago
                      </button>
                      <button className="wr-btn wr-btn-danger wr-btn-sm" onClick={() => changeOrderStatus(order.id, "REJECTED")}>
                        <XIcon /> Rechazar
                      </button>
                      <button className="wr-btn wr-btn-warn wr-btn-sm" onClick={() => changeOrderStatus(order.id, "CANCELLED")}>
                        Cancelar pedido
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
