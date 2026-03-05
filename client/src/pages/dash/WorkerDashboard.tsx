import { useEffect, useMemo, useState } from "react";
import { Layout } from "../../components/Layout";
import {
  fetchComponents,
  createComponent,
  updateComponent,
  deleteComponent,
  adminExportCSV,
  updateComponentStock,
  updateComponentStatus,
  API_BASE,
} from "../../lib/api";

const TYPES = ["CPU", "GPU", "RAM", "SSD", "PSU", "MOBO", "CASE"] as const;
type Status = "active" | "inactive";

type FormState = {
  id?: string;
  type: string;
  brand: string;
  model: string;
  price: number;
  scoreGaming: number;
  scoreWork: number;
  watt?: number | null;

  stock: number;
  status: Status;

  metaText: string;

  imageFile?: File | null;
  imagePreview?: string | null;

  // ⭐ galería (Opción B)
  galleryFiles?: File[];
};

const emptyForm: FormState = {
  type: "CPU",
  brand: "",
  model: "",
  price: 0,
  scoreGaming: 0,
  scoreWork: 0,
  watt: null,
  stock: 0,
  status: "active",
  metaText: "",
  imageFile: null,
  imagePreview: null,
  galleryFiles: [],
};

function authHeaders() {
  const token = localStorage.getItem("dg_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function uploadComponentGallery(componentId: string, files: File[]) {
  const fd = new FormData();
  for (const f of files) fd.append("images", f);

  const r = await fetch(`${API_BASE}/api/components/${componentId}/images`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: fd,
  });

  const text = await r.text();
  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, message: text || "Respuesta no-JSON del server" };
  }
}

export function WorkerDashboard() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const [form, setForm] = useState<FormState>(emptyForm);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const data = await fetchComponents(typeFilter === "ALL" ? undefined : typeFilter);
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter((x) => `${x.type} ${x.brand} ${x.model}`.toLowerCase().includes(t));
  }, [items, q]);

  function onEdit(c: any) {
    setMode("edit");
    setForm({
      id: c.id,
      type: c.type,
      brand: c.brand ?? "",
      model: c.model ?? "",
      price: Number(c.price ?? 0),
      scoreGaming: Number(c.scoreGaming ?? 0),
      scoreWork: Number(c.scoreWork ?? 0),
      watt: c.watt ?? null,
      stock: Number(c.stock ?? 0),
      status: c.status === "inactive" ? "inactive" : "active",
      metaText: c.meta ? JSON.stringify(c.meta, null, 2) : "",
      imageFile: null,
      imagePreview: c.imageUrl ? `${API_BASE}${c.imageUrl}` : null,
      galleryFiles: [],
    });
    setMsg(null);
  }

  function reset() {
    setMode("create");
    setForm(emptyForm);
    setMsg(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    let metaObj: any | undefined = undefined;
    const metaRaw = form.metaText.trim();
    if (metaRaw) {
      try {
        metaObj = JSON.parse(metaRaw);
      } catch {
        setMsg('❌ Características: JSON inválido. Ej: {"socket":"AM4"}');
        return;
      }
    }

    try {
      const fd = new FormData();
      fd.append("type", form.type);
      fd.append("brand", form.brand.trim());
      fd.append("model", form.model.trim());
      fd.append("price", String(Number(form.price)));
      fd.append("scoreGaming", String(Number(form.scoreGaming)));
      fd.append("scoreWork", String(Number(form.scoreWork)));
      if (form.watt !== null && form.watt !== undefined) fd.append("watt", String(Number(form.watt)));

      fd.append("stock", String(Number(form.stock ?? 0)));
      fd.append("status", form.status);

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

      // ⭐ subir galería
      if (savedId && form.galleryFiles && form.galleryFiles.length > 0) {
        const gr = await uploadComponentGallery(savedId, form.galleryFiles);
        if (gr?.ok === false) {
          setMsg((m) =>
            `${m ?? "✅ Guardado."}\n⚠️ Galería no subida: ${gr.message || "revisa ruta /api/components/:id/images"}`
          );
        } else {
          setMsg((m) => `${m ?? "✅ Guardado."}\n🖼️ Galería subida (${form.galleryFiles.length})`);
        }
      }

      reset();
      await load();
    } catch (err: any) {
      setMsg(`❌ ${err.message || "Error"}`);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("¿Seguro que deseas eliminar este componente?")) return;
    setMsg(null);
    try {
      const r = await deleteComponent(id);
      if (r?.ok === false) throw new Error(r.message || "No se pudo eliminar");
      setMsg("🗑️ Componente eliminado");
      await load();
    } catch (e: any) {
      setMsg(`❌ ${e.message || "Error"}`);
    }
  }

  async function quickStock(id: string, delta: number) {
    try {
      await updateComponentStock(id, delta);
      await load();
    } catch {
      // ignore
    }
  }

  async function toggleStatus(id: string, next: Status) {
    try {
      await updateComponentStatus(id, next);
      await load();
    } catch {
      // ignore
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Worker • Dashboard</h2>
              <p className="text-sm text-white/60">Gestiona componentes y stock (sin herramientas admin).</p>
            </div>

            <div className="flex gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
              >
                <option value="ALL">ALL</option>
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar..."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-diamond-300/40 sm:w-[260px]"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          {/* FORM */}
          <div className="rounded-3xl border border-white/10 bg-ink-900/60 p-6">
            <h3 className="text-lg font-semibold">{mode === "create" ? "Crear componente" : "Editar componente"}</h3>

            {msg && (
              <pre className="mt-3 whitespace-pre-wrap rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/80">
                {msg}
              </pre>
            )}

            <form onSubmit={onSubmit} className="mt-4 grid gap-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-white/60">Tipo</label>
                  <select
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none"
                    value={form.type}
                    onChange={(e) => setForm((s) => ({ ...s, type: e.target.value }))}
                  >
                    {TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/60">Estado</label>
                  <select
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none"
                    value={form.status}
                    onChange={(e) => setForm((s) => ({ ...s, status: e.target.value as Status }))}
                  >
                    <option value="active">active</option>
                    <option value="inactive">inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-white/60">Marca</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none"
                    value={form.brand}
                    onChange={(e) => setForm((s) => ({ ...s, brand: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60">Modelo</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none"
                    value={form.model}
                    onChange={(e) => setForm((s) => ({ ...s, model: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-white/60">Precio</label>
                  <input
                    type="number"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none"
                    value={form.price}
                    onChange={(e) => setForm((s) => ({ ...s, price: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60">Stock</label>
                  <input
                    type="number"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none"
                    value={form.stock}
                    onChange={(e) => setForm((s) => ({ ...s, stock: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-white/60">Gaming</label>
                  <input
                    type="number"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none"
                    value={form.scoreGaming}
                    onChange={(e) => setForm((s) => ({ ...s, scoreGaming: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60">Work</label>
                  <input
                    type="number"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none"
                    value={form.scoreWork}
                    onChange={(e) => setForm((s) => ({ ...s, scoreWork: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60">Watt</label>
                  <input
                    type="number"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none"
                    value={form.watt ?? ""}
                    onChange={(e) => setForm((s) => ({ ...s, watt: e.target.value === "" ? null : Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/60">Características (JSON)</label>
                <textarea
                  className="mt-1 min-h-[110px] w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs outline-none focus:border-diamond-300/40"
                  value={form.metaText}
                  onChange={(e) => setForm((s) => ({ ...s, metaText: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-xs text-white/60">Imagen principal</label>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setForm((s) => ({
                      ...s,
                      imageFile: file,
                      imagePreview: file ? URL.createObjectURL(file) : s.imagePreview,
                    }));
                  }}
                />
                {form.imagePreview && (
                  <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                    <img src={form.imagePreview} alt="preview" className="h-40 w-full object-cover" />
                  </div>
                )}
              </div>

              {/* ⭐ GALERÍA */}
              <div>
                <label className="text-xs text-white/60">Galería (varias imágenes)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    setForm((s) => ({ ...s, galleryFiles: files }));
                  }}
                />
                <p className="mt-1 text-xs text-white/50">
                  POST /api/components/:id/images (si no existe aún, te avisará).
                </p>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <button className="rounded-xl bg-gradient-to-r from-diamond-400 to-diamond-600 px-4 py-2 font-semibold shadow-glow">
                  {mode === "create" ? "Crear" : "Guardar cambios"}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white/80 hover:bg-white/10"
                >
                  Limpiar
                </button>
              </div>

              <button
                type="button"
                onClick={async () => {
                  const blob = await adminExportCSV();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "diamond-grid-components.csv";
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(url);
                }}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white/80 hover:bg-white/10"
              >
                Export CSV
              </button>
            </form>
          </div>

          {/* LIST */}
          <div className="rounded-3xl border border-white/10 bg-ink-900/60 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Componentes</h3>
              <button
                onClick={load}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
              >
                {loading ? "Cargando..." : "Refrescar"}
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {filtered.map((c) => (
                <div key={c.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-full">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full border border-diamond-300/20 bg-diamond-500/10 px-3 py-1 text-xs text-white/80">
                          {c.type}
                        </span>
                        <span className="text-sm font-semibold text-diamond-200">
                          ${Number(c.price).toFixed(2)}
                        </span>

                        <span
                          className={[
                            "ml-auto rounded-full px-3 py-1 text-xs border",
                            c.status === "inactive"
                              ? "border-red-400/20 bg-red-500/10 text-red-200"
                              : "border-emerald-400/20 bg-emerald-500/10 text-emerald-200",
                          ].join(" ")}
                        >
                          {c.status === "inactive" ? "Inactivo" : "Activo"}
                        </span>
                      </div>

                      <p className="mt-2 font-semibold">{c.brand} {c.model}</p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                          Stock: <span className="text-white">{Number(c.stock ?? 0)}</span>
                        </span>

                        <button
                          onClick={() => quickStock(c.id, +1)}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 hover:bg-white/10"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => quickStock(c.id, -1)}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 hover:bg-white/10"
                        >
                          -1
                        </button>

                        <button
                          onClick={() => toggleStatus(c.id, c.status === "inactive" ? "inactive" : "active")}
                          className="rounded-xl border border-diamond-300/20 bg-diamond-500/10 px-3 py-1 text-xs text-white/90 hover:bg-diamond-500/20"
                        >
                          Cambiar estado
                        </button>
                      </div>

                      {c.imageUrl && (
                        <img
                          src={`${API_BASE}${c.imageUrl}`}
                          alt={`${c.brand} ${c.model}`}
                          className="mt-3 h-28 w-full rounded-2xl object-cover border border-white/10"
                        />
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => onEdit(c)}
                        className="rounded-xl border border-diamond-300/20 bg-diamond-500/10 px-3 py-2 text-sm text-white/90 hover:bg-diamond-500/20"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onDelete(c.id)}
                        className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200 hover:bg-red-500/20"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                  No hay componentes para mostrar.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}