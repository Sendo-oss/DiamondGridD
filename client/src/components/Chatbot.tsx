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
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
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
  const map = { gaming: "Gaming 🎮", office: "Ofimática 💼", design: "Diseño 🎨", programming: "Programación 💻" };
  return map[p];
}

function prefLabel(p: Preference) {
  const map = { balanced: "Equilibrado ⚖️", performance: "Rendimiento 🚀", cheap: "Más barato 💸" };
  return map[p];
}

type FlowStep = "WELCOME" | "ASK_PURPOSE" | "ASK_BUDGET" | "ASK_PREFERENCE" | "CONFIRM" | "RESULT";

const STORAGE_KEY = "dg_chatbot_v3";

const PURPOSE_OPTIONS = [
  { label: "Gaming 🎮", action: "PURPOSE:gaming", desc: "Alto rendimiento gráfico" },
  { label: "Ofimática 💼", action: "PURPOSE:office", desc: "Productividad diaria" },
  { label: "Diseño 🎨", action: "PURPOSE:design", desc: "Render y edición" },
  { label: "Programación 💻", action: "PURPOSE:programming", desc: "Dev y multitarea" },
];

const BUDGET_OPTIONS = [
  { label: "$500", action: "BUDGET:500" },
  { label: "$700", action: "BUDGET:700" },
  { label: "$900", action: "BUDGET:900" },
  { label: "$1200", action: "BUDGET:1200" },
  { label: "Personalizado ✍️", action: "BUDGET:OTHER" },
];

const PREF_OPTIONS = [
  { label: "⚖️ Equilibrado", action: "PREF:balanced", desc: "Balanceado en todo" },
  { label: "🚀 Rendimiento", action: "PREF:performance", desc: "Máxima potencia" },
  { label: "💸 Económico", action: "PREF:cheap", desc: "Mejor precio" },
];

export function Chatbot() {
  const nav = useNavigate();
  const cart = useCart();

  const [open, setOpen] = useState(true);
  const [minimized, setMinimized] = useState(false);
  const [step, setStep] = useState<FlowStep>("WELCOME");
  const [budget, setBudget] = useState<number>(700);
  const [purpose, setPurpose] = useState<Purpose>("gaming");
  const [preference, setPreference] = useState<Preference>("balanced");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [manual, setManual] = useState("");
  const [pulse, setPulse] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) { seedWelcome(); return; }
      const p = JSON.parse(raw);
      if (typeof p?.open === "boolean") setOpen(p.open);
      if (p?.step) setStep(p.step);
      if (typeof p?.budget === "number") setBudget(p.budget);
      if (p?.purpose) setPurpose(p.purpose);
      if (p?.preference) setPreference(p.preference);
      if (Array.isArray(p?.msgs) && p.msgs.length) setMsgs(p.msgs);
      if (p?.result) setResult(p.result);
      if (!Array.isArray(p?.msgs) || !p.msgs.length) seedWelcome();
    } catch { seedWelcome(); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ open, step, budget, purpose, preference, msgs, result }));
    } catch {}
  }, [open, step, budget, purpose, preference, msgs, result]);

  useEffect(() => {
    if (!open) return;
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing, open, result]);

  // Pulse when minimized and new message
  useEffect(() => {
    if (minimized && msgs.length > 0) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 2000);
      return () => clearTimeout(t);
    }
  }, [msgs.length, minimized]);

  const summary = useMemo(() =>
    `${purposeLabel(purpose)} • ${money(budget)} • ${prefLabel(preference)}`,
    [purpose, budget, preference]
  );

  function pushBot(text: string, options?: Option[], tone: Msg["tone"] = "normal") {
    setMsgs(m => [...m, { id: uid(), from: "bot", text, options, time: nowTime(), tone }]);
  }

  function pushUser(text: string) {
    setMsgs(m => [...m, { id: uid(), from: "user", text, time: nowTime(), tone: "normal" }]);
  }

  function botTyping(ms = 600) {
    setTyping(true);
    setTimeout(() => setTyping(false), ms);
  }

  function seedWelcome() {
    const t = nowTime();
    setMsgs([
      { id: uid(), from: "bot", time: t, text: "¡Hola! 👋 Soy **DiamondBot**.\nTe ayudo a armar la PC perfecta para ti." },
      { id: uid(), from: "bot", time: t, text: "¿Para qué vas a usar tu PC?", options: PURPOSE_OPTIONS.map(o => ({ label: o.label, action: o.action })) },
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

  async function onOption(action: string) {
    if (loading) return;
    if (action === "RESET") { pushUser("🔄 Reiniciar"); botTyping(300); setTimeout(resetAll, 400); return; }
    if (action === "OPEN_CART") { pushUser("Ver carrito 🛒"); nav("/cart"); return; }
    if (action === "ADD_ALL") { pushUser("Agregar todo al carrito 🛒"); addAllToCart(); return; }
    if (action === "GO_CHECKOUT") { pushUser("Ir a pagar ✅"); nav("/checkout"); return; }

    const [kind, value] = action.split(":");

    if (kind === "PURPOSE") {
      const p = value as Purpose;
      setPurpose(p);
      pushUser(purposeLabel(p));
      botTyping();
      setStep("ASK_BUDGET");
      pushBot("Genial 🎯 ¿Cuál es tu presupuesto?", BUDGET_OPTIONS);
      return;
    }

    if (kind === "BUDGET") {
      if (value === "OTHER") {
        pushUser("Presupuesto personalizado ✍️");
        botTyping();
        pushBot("Escribe tu presupuesto en dólares (ej: 850).");
        setStep("ASK_BUDGET");
        return;
      }
      const b = Number(value);
      setBudget(b);
      pushUser(money(b));
      botTyping();
      setStep("ASK_PREFERENCE");
      pushBot("¿Qué prefieres priorizar en tu build?", PREF_OPTIONS.map(o => ({ label: o.label, action: o.action })));
      return;
    }

    if (kind === "PREF") {
      const pref = value as Preference;
      setPreference(pref);
      pushUser(prefLabel(pref));
      botTyping(700);
      setStep("CONFIRM");
      setTimeout(() => {
        pushBot(`Perfecto ✨ Aquí están tus datos:\n\n${summary}`, [
          { label: "✅ ¡Armar mi PC!", action: "CONFIRM:YES" },
          { label: "✏️ Cambiar uso", action: "CONFIRM:CHANGE_PURPOSE" },
          { label: "💰 Cambiar presupuesto", action: "CONFIRM:CHANGE_BUDGET" },
          { label: "🔄 Reiniciar", action: "RESET" },
        ]);
      }, 750);
      return;
    }

    if (kind === "CONFIRM") {
      if (value === "YES") { pushUser("¡Armar mi PC! 🚀"); botTyping(400); await handleRecommend(); return; }
      if (value === "CHANGE_PURPOSE") {
        pushUser("Cambiar uso");
        botTyping();
        setStep("ASK_PURPOSE");
        pushBot("Claro, ¿en qué la vas a usar?", PURPOSE_OPTIONS.map(o => ({ label: o.label, action: o.action })));
        return;
      }
      if (value === "CHANGE_BUDGET") {
        pushUser("Cambiar presupuesto");
        botTyping();
        setStep("ASK_BUDGET");
        pushBot("¿Cuál sería tu nuevo presupuesto?", BUDGET_OPTIONS);
        return;
      }
    }
  }

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
    pushBot("¿Qué prefieres priorizar?", PREF_OPTIONS.map(o => ({ label: o.label, action: o.action })));
  }

  async function handleRecommend() {
    const b = Number(budget);
    if (!Number.isFinite(b) || b < 100) {
      pushBot("El presupuesto mínimo es $100.", undefined, "error");
      setStep("ASK_BUDGET");
      return;
    }
    setLoading(true);
    setResult(null);
    setStep("RESULT");
    setTyping(true);
    try {
      const data = await recommendBuild({ budget: b, purpose, preference } as any);
      setResult(data);
      setTyping(false);
      pushBot(data.message ?? "¡Aquí está tu build ideal! 🖥️✨", undefined, "success");
      const parts = data?.parts || {};
      const lines = [
        parts.cpu ? `🔵 CPU: ${parts.cpu.brand} ${parts.cpu.model}` : null,
        parts.gpu ? `🟢 GPU: ${parts.gpu.brand} ${parts.gpu.model}` : null,
        parts.ram ? `🟡 RAM: ${parts.ram.brand} ${parts.ram.model}` : null,
        parts.ssd ? `🟠 SSD: ${parts.ssd.brand} ${parts.ssd.model}` : null,
        parts.psu ? `🔴 PSU: ${parts.psu.brand} ${parts.psu.model}` : null,
      ].filter(Boolean);
      pushBot(`${lines.join("\n")}\n\n💰 Total: ${money(data.total)}`);
      pushBot("¿Qué hacemos con esta build?", [
        { label: "🛒 Agregar todo al carrito", action: "ADD_ALL" },
        { label: `👜 Ver carrito (${cart.count})`, action: "OPEN_CART" },
        { label: "💳 Ir a pagar", action: "GO_CHECKOUT" },
        { label: "🔄 Nueva búsqueda", action: "RESET" },
      ]);
    } catch {
      setTyping(false);
      pushBot("No pude conectar con el servidor 😕\n(verifica que el backend esté activo)", [
        { label: "🔁 Reintentar", action: "CONFIRM:YES" },
        { label: "🔄 Reiniciar", action: "RESET" },
      ], "error");
    } finally {
      setLoading(false);
      setTyping(false);
    }
  }

  function addAllToCart() {
    if (!result?.parts) { pushBot("Aún no tengo una recomendación.", undefined, "error"); return; }
    const parts = result.parts;
    const list = [parts.cpu, parts.gpu, parts.ram, parts.ssd, parts.psu].filter(Boolean);
    const idsInCart = new Set(cart.items.map((x: any) => x.id));
    list.forEach((p: any) => {
      if (idsInCart.has(p.id)) return;
      cart.add({ id: p.id, type: p.type, brand: p.brand, model: p.model, price: Number(p.price ?? 0), imageUrl: p.imageUrl ?? null }, 1);
    });
    pushBot("✅ ¡Listo! Todo está en tu carrito.", [
      { label: "👜 Ver carrito", action: "OPEN_CART" },
      { label: "💳 Ir a pagar", action: "GO_CHECKOUT" },
    ], "success");
  }

  const progressSteps = ["Uso", "Presupuesto", "Preferencia", "Confirmar", "Resultado"];
  const currentProgress = { WELCOME: 0, ASK_PURPOSE: 0, ASK_BUDGET: 1, ASK_PREFERENCE: 2, CONFIRM: 3, RESULT: 4 }[step] ?? 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');

        .cb-root * { box-sizing: border-box; margin: 0; padding: 0; }
        .cb-root { font-family: 'DM Sans', sans-serif; }

        .cb-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 99999;
        }

        .cb-toggle-btn {
          width: 56px;
          height: 56px;
          border-radius: 18px;
          background: linear-gradient(135deg, #0ea5e9, #6366f1);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          box-shadow: 0 8px 32px rgba(99,102,241,0.45), 0 2px 8px rgba(0,0,0,0.3);
          transition: transform 0.2s, box-shadow 0.2s;
          position: relative;
        }
        .cb-toggle-btn:hover { transform: scale(1.08); box-shadow: 0 12px 40px rgba(99,102,241,0.55); }

        .cb-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background: #f43f5e;
          color: white;
          font-size: 10px;
          font-weight: 700;
          width: 20px;
          height: 20px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #0f0f17;
          animation: cb-pop 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }

        @keyframes cb-pop {
          0% { transform: scale(0); }
          100% { transform: scale(1); }
        }

        @keyframes cb-pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(99,102,241,0.5); }
          70% { box-shadow: 0 0 0 14px rgba(99,102,241,0); }
          100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
        }

        .cb-pulse { animation: cb-pulse-ring 1.5s ease-out infinite; }

        .cb-window {
          position: fixed;
          bottom: 92px;
          right: 24px;
          z-index: 99998;
          width: 400px;
          max-width: calc(100vw - 32px);
          border-radius: 24px;
          overflow: hidden;
          background: #0f0f17;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset;
          display: flex;
          flex-direction: column;
          animation: cb-slide-up 0.35s cubic-bezier(0.34,1.3,0.64,1);
          max-height: 600px;
        }

        @keyframes cb-slide-up {
          0% { opacity: 0; transform: translateY(20px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Header */
        .cb-header {
          padding: 16px 18px;
          background: linear-gradient(135deg, rgba(14,165,233,0.12), rgba(99,102,241,0.12));
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .cb-avatar {
          width: 40px;
          height: 40px;
          border-radius: 14px;
          background: linear-gradient(135deg, #0ea5e9, #6366f1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 4px 16px rgba(99,102,241,0.35);
          flex-shrink: 0;
        }

        .cb-header-info { flex: 1; }
        .cb-header-name { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 14px; color: #fff; letter-spacing: -0.01em; }
        .cb-header-status { display: flex; align-items: center; gap: 5px; margin-top: 2px; }
        .cb-status-dot { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 6px rgba(34,197,94,0.6); animation: cb-blink 2s ease infinite; }
        @keyframes cb-blink { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        .cb-status-text { font-size: 11px; color: rgba(255,255,255,0.45); font-weight: 500; }

        .cb-header-actions { display: flex; gap: 6px; }
        .cb-icon-btn {
          width: 30px; height: 30px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.45);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px;
          transition: background 0.15s, color 0.15s;
        }
        .cb-icon-btn:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.8); }

        /* Progress */
        .cb-progress {
          padding: 10px 18px 12px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          flex-shrink: 0;
          background: rgba(255,255,255,0.02);
        }

        .cb-progress-steps {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .cb-step-item {
          display: flex;
          align-items: center;
          gap: 4px;
          flex: 1;
        }

        .cb-step-dot {
          width: 22px;
          height: 22px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: 700;
          flex-shrink: 0;
          transition: all 0.3s;
        }

        .cb-step-dot.done { background: linear-gradient(135deg, #0ea5e9, #6366f1); color: white; }
        .cb-step-dot.active { background: rgba(99,102,241,0.2); color: #818cf8; border: 1.5px solid rgba(99,102,241,0.4); }
        .cb-step-dot.idle { background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.06); }

        .cb-step-line {
          flex: 1;
          height: 2px;
          border-radius: 999px;
          background: rgba(255,255,255,0.06);
          overflow: hidden;
        }

        .cb-step-line-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #0ea5e9, #6366f1);
          transition: width 0.4s ease;
        }

        /* Messages */
        .cb-messages {
          flex: 1;
          overflow-y: auto;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.08) transparent;
        }

        .cb-messages::-webkit-scrollbar { width: 4px; }
        .cb-messages::-webkit-scrollbar-track { background: transparent; }
        .cb-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }

        .cb-msg-row { display: flex; flex-direction: column; animation: cb-msg-in 0.25s ease; }
        @keyframes cb-msg-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .cb-msg-row.user { align-items: flex-end; }

        .cb-bubble {
          max-width: 88%;
          border-radius: 18px;
          padding: 10px 13px;
          font-size: 13.5px;
          line-height: 1.55;
          white-space: pre-line;
          word-break: break-word;
        }

        .cb-bubble.bot {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.88);
          border-bottom-left-radius: 6px;
        }

        .cb-bubble.user {
          background: linear-gradient(135deg, rgba(14,165,233,0.25), rgba(99,102,241,0.25));
          border: 1px solid rgba(99,102,241,0.25);
          color: rgba(255,255,255,0.92);
          border-bottom-right-radius: 6px;
        }

        .cb-bubble.error {
          background: rgba(244,63,94,0.08);
          border-color: rgba(244,63,94,0.18);
          color: rgba(252,165,165,0.9);
        }

        .cb-bubble.success {
          background: rgba(34,197,94,0.08);
          border-color: rgba(34,197,94,0.18);
          color: rgba(134,239,172,0.9);
        }

        .cb-time {
          font-size: 10px;
          color: rgba(255,255,255,0.25);
          margin-bottom: 4px;
          padding: 0 4px;
        }

        /* Options */
        .cb-options {
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .cb-option-btn {
          width: 100%;
          text-align: left;
          border-radius: 13px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.82);
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          padding: 10px 13px;
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .cb-option-btn:hover:not(:disabled) {
          background: rgba(99,102,241,0.12);
          border-color: rgba(99,102,241,0.3);
          color: #fff;
          transform: translateX(2px);
        }

        .cb-option-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .cb-option-btn.primary {
          background: linear-gradient(135deg, rgba(14,165,233,0.15), rgba(99,102,241,0.15));
          border-color: rgba(99,102,241,0.25);
          color: rgba(255,255,255,0.9);
        }

        .cb-option-btn.primary:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(14,165,233,0.25), rgba(99,102,241,0.25));
          border-color: rgba(99,102,241,0.45);
        }

        /* Typing */
        .cb-typing {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 10px 13px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 18px;
          border-bottom-left-radius: 6px;
          width: fit-content;
        }

        .cb-typing span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(99,102,241,0.6);
          animation: cb-typing-dot 1.2s ease infinite;
        }

        .cb-typing span:nth-child(2) { animation-delay: 0.15s; }
        .cb-typing span:nth-child(3) { animation-delay: 0.3s; }

        @keyframes cb-typing-dot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.6; }
          30% { transform: translateY(-5px); opacity: 1; }
        }

        /* Result card */
        .cb-result-card {
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          overflow: hidden;
          animation: cb-msg-in 0.3s ease;
        }

        .cb-result-header {
          padding: 12px 14px;
          background: linear-gradient(135deg, rgba(14,165,233,0.1), rgba(99,102,241,0.1));
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .cb-result-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; color: rgba(255,255,255,0.9); }
        .cb-result-total { font-size: 13px; font-weight: 700; color: #22d3ee; }

        .cb-parts-list { padding: 10px; display: flex; flex-direction: column; gap: 6px; }

        .cb-part-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 11px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.05);
          background: rgba(255,255,255,0.025);
          transition: background 0.15s;
        }

        .cb-part-row:hover { background: rgba(255,255,255,0.05); }

        .cb-part-img {
          width: 38px;
          height: 38px;
          border-radius: 9px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.07);
          overflow: hidden;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cb-part-img img { width: 100%; height: 100%; object-fit: contain; padding: 4px; }

        .cb-part-type {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
        }

        .cb-part-name {
          font-size: 12px;
          font-weight: 600;
          color: rgba(255,255,255,0.85);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cb-part-price {
          font-size: 12px;
          font-weight: 700;
          color: #22d3ee;
          flex-shrink: 0;
          margin-left: auto;
        }

        .cb-result-add-btn {
          margin: 0 10px 10px;
          width: calc(100% - 20px);
          border: none;
          border-radius: 12px;
          padding: 11px;
          font-size: 13px;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          background: linear-gradient(135deg, #0ea5e9, #6366f1);
          color: white;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 20px rgba(99,102,241,0.3);
        }

        .cb-result-add-btn:hover { transform: scale(1.02); box-shadow: 0 6px 24px rgba(99,102,241,0.4); }

        /* Footer */
        .cb-footer {
          padding: 10px 14px 14px;
          border-top: 1px solid rgba(255,255,255,0.05);
          flex-shrink: 0;
          background: rgba(255,255,255,0.01);
        }

        .cb-input-row {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }

        .cb-input {
          flex: 1;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.05);
          padding: 10px 13px;
          color: white;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }

        .cb-input::placeholder { color: rgba(255,255,255,0.2); }
        .cb-input:focus { border-color: rgba(99,102,241,0.4); background: rgba(255,255,255,0.07); }

        .cb-send-btn {
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #0ea5e9, #6366f1);
          color: white;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          padding: 10px 16px;
          cursor: pointer;
          transition: transform 0.15s, opacity 0.15s;
          box-shadow: 0 3px 12px rgba(99,102,241,0.3);
        }

        .cb-send-btn:hover:not(:disabled) { transform: scale(1.04); }
        .cb-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .cb-footer-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
        }

        .cb-footer-btn {
          border-radius: 11px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.6);
          font-size: 12px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          padding: 8px 10px;
          cursor: pointer;
          transition: all 0.15s;
          text-align: center;
        }

        .cb-footer-btn:hover { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.85); }
        .cb-footer-btn.cart { border-color: rgba(14,165,233,0.2); background: rgba(14,165,233,0.07); color: rgba(125,211,252,0.8); }
        .cb-footer-btn.cart:hover { background: rgba(14,165,233,0.12); color: rgba(125,211,252,1); }
      `}</style>

      <div className="cb-root">
        {/* FAB toggle button */}
        <div className="cb-fab">
          <button
            className={`cb-toggle-btn ${pulse ? "cb-pulse" : ""}`}
            onClick={() => setMinimized(v => !v)}
            title="DiamondBot"
          >
            {minimized ? "🤖" : "✕"}
            {cart.count > 0 && <span className="cb-badge">{cart.count}</span>}
          </button>
        </div>

        {/* Chat window */}
        {!minimized && (
          <div className="cb-window">
            {/* Header */}
            <div className="cb-header">
              <div className="cb-avatar">🤖</div>
              <div className="cb-header-info">
                <div className="cb-header-name">DiamondBot</div>
                <div className="cb-header-status">
                  <div className="cb-status-dot" />
                  <span className="cb-status-text">{loading ? "Analizando builds..." : "En línea"}</span>
                </div>
              </div>
              <div className="cb-header-actions">
                <button className="cb-icon-btn" onClick={resetAll} title="Reiniciar">↺</button>
                <button className="cb-icon-btn" onClick={() => setMinimized(true)} title="Minimizar">—</button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="cb-progress">
              <div className="cb-progress-steps">
                {progressSteps.map((label, i) => (
                  <div className="cb-step-item" key={i}>
                    <div className={`cb-step-dot ${i < currentProgress ? "done" : i === currentProgress ? "active" : "idle"}`}>
                      {i < currentProgress ? "✓" : i + 1}
                    </div>
                    {i < progressSteps.length - 1 && (
                      <div className="cb-step-line">
                        <div className="cb-step-line-fill" style={{ width: i < currentProgress ? "100%" : "0%" }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="cb-messages">
              {msgs.map((m) => {
                const isBot = m.from === "bot";
                return (
                  <div key={m.id} className={`cb-msg-row ${isBot ? "bot" : "user"}`}>
                    {m.time && <div className="cb-time">{m.time}</div>}
                    <div className={`cb-bubble ${isBot ? "bot" : "user"} ${m.tone === "error" ? "error" : m.tone === "success" ? "success" : ""}`}>
                      {m.text}
                      {m.options && m.options.length > 0 && (
                        <div className="cb-options">
                          {m.options.map((o, idx) => (
                            <button
                              key={idx}
                              className={`cb-option-btn ${idx === 0 && (o.action.includes("CONFIRM") || o.action.includes("ADD")) ? "primary" : ""}`}
                              onClick={() => onOption(o.action)}
                              disabled={loading}
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

              {typing && (
                <div className="cb-msg-row bot">
                  <div className="cb-time">{nowTime()}</div>
                  <div className="cb-typing">
                    <span /><span /><span />
                  </div>
                </div>
              )}

              {result?.parts && (
                <div className="cb-result-card">
                  <div className="cb-result-header">
                    <span className="cb-result-title">🖥️ Tu Build Recomendada</span>
                    <span className="cb-result-total">{money(result.total)}</span>
                  </div>
                  <div className="cb-parts-list">
                    {(["cpu", "gpu", "ram", "ssd", "psu"] as const).map((k) => {
                      const p = result.parts?.[k];
                      if (!p) return null;
                      const img = p.imageUrl ? `${API_BASE}${p.imageUrl}` : null;
                      return (
                        <div key={k} className="cb-part-row">
                          <div className="cb-part-img">
                            {img ? <img src={img} alt={`${p.brand} ${p.model}`} draggable={false} /> : <span style={{ fontSize: 16 }}>💾</span>}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="cb-part-type">{k}</div>
                            <div className="cb-part-name">{p.brand} {p.model}</div>
                          </div>
                          <div className="cb-part-price">{money(p.price)}</div>
                        </div>
                      );
                    })}
                  </div>
                  <button className="cb-result-add-btn" onClick={() => onOption("ADD_ALL")}>
                    🛒 Agregar todo al carrito
                  </button>
                </div>
              )}

              <div ref={endRef} />
            </div>

            {/* Footer */}
            <div className="cb-footer">
              {step === "ASK_BUDGET" && (
                <div className="cb-input-row">
                  <input
                    className="cb-input"
                    value={manual}
                    onChange={e => setManual(e.target.value.replace(/[^\d.]/g, ""))}
                    placeholder="Ej: 850"
                    onKeyDown={e => e.key === "Enter" && canSendManual() && sendManual()}
                  />
                  <button
                    className="cb-send-btn"
                    disabled={!canSendManual()}
                    onClick={sendManual}
                  >
                    Enviar
                  </button>
                </div>
              )}
              <div className="cb-footer-actions">
                <button className="cb-footer-btn" onClick={() => onOption("RESET")}>🔄 Reiniciar</button>
                <button className="cb-footer-btn cart" onClick={() => nav("/cart")}>
                  👜 Carrito ({cart.count})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}