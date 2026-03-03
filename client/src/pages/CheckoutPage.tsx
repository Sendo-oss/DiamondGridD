import { useEffect, useMemo, useState } from "react";
import { Layout } from "../components/Layout";
import { useAuth } from "../app/auth";
import { useCart } from "../app/cart";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";

type BankKey = "PICHINCHA" | "PRODUBANCO" | "GUAYAQUIL";

const BANKS: Record<
  BankKey,
  {
    label: string;
    accountName: string;
    accountType: string;
    accountNumber: string;
    id: string; // RUC / CI
    note?: string;
  }
> = {
  PICHINCHA: {
    label: "Banco Pichincha",
    accountName: "Diamond Grid S.A.",
    accountType: "Cuenta Corriente",
    accountNumber: "2100-123456-7",
    id: "1799999999001",
    note: "Transferencia bancaria (Ecuador).",
  },
  PRODUBANCO: {
    label: "Produbanco",
    accountName: "Diamond Grid S.A.",
    accountType: "Cuenta Ahorros",
    accountNumber: "0987-654321-0",
    id: "1799999999001",
  },
  GUAYAQUIL: {
    label: "Banco Guayaquil",
    accountName: "Diamond Grid S.A.",
    accountType: "Cuenta Corriente",
    accountNumber: "001-222333444",
    id: "1799999999001",
  },
};

function money(n: number) {
  return `$${Number(n || 0).toFixed(2)}`;
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    alert("✅ Copiado");
  } catch {
    alert("No se pudo copiar");
  }
}

export function CheckoutPage() {
  const { user } = useAuth();
  const cart = useCart();
  const nav = useNavigate();

  const [bank, setBank] = useState<BankKey>("PICHINCHA");
  const [contactEmail, setContactEmail] = useState("");
  const [notes, setNotes] = useState("");

  const [qrOpen, setQrOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [creatingQR, setCreatingQR] = useState(false);

  useEffect(() => {
    if (!user) {
      nav("/login");
      return;
    }
    setContactEmail(user.email || "");
  }, [user, nav]);

  const bankInfo = BANKS[bank];

  const subtotal = useMemo(() => cart.total, [cart.total]);
  const shipping = 0;
  const total = useMemo(() => subtotal + shipping, [subtotal]);

  const qrText = useMemo(() => {
    // Texto “genérico” para QR. Muchos bancos no tienen estándar universal,
    // pero esto sirve para escanear y copiar datos rápido.
    return [
      `Diamond Grid - Pago por transferencia`,
      `Banco: ${bankInfo.label}`,
      `Titular: ${bankInfo.accountName}`,
      `Tipo: ${bankInfo.accountType}`,
      `Cuenta: ${bankInfo.accountNumber}`,
      `ID: ${bankInfo.id}`,
      `Monto: ${money(total)}`,
      `Email: ${contactEmail || ""}`,
      `Notas: ${notes || ""}`,
    ].join("\n");
  }, [bankInfo, total, contactEmail, notes]);

  async function generateQR() {
    setCreatingQR(true);
    try {
      const url = await QRCode.toDataURL(qrText, { margin: 1, scale: 8 });
      setQrDataUrl(url);
      setQrOpen(true);
    } finally {
      setCreatingQR(false);
    }
  }

  async function submitOrder() {
    // Aquí tú conectas a tu endpoint real de Orders.
    // Como tú ya dijiste que "ya te sale checkout", seguramente ya tienes el POST.
    // De momento lo dejamos sin romperte nada:
    alert("✅ Orden creada (conecta aquí tu endpoint /api/orders si ya lo tienes).");
  }

  if (!user) return null;

  return (
    <Layout>
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-semibold">Checkout</h2>
              <p className="mt-1 text-white/70">
                Pago por transferencia bancaria (Ecuador). El admin verifica el pago.
              </p>
            </div>
            <button
              onClick={() => nav("/cart")}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              Volver al carrito
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Left */}
          <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-ink-900/60 p-6">
            <h3 className="text-lg font-semibold">Método de pago</h3>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs text-white/60">Banco</label>
                <select
                  value={bank}
                  onChange={(e) => setBank(e.target.value as BankKey)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-diamond-300/40"
                >
                  <option value="PICHINCHA">Banco Pichincha</option>
                  <option value="PRODUBANCO">Produbanco</option>
                  <option value="GUAYAQUIL">Banco Guayaquil</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-white/60">Gmail / Email de contacto</label>
                <input
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="tu@gmail.com"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 outline-none focus:border-diamond-300/40"
                />
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-white/60">Deposita / Transfiere a:</p>
                  <p className="mt-1 text-lg font-semibold">{bankInfo.label}</p>
                  <p className="mt-2 text-sm text-white/80">
                    <span className="text-white/60">Titular: </span>
                    {bankInfo.accountName}
                  </p>
                  <p className="text-sm text-white/80">
                    <span className="text-white/60">Tipo: </span>
                    {bankInfo.accountType}
                  </p>
                  <p className="text-sm text-white/80">
                    <span className="text-white/60">Cuenta: </span>
                    {bankInfo.accountNumber}
                  </p>
                  <p className="text-sm text-white/80">
                    <span className="text-white/60">ID: </span>
                    {bankInfo.id}
                  </p>
                  {bankInfo.note && <p className="mt-2 text-xs text-white/50">{bankInfo.note}</p>}
                </div>

                <div className="grid gap-2">
                  <button
                    onClick={() => copy(bankInfo.accountNumber)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                  >
                    Copiar cuenta
                  </button>
                  <button
                    onClick={() => copy(qrText)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                  >
                    Copiar datos
                  </button>
                  <button
                    onClick={generateQR}
                    disabled={creatingQR}
                    className="rounded-xl bg-gradient-to-r from-diamond-400 to-diamond-600 px-3 py-2 text-sm font-semibold shadow-glow disabled:opacity-60"
                  >
                    {creatingQR ? "Generando..." : "Generar QR"}
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <label className="text-xs text-white/60">Notas (opcional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Dirección de entrega / observaciones"
                  className="mt-1 min-h-[90px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-diamond-300/40"
                />
                <p className="mt-2 text-xs text-white/50">
                  El admin verificará el pago y cambiará el estado a “PAID”.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                onClick={submitOrder}
                disabled={cart.items.length === 0}
                className="rounded-xl bg-gradient-to-r from-diamond-400 to-diamond-600 px-4 py-2 font-semibold shadow-glow disabled:opacity-50"
              >
                Crear orden
              </button>

              <button
                onClick={() => nav("/")}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white/80 hover:bg-white/10"
              >
                Seguir comprando
              </button>
            </div>
          </div>

          {/* Right summary */}
          <div className="rounded-3xl border border-white/10 bg-ink-900/60 p-6">
            <h3 className="text-lg font-semibold">Resumen</h3>

            <div className="mt-4 space-y-3">
              {cart.items.map((it) => (
                <div key={it.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="font-semibold">
                    {it.brand} {it.model}
                  </p>
                  <p className="text-xs text-white/60">{it.type}</p>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-white/70">
                      {it.qty} × {money(it.price)}
                    </span>
                    <span className="font-semibold text-diamond-200">{money(it.qty * it.price)}</span>
                  </div>
                </div>
              ))}

              {cart.items.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                  Tu carrito está vacío.
                </div>
              )}
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">Subtotal</span>
                <span className="font-semibold">{money(subtotal)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-white/70">Envío</span>
                <span className="font-semibold">{money(shipping)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-white/70">Total</span>
                <span className="text-xl font-semibold text-diamond-200">{money(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* QR Modal */}
        {qrOpen && (
          <div className="fixed inset-0 z-[9999]">
            <div className="absolute inset-0 bg-black/70" onClick={() => setQrOpen(false)} />
            <div className="absolute left-1/2 top-1/2 w-[520px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/10 bg-ink-950/95 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">QR de Transferencia</h3>
                <button
                  onClick={() => setQrOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                >
                  Cerrar
                </button>
              </div>

              <p className="mt-2 text-sm text-white/70">
                Escanéalo para copiar datos del pago. (No todos los bancos leen el mismo formato, pero sirve para compartir info rápido.)
              </p>

              <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white p-4">
                {qrDataUrl ? <img src={qrDataUrl} alt="QR" className="mx-auto h-[320px] w-[320px]" /> : null}
              </div>

              <button
                onClick={() => copy(qrText)}
                className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white/80 hover:bg-white/10"
              >
                Copiar texto del QR
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}