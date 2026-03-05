import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE, recommendBuild } from "../lib/api";
import { useCart } from "../app/cart";

type Purpose = "gaming" | "office" | "design" | "programming";
type Preference = "balanced" | "performance" | "cheap";

type Option = {
  label: string;
  action: string;
  icon?: string;
};

type Msg = {
  id: string;
  from: "bot" | "user";
  text?: string;
  time?: string;
  options?: Option[];
  tone?: "normal" | "error" | "success";
};

function nowTime() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function money(n: any) {
  const x = Number(n ?? 0);
  if (!Number.isFinite(x)) return "$0.00";
  return `$${x.toFixed(2)}`;
}

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function purposeLabel(p: Purpose) {
  switch (p) {
    case "gaming":
      return "Gaming 🎮";
    case "office":
      return "Ofimática 💼";
    case "design":
      return "Diseño 🎨";
    case "programming":
      return "Programación 💻";
  }
}

function prefLabel(p: Preference) {
  switch (p) {
    case "balanced":
      return "Equilibrado ⚖️";
    case "performance":
      return "Más rendimiento 🚀";
    case "cheap":
      return "Más barato 💸";
  }
}

type FlowStep =
  | "WELCOME"
  | "ASK_PURPOSE"
  | "ASK_BUDGET"
  | "ASK_PREFERENCE"
  | "CONFIRM"
  | "RESULT";

const STORAGE_KEY = "dg_chatbot_v2";

export function Chatbot() {
  const nav = useNavigate();
  const cart = useCart();

  const [open, setOpen] = useState(true);

  // “estado” del flujo
  const [step, setStep] = useState<FlowStep>("WELCOME");
  const [budget, setBudget] = useState<number>(700);
  const [purpose, setPurpose] = useState<Purpose>("gaming");
  const [preference, setPreference] = useState<Preference>("balanced");

  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const endRef = useRef<HTMLDivElement | null>(null);

  // ---------- persistencia ----------
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        seedWelcome();
        return;
      }
      const parsed = JSON.parse(raw);
      if (typeof parsed?.open === "boolean") setOpen(parsed.open);
      if (parsed?.step) setStep(parsed.step);
      if (typeof parsed?.budget === "number") setBudget(parsed.budget);
      if (parsed?.purpose) setPurpose(parsed.purpose);
      if (parsed?.preference) setPreference(parsed.preference);
      if (Array.isArray(parsed?.msgs) && parsed.msgs.length) setMsgs(parsed.msgs);
      if (parsed?.result) setResult(parsed.result);

      // si quedó vacío por cualquier cosa
      if (!Array.isArray(parsed?.msgs) || parsed.msgs.length === 0) seedWelcome();
    } catch {
      seedWelcome();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ open, step, budget, purpose, preference, msgs, result })
      );
    } catch {
      // ignore
    }
  }, [open, step, budget, purpose, preference, msgs, result]);

  // ---------- autoscroll ----------
  useEffect(() => {
    if (!open) return;
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing, open, result]);

  // ---------- helpers ----------
  const summary = useMemo(() => {
    return `Uso: ${purposeLabel(purpose)} • Presupuesto: ${money(budget)} • Preferencia: ${prefLabel(preference)}`;
  }, [purpose, budget, preference]);

  function pushBot(text: string, options?: Option[], tone: Msg["tone"] = "normal") {
    setMsgs((m) => [
      ...m,
      {
        id: uid(),
        from: "bot",
        text,
        options,
        time: nowTime(),
        tone,
      },
    ]);
  }

  function pushUser(text: string) {
    setMsgs((m) => [
      ...m,
      { id: uid(), from: "user", text, time: nowTime(), tone: "normal" },
    ]);
  }

  function botTyping(ms = 550) {
    setTyping(true);
    setTimeout(() => setTyping(false), ms);
  }

  function seedWelcome() {
    const t = nowTime();
    setMsgs([
      {
        id: uid(),
        from: "bot",
        time: t,
        text: "Hola 👋 Soy DiamondBot. Te ayudo a armar una PC según tu presupuesto.",
      },
      {
        id: uid(),
        from: "bot",
        time: t,
        text: "¿En qué la vas a usar?",
        options: [
          { label: "Gaming 🎮", action: "PURPOSE:gaming" },
          { label: "Ofimática 💼", action: "PURPOSE:office" },
          { label: "Diseño 🎨", action: "PURPOSE:design" },
          { label: "Programación 💻", action: "PURPOSE:programming" },
        ],
      },
    ]);
    setStep("ASK_PURPOSE");
    setResult(null);
    setBudget(700);
    setPurpose("gaming");
    setPreference("balanced");
  }

  function resetAll() {
    setLoading(false);
    setResult(null);
    setStep("WELCOME");
    seedWelcome();
  }

  // ---------- acciones de opciones ----------
  async function onOption(action: string) {
    // bloqueo durante loading para evitar dobles clicks
    if (loading) return;

    // “atajos” globales
    if (action === "RESET") {
      pushUser("Reiniciar");
      botTyping();
      resetAll();
      return;
    }
    if (action === "OPEN_CART") {
      pushUser("Ver carrito");
      nav("/cart");
      return;
    }
    if (action === "ADD_ALL") {
      pushUser("Agregar todo al carrito");
      addAllToCart();
      return;
    }
    if (action === "GO_CHECKOUT") {
      pushUser("Ir a pagar");
      nav("/checkout");
      return;
    }

    // parse acción tipo "PURPOSE:gaming"
    const [kind, value] = action.split(":");

    if (kind === "PURPOSE") {
      const p = value as Purpose;
      setPurpose(p);
      pushUser(purposeLabel(p));
      botTyping();

      setStep("ASK_BUDGET");
      pushBot("Perfecto ✅ ¿Cuál es tu presupuesto aproximado?", [
        { label: "$500", action: "BUDGET:500" },
        { label: "$700", action: "BUDGET:700" },
        { label: "$900", action: "BUDGET:900" },
        { label: "$1200", action: "BUDGET:1200" },
        { label: "Otro ✍️", action: "BUDGET:OTHER" },
      ]);
      return;
    }

    if (kind === "BUDGET") {
      if (value === "OTHER") {
        pushUser("Otro presupuesto");
        botTyping();
        pushBot(
          "Escríbeme un número (ej: 850).",
          undefined
        );
        // aquí dejamos el input “manual” habilitado
        setStep("ASK_BUDGET");
        return;
      }

      const b = Number(value);
      setBudget(b);
      pushUser(money(b));
      botTyping();

      setStep("ASK_PREFERENCE");
      pushBot("¿Qué prefieres priorizar?", [
        { label: "Equilibrado ⚖️", action: "PREF:balanced" },
        { label: "Rendimiento 🚀", action: "PREF:performance" },
        { label: "Más barato 💸", action: "PREF:cheap" },
      ]);
      return;
    }

    if (kind === "PREF") {
      const pref = value as Preference;
      setPreference(pref);
      pushUser(prefLabel(pref));
      botTyping();

      setStep("CONFIRM");
      pushBot(`Listo. Confirmo tus datos:\n${summary}`, [
        { label: "✅ Confirmar", action: "CONFIRM:YES" },
        { label: "Cambiar uso", action: "CONFIRM:CHANGE_PURPOSE" },
        { label: "Cambiar presupuesto", action: "CONFIRM:CHANGE_BUDGET" },
        { label: "Reiniciar", action: "RESET" },
      ]);
      return;
    }

    if (kind === "CONFIRM") {
      if (value === "YES") {
        pushUser("Confirmar");
        botTyping(450);
        await handleRecommend();
        return;
      }
      if (value === "CHANGE_PURPOSE") {
        pushUser("Cambiar uso");
        botTyping();
        setStep("ASK_PURPOSE");
        pushBot("Claro. ¿En qué la vas a usar?", [
          { label: "Gaming 🎮", action: "PURPOSE:gaming" },
          { label: "Ofimática 💼", action: "PURPOSE:office" },
          { label: "Diseño 🎨", action: "PURPOSE:design" },
          { label: "Programación 💻", action: "PURPOSE:programming" },
        ]);
        return;
      }
      if (value === "CHANGE_BUDGET") {
        pushUser("Cambiar presupuesto");
        botTyping();
        setStep("ASK_BUDGET");
        pushBot("Dime tu presupuesto:", [
          { label: "$500", action: "BUDGET:500" },
          { label: "$700", action: "BUDGET:700" },
          { label: "$900", action: "BUDGET:900" },
          { label: "$1200", action: "BUDGET:1200" },
          { label: "Otro ✍️", action: "BUDGET:OTHER" },
        ]);
        return;
      }
    }
  }

  // ---------- input manual (presupuesto “otro”) ----------
  const [manual, setManual] = useState("");

  function canSendManual() {
    const n = Number(manual);
    return Number.isFinite(n) && n >= 100 && n <= 20000 && !loading && open;
  }

  async function sendManual() {
    const n = Number(manual);
    if (!Number.isFinite(n)) return;
    setManual("");
    setBudget(n);
    pushUser(money(n));
    botTyping();

    setStep("ASK_PREFERENCE");
    pushBot("¿Qué prefieres priorizar?", [
      { label: "Equilibrado ⚖️", action: "PREF:balanced" },
      { label: "Rendimiento 🚀", action: "PREF:performance" },
      { label: "Más barato 💸", action: "PREF:cheap" },
    ]);
  }

  // ---------- recommend ----------
  async function handleRecommend() {
    const b = Number(budget);
    if (!Number.isFinite(b) || b < 100) {
      pushBot("Tu presupuesto debe ser al menos $100.", undefined, "error");
      setStep("ASK_BUDGET");
      return;
    }

    setLoading(true);
    setResult(null);
    setStep("RESULT");

    // “thinking”
    setTyping(true);

    try {
      const data = await recommendBuild({
        budget: b,
        purpose,
        preference,
      } as any);

      setResult(data);
      setTyping(false);

      pushBot(data.message ?? "Aquí está tu recomendación ✅", undefined, "success");

      // resumen corto
      const parts = data?.parts || {};
      const lines = [
        parts.cpu ? `CPU: ${parts.cpu.brand} ${parts.cpu.model}` : null,
        parts.gpu ? `GPU: ${parts.gpu.brand} ${parts.gpu.model}` : null,
        parts.ram ? `RAM: ${parts.ram.brand} ${parts.ram.model}` : null,
        parts.ssd ? `SSD: ${parts.ssd.brand} ${parts.ssd.model}` : null,
        parts.psu ? `PSU: ${parts.psu.brand} ${parts.psu.model}` : null,
      ].filter(Boolean);

      pushBot(`✅ Selección:\n${lines.join("\n")}\nTotal aprox: ${money(data.total)}`);

      // botones finales
      pushBot("¿Qué hacemos ahora?", [
        { label: "Agregar todo al carrito 🛒", action: "ADD_ALL" },
        { label: `Ver carrito (${cart.count})`, action: "OPEN_CART" },
        { label: "Ir a pagar ✅", action: "GO_CHECKOUT" },
        { label: "Reiniciar 🔄", action: "RESET" },
      ]);
    } catch {
      setTyping(false);
      pushBot(
        "Ups… no pude conectar con el servidor 😕 (revisa que el backend esté en http://localhost:4000)",
        [
          { label: "Reintentar", action: "CONFIRM:YES" },
          { label: "Reiniciar", action: "RESET" },
        ],
        "error"
      );
    } finally {
      setLoading(false);
      setTyping(false);
    }
  }

  function addAllToCart() {
    if (!result?.parts) {
      pushBot("Aún no tengo una recomendación para agregar.", undefined, "error");
      return;
    }

    const parts = result.parts;
    const list = [parts.cpu, parts.gpu, parts.ram, parts.ssd, parts.psu].filter(Boolean);

    // evita duplicados
    const idsInCart = new Set(cart.items.map((x: any) => x.id));

    list.forEach((p: any) => {
      if (idsInCart.has(p.id)) return;
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

    pushBot("✅ Listo. Agregué la recomendación al carrito.", undefined, "success");
  }

  // ---------- UI ----------
  return (
    <div className="fixed bottom-6 right-6 z-[9999] w-[380px] max-w-[calc(100vw-48px)] pointer-events-auto">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-900/70 backdrop-blur-xl shadow-2xl pointer-events-auto">
        {/* header */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 rounded-2xl bg-gradient-to-br from-diamond-300 to-diamond-600 shadow-glow">
              <span className="absolute inset-0 grid place-items-center text-sm font-black">🤖</span>
            </div>
            <div>
              <p className="text-sm font-semibold">DiamondBot</p>
              <p className="text-xs text-white/60">Asistente guiado</p>
            </div>
          </div>
          <span className="text-white/60">{open ? "—" : "+"}</span>
        </button>

        {open && (
          <div className="border-t border-white/10">
            {/* messages */}
            <div className="max-h-[280px] space-y-2 overflow-auto px-4 py-3">
              {msgs.map((m) => {
                const isBot = m.from === "bot";
                const bubble =
                  m.tone === "error"
                    ? "border border-red-400/20 bg-red-500/10 text-red-200"
                    : m.tone === "success"
                      ? "border border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                      : isBot
                        ? "bg-white/5 text-white/90"
                        : "ml-auto bg-diamond-500/20 text-white border border-diamond-300/20";

                return (
                  <div key={m.id} className={isBot ? "" : "flex justify-end"}>
                    <div className={["max-w-[90%] rounded-2xl px-3 py-2 text-sm whitespace-pre-line", bubble].join(" ")}>
                      {/* hora */}
                      {m.time && (
                        <div className="mb-1 text-[10px] text-white/50">
                          {m.time}
                        </div>
                      )}
                      {m.text}

                      {/* quick replies */}
                      {m.options && m.options.length > 0 && (
                        <div className="mt-2 flex flex-col gap-2">
                          {m.options.map((o, idx) => (
                            <button
                              key={idx}
                              onClick={() => onOption(o.action)}
                              disabled={loading}
                              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 hover:bg-white/10 disabled:opacity-50"
                            >
                              {o.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* typing */}
              {typing && (
                <div className="max-w-[90%] rounded-2xl bg-white/5 px-3 py-2 text-sm text-white/70">
                  <div className="mb-1 text-[10px] text-white/50">{nowTime()}</div>
                  DiamondBot está escribiendo…
                </div>
              )}

              {/* render recomendación con mini-cards */}
              {result?.parts && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white/90">Recomendación</p>
                    <p className="text-white/70">
                      Total: <span className="text-white">{money(result.total)}</span>
                    </p>
                  </div>

                  <div className="mt-3 grid gap-2">
                    {(["cpu", "gpu", "ram", "ssd", "psu"] as const).map((k) => {
                      const p = result.parts?.[k];
                      if (!p) return null;
                      const img = p.imageUrl ? `${API_BASE}${p.imageUrl}` : null;

                      return (
                        <div
                          key={k}
                          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-ink-950/40 p-3"
                        >
                          <div className="h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                            {img ? (
                              <img
                                src={img}
                                alt={`${p.brand} ${p.model}`}
                                className="h-full w-full object-contain p-1"
                                draggable={false}
                              />
                            ) : (
                              <div className="h-full w-full" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs uppercase text-white/60">{k}</p>
                            <p className="truncate font-semibold">
                              {p.brand} {p.model}
                            </p>
                          </div>
                          <p className="text-sm text-diamond-200">{money(p.price)}</p>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => onOption("ADD_ALL")}
                    className="mt-3 w-full rounded-xl bg-gradient-to-r from-diamond-400 to-diamond-600 px-4 py-2 font-semibold shadow-glow"
                  >
                    Agregar todo al carrito
                  </button>
                </div>
              )}

              <div ref={endRef} />
            </div>

            {/* footer controls */}
            <div className="grid gap-3 px-4 pb-4">
              {/* Manual input solo cuando el bot lo pide (ASK_BUDGET con OTHER) */}
              {step === "ASK_BUDGET" && (
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <input
                    value={manual}
                    onChange={(e) => setManual(e.target.value.replace(/[^\d.]/g, ""))}
                    placeholder="Ej: 850"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-diamond-300/40"
                  />
                  <button
                    disabled={!canSendManual()}
                    onClick={sendManual}
                    className="rounded-xl bg-gradient-to-r from-diamond-400 to-diamond-600 px-4 py-2 font-semibold shadow-glow disabled:opacity-60"
                  >
                    Enviar
                  </button>
                </div>
              )}

              {/* mini acciones */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onOption("RESET")}
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}