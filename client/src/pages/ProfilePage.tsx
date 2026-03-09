import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { fetchMe, updateMe, uploadAvatar, API_BASE, fetchMyOrders } from "../lib/api";
import { useAuth } from "../app/auth";

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

function statusClass(status: string) {
  switch (status) {
    case "PAID":
      return "border-emerald-400/20 bg-emerald-500/10 text-emerald-200";
    case "REJECTED":
      return "border-red-400/20 bg-red-500/10 text-red-200";
    case "CANCELLED":
      return "border-orange-400/20 bg-orange-500/10 text-orange-200";
    default:
      return "border-yellow-400/20 bg-yellow-500/10 text-yellow-200";
  }
}

export default function ProfilePage() {
  const { user: authUser, token, login } = useAuth();

  const [me, setMe] = useState<Me | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

        const [meRes, ordersRes] = await Promise.all([
          fetchMe(),
          fetchMyOrders(),
        ]);

        const u = meRes.user;
        setMe(u);
        setForm({
          name: u?.name || authUser?.name || "",
          nickname: u?.nickname || "",
          phone: u?.phone || "",
          bio: u?.bio || "",
        });

        setOrders(Array.isArray(ordersRes?.orders) ? ordersRes.orders : []);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, [authUser?.name]);

  async function onSave() {
    try {
      setSaving(true);
      const updated = await updateMe(form);
      setMe(updated.user);

      if (token) login({ user: updated.user, token });
      alert("✅ Perfil actualizado");
    } finally {
      setSaving(false);
    }
  }

  async function onPickAvatar(file: File | null) {
    if (!file) return;
    const updated = await uploadAvatar(file);
    setMe(updated.user);

    if (token) login({ user: updated.user, token });
    alert("✅ Foto actualizada");
  }

  const role = me?.role || authUser?.role || "user";

  return (
    <Layout>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
          {/* PERFIL */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <h2 className="text-2xl font-semibold">Mi perfil</h2>
            {loading ? <p className="mt-3 text-sm text-white/60">Cargando...</p> : null}

            <div className="mt-6 flex items-center gap-4">
              {me?.avatarUrl ? (
                <img
                  src={`${API_BASE}${me.avatarUrl}`}
                  className="h-24 w-24 rounded-3xl border border-white/10 object-cover"
                  alt="avatar"
                />
              ) : (
                <div className="grid h-24 w-24 place-items-center rounded-3xl border border-white/10 bg-white/5 text-3xl font-bold">
                  {(form.nickname?.[0] || form.name?.[0] || "U").toUpperCase()}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="w-fit cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10">
                  Cambiar foto
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onPickAvatar(e.target.files?.[0] || null)}
                  />
                </label>

                <div className="text-sm text-white/70">
                  Rol: <span className="font-semibold text-white">{role}</span>
                </div>
                <div className="text-sm text-white/70">
                  Email: <span className="font-semibold text-white">{me?.email || authUser?.email}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <Field label="Nombre" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} />
              <Field label="Apodo" value={form.nickname} onChange={(v) => setForm((p) => ({ ...p, nickname: v.replace("@", "") }))} />
              <Field label="Teléfono" value={form.phone} onChange={(v) => setForm((p) => ({ ...p, phone: v }))} />

              <div>
                <label className="text-sm text-white/60">Bio</label>
                <textarea
                  className="mt-2 w-full rounded-xl border border-white/10 bg-ink-950/60 px-3 py-2 text-white outline-none"
                  rows={4}
                  value={form.bio}
                  onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                />
              </div>

              <button
                onClick={onSave}
                disabled={saving}
                className="rounded-xl bg-gradient-to-r from-diamond-400 to-diamond-600 px-4 py-3 font-semibold shadow-glow disabled:opacity-60"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>

          {/* PEDIDOS */}
          <div className="rounded-3xl border border-white/10 bg-ink-900/60 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Mis pedidos</h2>
              <span className="text-sm text-white/60">{orders.length} pedido(s)</span>
            </div>

            <div className="mt-5 space-y-4">
              {orders.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/70">
                  Aún no tienes pedidos registrados.
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm text-white/50">Pedido</p>
                        <p className="text-lg font-semibold text-diamond-200">
                          {order.orderNumber || order.id}
                        </p>
                        <p className="mt-1 text-sm text-white/60">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${statusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-2">
                      {order.items?.map((it: any) => (
                        <div
                          key={it.id}
                          className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-3 py-2"
                        >
                          <div>
                            <p className="font-semibold">
                              {it.brand} {it.model}
                            </p>
                            <p className="text-xs text-white/60">{it.type}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-white/70">{it.qty} × {money(it.price)}</p>
                            <p className="font-semibold text-diamond-200">{money(it.qty * it.price)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                        <p className="text-xs text-white/60">Banco</p>
                        <p className="font-semibold">{order.payment?.bank || "—"}</p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                        <p className="text-xs text-white/60">Total</p>
                        <p className="font-semibold text-diamond-200">{money(order.total)}</p>
                      </div>
                    </div>

                    {order.payment?.receiptUrl && (
                      <a
                        href={`${API_BASE}${order.payment.receiptUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
                      >
                        Ver comprobante
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-sm text-white/60">{label}</label>
      <input
        className="mt-2 w-full rounded-xl border border-white/10 bg-ink-950/60 px-3 py-2 text-white outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}