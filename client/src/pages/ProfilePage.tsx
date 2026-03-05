import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { fetchMe, updateMe, uploadAvatar, API_BASE } from "../lib/api";
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

export default function ProfilePage() {
    const { user: authUser, token, login } = useAuth();

    const [me, setMe] = useState<Me | null>(null);
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
                const data = await fetchMe(); // { ok, user }
                const u = data.user;
                setMe(u);
                setForm({
                    name: u?.name || authUser?.name || "",
                    nickname: u?.nickname || "",
                    phone: u?.phone || "",
                    bio: u?.bio || "",
                });
            } catch (e) {
                // si /api/me no existe todavía, no revienta la UI
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
        } finally {
            setSaving(false);
        }
    }

    async function onPickAvatar(file: File | null) {
        if (!file) return;
        const updated = await uploadAvatar(file); // { ok, user }
        setMe(updated.user);

        if (token) login({ user: updated.user, token });
    }
    const role = me?.role || authUser?.role || "user";

    return (
        <Layout>
            <div className="mx-auto max-w-xl">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                    <h2 className="text-xl font-semibold">Mi perfil</h2>

                    {loading ? <p className="mt-3 text-sm text-white/60">Cargando...</p> : null}

                    <div className="mt-6 flex items-center gap-4">
                        {me?.avatarUrl ? (
                            <img
                                src={`${API_BASE}${me.avatarUrl}`}
                                className="h-20 w-20 rounded-2xl object-cover border border-white/10"
                                alt="avatar"
                            />
                        ) : (
                            <div className="grid h-20 w-20 place-items-center rounded-2xl border border-white/10 bg-white/5 text-2xl font-bold">
                                {(form.nickname?.[0] || form.name?.[0] || "U").toUpperCase()}
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <label className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10 w-fit">
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
                            className="rounded-xl bg-gradient-to-r from-diamond-400 to-diamond-600 px-4 py-2 font-semibold shadow-glow disabled:opacity-60"
                        >
                            {saving ? "Guardando..." : "Guardar"}
                        </button>
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