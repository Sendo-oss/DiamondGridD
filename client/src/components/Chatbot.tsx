import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE, recommendBuild } from "../lib/api";
import { useCart } from "../app/cart";

type Purpose = "gaming" | "office" | "design" | "programming";
type Msg = { from: "bot" | "user"; text: string };

function money(n: any) {
  const x = Number(n ?? 0);
  return `$${x.toFixed(2)}`;
}

export function Chatbot() {
  const nav = useNavigate();
  const cart = useCart();

  const [open, setOpen] = useState(true);
  const [budget, setBudget] = useState(700);
  const [purpose, setPurpose] = useState<Purpose>("gaming");
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      from: "bot",
      text: "Hola 👋 Soy DiamondBot. Dime tu presupuesto y para qué usarás la PC, y te recomiendo componentes.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  // Persistencia del chat (opcional)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("dg_chatbot");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.budget) setBudget(parsed.budget);
      if (parsed?.purpose) setPurpose(parsed.purpose);
      if (Array.isArray(parsed?.msgs) && parsed.msgs.length) setMsgs(parsed.msgs);
      if (parsed?.result) setResult(parsed.result);
      if (typeof parsed?.open === "boolean") setOpen(parsed.open);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "dg_chatbot",
        JSON.stringify({ open, budget, purpose, msgs, result })
      );
    } catch {
      // ignore
    }
  }, [open, budget, purpose, msgs, result]);

  const prompt = useMemo(
    () => `Presupuesto: ${money(budget)} • Uso: ${purpose}`,
    [budget, purpose]
  );

  async function handleRecommend() {
    setErr(null);
    setLoading(true);
    setMsgs((m) => [...m, { from: "user", text: prompt }]);

    try {
      const data = await recommendBuild({ budget: Number(budget), purpose });
      setResult(data);
      setMsgs((m) => [
        ...m,
        { from: "bot", text: data.message ?? "Aquí está tu recomendación." },
      ]);
    } catch (e: any) {
      setErr("No pude conectar con el backend. Revisa que esté corriendo en http://localhost:4000");
      setMsgs((m) => [
        ...m,
        { from: "bot", text: "Ups… no pude conectar con el servidor 😕" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function addAllToCart() {
    if (!result?.parts) return;

    const parts = result.parts;
    const list = [parts.cpu, parts.gpu, parts.ram, parts.ssd, parts.psu].filter(Boolean);

    list.forEach((p: any) => {
      cart.add(
        {
          id: p.id,
          type: p.type,
          brand: p.brand,
          model: p.model,
          price: Number(p.price ?? 0),
          imageUrl: p.imageUrl ?? null,
        },
        1
      );
    });

    setMsgs((m) => [...m, { from: "bot", text: "✅ Listo. Agregué la recomendación al carrito." }]);
  }

  function resetChat() {
    setErr(null);
    setResult(null);
    setMsgs([
      {
        from: "bot",
        text: "Listo 👌 Dime tu presupuesto y el uso, y te recomiendo componentes.",
      },
    ]);
  }

  const canRecommend = Number(budget) >= 100 && !loading;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] w-[360px] max-w-[calc(100vw-48px)] pointer-events-auto">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-900/70 backdrop-blur-xl shadow-2xl pointer-events-auto">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-diamond-300 to-diamond-600 shadow-glow" />
            <div>
              <p className="text-sm font-semibold">DiamondBot</p>
              <p className="text-xs text-white/60">Recomendador de componentes</p>
            </div>
          </div>
          <span className="text-white/60">{open ? "—" : "+"}</span>
        </button>

        {open && (
          <div className="border-t border-white/10">
            <div className="max-h-[240px] space-y-2 overflow-auto px-4 py-3">
              {msgs.map((m, i) => (
                <div
                  key={i}
                  className={[
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                    m.from === "bot"
                      ? "bg-white/5 text-white/90"
                      : "ml-auto bg-diamond-500/20 text-white border border-diamond-300/20",
                  ].join(" ")}
                >
                  {m.text}
                </div>
              ))}

              {err && (
                <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {err}
                </div>
              )}
            </div>

            <div className="grid gap-3 px-4 pb-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-white/60">Presupuesto ($)</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-diamond-300/40"
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    min={0}
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60">Uso</label>
                  <select
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-diamond-300/40"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value as Purpose)}
                  >
                    <option value="gaming">Gaming</option>
                    <option value="office">Ofimática</option>
                    <option value="design">Diseño</option>
                    <option value="programming">Programación</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleRecommend}
                disabled={!canRecommend}
                className="rounded-xl bg-gradient-to-r from-diamond-400 to-diamond-600 px-4 py-2 font-semibold shadow-glow disabled:opacity-60"
              >
                {loading ? "Recomendando..." : "Recomendar componentes"}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={resetChat}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
                >
                  Reiniciar
                </button>
                <button
                  onClick={() => nav("/cart")}
                  className="rounded-xl border border-diamond-300/20 bg-diamond-500/10 px-4 py-2 text-sm text-white/90 hover:bg-diamond-500/20"
                >
                  Ver carrito ({cart.count})
                </button>
              </div>

              {result?.parts && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white/90">Selección</p>
                    <p className="text-white/70">Total: <span className="text-white">{money(result.total)}</span></p>
                  </div>

                  <div className="mt-3 grid gap-2">
                    {(["cpu","gpu","ram","ssd","psu"] as const).map((k) => {
                      const p = result.parts?.[k];
                      if (!p) return null;
                      const img = p.imageUrl ? `${API_BASE}${p.imageUrl}` : null;
                      return (
                        <div key={k} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-ink-950/40 p-3">
                          <div className="h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                            {img ? (
                              <img src={img} alt={`${p.brand} ${p.model}`} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs uppercase text-white/60">{k}</p>
                            <p className="truncate font-semibold">{p.brand} {p.model}</p>
                          </div>
                          <p className="text-sm text-diamond-200">{money(p.price)}</p>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={addAllToCart}
                    className="mt-3 w-full rounded-xl bg-gradient-to-r from-diamond-400 to-diamond-600 px-4 py-2 font-semibold shadow-glow"
                  >
                    Agregar todo al carrito
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}