import { useEffect, useMemo, useState } from "react";
import { Layout } from "../components/Layout";
import { useAuth } from "../app/auth";
import { useCart } from "../app/cart";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import { createOrder, uploadOrderReceipt } from "../lib/api";

type BankKey = "PICHINCHA" | "PRODUBANCO" | "GUAYAQUIL";

const BANKS: Record<
  BankKey,
  {
    label: string;
    short: string;
    color: string;
    accountName: string;
    accountType: string;
    accountNumber: string;
    id: string;
    note?: string;
  }
> = {
  PICHINCHA: {
    label: "Banco Pichincha",
    short: "Pichincha",
    color: "from-yellow-400/20 to-amber-500/10",
    accountName: "Diamond Grid S.A.",
    accountType: "Cuenta Corriente",
    accountNumber: "2100-123456-7",
    id: "1799999999001",
    note: "Transferencia bancaria (Ecuador).",
  },
  PRODUBANCO: {
    label: "Produbanco",
    short: "Produbanco",
    color: "from-emerald-400/20 to-green-500/10",
    accountName: "Diamond Grid S.A.",
    accountType: "Cuenta Ahorros",
    accountNumber: "0987-654321-0",
    id: "1799999999001",
    note: "Puedes transferir o depositar directamente.",
  },
  GUAYAQUIL: {
    label: "Banco Guayaquil",
    short: "Guayaquil",
    color: "from-sky-400/20 to-blue-500/10",
    accountName: "Diamond Grid S.A.",
    accountType: "Cuenta Corriente",
    accountNumber: "001-222333444",
    id: "1799999999001",
    note: "Ideal para transferencias inmediatas.",
  },
};

function money(n: number) {
  return `$${Number(n || 0).toFixed(2)}`;
}

async function copy(text: string, okMsg = "✅ Copiado") {
  try {
    await navigator.clipboard.writeText(text);
    alert(okMsg);
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
  const [holderName, setHolderName] = useState("");
  const [reference, setReference] = useState("");

  const [qrOpen, setQrOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [creatingQR, setCreatingQR] = useState(false);

  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      nav("/login");
      return;
    }
    setContactEmail(user.email || "");
    setHolderName(user.name || "");
  }, [user, nav]);

  const bankInfo = BANKS[bank];

  const subtotal = useMemo(() => cart.total, [cart.total]);
  const shipping = 0;
  const total = useMemo(() => subtotal + shipping, [subtotal]);

  const totalItems = useMemo(
    () => cart.items.reduce((acc, it) => acc + Number(it.qty || 0), 0),
    [cart.items]
  );

  const qrText = useMemo(() => {
    return [
      `Diamond Grid - Pago por transferencia`,
      `Banco: ${bankInfo.label}`,
      `Titular: ${bankInfo.accountName}`,
      `Tipo: ${bankInfo.accountType}`,
      `Cuenta: ${bankInfo.accountNumber}`,
      `ID: ${bankInfo.id}`,
      `Monto: ${money(total)}`,
      `Email: ${contactEmail || ""}`,
      `Referencia: ${reference || ""}`,
      `Notas: ${notes || ""}`,
    ].join("\n");
  }, [bankInfo, total, contactEmail, reference, notes]);

  async function generateQR() {
    setCreatingQR(true);
    try {
      const url = await QRCode.toDataURL(qrText, {
        margin: 1,
        scale: 8,
      });
      setQrDataUrl(url);
      setQrOpen(true);
    } finally {
      setCreatingQR(false);
    }
  }

  function handleReceiptChange(file: File | null) {
    setReceiptFile(file);

    if (!file) {
      setReceiptPreview(null);
      return;
    }

    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setReceiptPreview(url);
    } else {
      setReceiptPreview(null);
    }
  }

  function openWhatsapp() {
    const message = encodeURIComponent(
      `Hola, ya realicé el pago de mi compra en Diamond Grid.\nBanco: ${bankInfo.label}\nMonto: ${money(total)}\nCorreo: ${contactEmail}\nReferencia: ${reference || "Sin referencia"}`
    );
    window.open(`https://wa.me/593000000000?text=${message}`, "_blank");
  }

  async function submitOrder() {
    if (cart.items.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    if (!contactEmail.trim()) {
      alert("Ingresa un email de contacto.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        method: "BANK_TRANSFER" as const,
        bank: bankInfo.label,
        reference: reference.trim() || undefined,
        holderName: holderName.trim() || undefined,
        notes: notes.trim() || undefined,
        items: cart.items.map((it) => ({
          id: it.id,
          qty: Number(it.qty),
        })),
      };

      const res = await createOrder(payload);
      if (res?.ok === false) {
        throw new Error(res.message || "No se pudo crear la orden.");
      }

      const orderId = res?.order?.id;
      const orderNumber = res?.order?.orderNumber || res?.order?.id;

      if (receiptFile && orderId) {
        const up = await uploadOrderReceipt(orderId, receiptFile);
        if (up?.ok === false) {
          throw new Error(up.message || "La orden se creó, pero no se pudo subir el comprobante.");
        }
      }

      alert(`✅ Orden creada correctamente.\nNúmero: ${orderNumber}`);
      cart.clear();
      nav("/profile");
    } catch (e: any) {
      alert(`❌ ${e.message || "Error al crear la orden."}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) return null;

  return (
    <Layout>
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm text-diamond-200">Diamond Grid • Checkout</p>
              <h2 className="mt-2 text-4xl font-bold tracking-wide">Finalizar Compra</h2>
              <p className="mt-3 max-w-3xl text-lg text-white/80">
                Completa tu pago por transferencia bancaria y envía tu comprobante.
                Nuestro equipo verificará la orden y procesará tu compra.
              </p>
            </div>

            <button
              onClick={() => nav("/")}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-base text-white/80 hover:bg-white/10"
            >
              Seguir comprando
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-ink-900/60 p-5">
            <p className="text-sm font-semibold text-diamond-200">Paso 1</p>
            <h3 className="mt-2 text-xl font-semibold">Transfiere o deposita</h3>
            <p className="mt-2 text-sm text-white/65">
              Usa una de nuestras cuentas bancarias y realiza el pago del total de tu orden.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-ink-900/60 p-5">
            <p className="text-sm font-semibold text-diamond-200">Paso 2</p>
            <h3 className="mt-2 text-xl font-semibold">Sube tu comprobante</h3>
            <p className="mt-2 text-sm text-white/65">
              Puedes adjuntar imagen o PDF para acelerar la validación manual.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-ink-900/60 p-5">
            <p className="text-sm font-semibold text-diamond-200">Paso 3</p>
            <h3 className="mt-2 text-xl font-semibold">Confirmamos tu orden</h3>
            <p className="mt-2 text-sm text-white/65">
              Verás el pedido reflejado en tu perfil y luego será verificado por el equipo.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-ink-900/60 p-6 md:p-7">
              <h3 className="text-2xl font-semibold">Método de Pago</h3>
              <p className="mt-2 text-base text-white/70">
                Selecciona el banco, revisa los datos y realiza la transferencia.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm text-white/60">Banco</label>
                  <select
                    value={bank}
                    onChange={(e) => setBank(e.target.value as BankKey)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base outline-none focus:border-diamond-300/40"
                  >
                    <option value="PICHINCHA">Banco Pichincha</option>
                    <option value="PRODUBANCO">Produbanco</option>
                    <option value="GUAYAQUIL">Banco Guayaquil</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-white/60">Email de contacto</label>
                  <input
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="tu@gmail.com"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base outline-none focus:border-diamond-300/40"
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm text-white/60">Nombre del depositante</label>
                  <input
                    value={holderName}
                    onChange={(e) => setHolderName(e.target.value)}
                    placeholder="Nombre completo"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base outline-none focus:border-diamond-300/40"
                  />
                </div>

                <div>
                  <label className="text-sm text-white/60">Referencia / N° de comprobante</label>
                  <input
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Ej: 458712"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base outline-none focus:border-diamond-300/40"
                  />
                </div>
              </div>

              <div
                className={`mt-6 rounded-3xl border border-white/10 bg-gradient-to-br ${bankInfo.color} p-6`}
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-wider text-white/55">Deposita / Transfiere a</p>
                    <p className="mt-2 text-3xl font-bold text-diamond-200">{bankInfo.label}</p>

                    <div className="mt-5 grid gap-3">
                      <div>
                        <p className="text-sm text-white/50">Titular</p>
                        <p className="text-lg font-semibold text-white">{bankInfo.accountName}</p>
                      </div>

                      <div>
                        <p className="text-sm text-white/50">Tipo de cuenta</p>
                        <p className="text-lg font-semibold text-white">{bankInfo.accountType}</p>
                      </div>

                      <div>
                        <p className="text-sm text-white/50">Número de cuenta</p>
                        <p className="text-2xl font-bold tracking-wide text-white">
                          {bankInfo.accountNumber}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-white/50">RUC / CI</p>
                        <p className="text-lg font-semibold text-white">{bankInfo.id}</p>
                      </div>

                      {bankInfo.note && <p className="text-sm text-white/60">{bankInfo.note}</p>}
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <button
                      onClick={() => copy(bankInfo.accountNumber, "✅ Número de cuenta copiado")}
                      className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-base text-white/90 hover:bg-white/15"
                    >
                      Copiar cuenta
                    </button>

                    <button
                      onClick={() => copy(qrText, "✅ Datos del pago copiados")}
                      className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-base text-white/90 hover:bg-white/15"
                    >
                      Copiar datos
                    </button>

                    <button
                      onClick={generateQR}
                      disabled={creatingQR}
                      className="rounded-2xl bg-gradient-to-r from-diamond-400 to-diamond-600 px-4 py-3 text-base font-semibold shadow-glow disabled:opacity-60"
                    >
                      {creatingQR ? "Generando..." : "Generar QR"}
                    </button>

                    <button
                      onClick={openWhatsapp}
                      className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-base font-semibold text-emerald-200 hover:bg-emerald-500/20"
                    >
                      WhatsApp
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="text-sm text-white/60">Notas del pedido (opcional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Dirección de entrega, indicaciones, observaciones..."
                  className="mt-2 min-h-[120px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-base outline-none focus:border-diamond-300/40"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-ink-900/60 p-6 md:p-7">
              <h3 className="text-2xl font-semibold">Comprobante de pago</h3>
              <p className="mt-2 text-base text-white/70">
                Adjunta una captura, foto o PDF de tu transferencia.
              </p>

              <div className="mt-5">
                <label className="text-sm text-white/60">Adjuntar archivo</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleReceiptChange(e.target.files?.[0] ?? null)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base outline-none file:mr-4 file:rounded-xl file:border-0 file:bg-diamond-500/20 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                />
              </div>

              {receiptFile && (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-white/60">Archivo seleccionado</p>
                  <p className="mt-1 text-base font-semibold">{receiptFile.name}</p>

                  {receiptPreview && (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-3">
                      <img
                        src={receiptPreview}
                        alt="Comprobante"
                        className="mx-auto max-h-[320px] rounded-xl object-contain"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={submitOrder}
                disabled={cart.items.length === 0 || submitting}
                className="rounded-2xl bg-gradient-to-r from-diamond-400 to-diamond-600 px-6 py-4 text-lg font-semibold shadow-glow disabled:opacity-50"
              >
                {submitting ? "Creando orden..." : "Crear orden"}
              </button>

              <button
                onClick={() => nav("/")}
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-lg font-semibold text-white/80 hover:bg-white/10"
              >
                Seguir comprando
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-ink-900/60 p-6 md:p-7">
              <h3 className="text-2xl font-semibold">Resumen de la orden</h3>
              <p className="mt-2 text-base text-white/70">
                {totalItems} producto(s) en tu compra.
              </p>

              <div className="mt-5 space-y-3">
                {cart.items.map((it) => (
                  <div key={it.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-lg font-semibold">
                      {it.brand} {it.model}
                    </p>
                    <p className="text-sm text-white/60">{it.type}</p>

                    <div className="mt-3 flex items-center justify-between text-base">
                      <span className="text-white/70">
                        {it.qty} × {money(it.price)}
                      </span>
                      <span className="font-semibold text-diamond-200">
                        {money(it.qty * it.price)}
                      </span>
                    </div>
                  </div>
                ))}

                {cart.items.length === 0 && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-base text-white/70">
                    Tu carrito está vacío.
                  </div>
                )}
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between text-base">
                  <span className="text-white/70">Subtotal</span>
                  <span className="font-semibold">{money(subtotal)}</span>
                </div>

                <div className="mt-3 flex items-center justify-between text-base">
                  <span className="text-white/70">Envío</span>
                  <span className="font-semibold">{money(shipping)}</span>
                </div>

                <div className="mt-5 border-t border-white/10 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg text-white/70">Total</span>
                    <span className="text-3xl font-bold text-diamond-200">{money(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-ink-900/60 p-6">
              <h3 className="text-xl font-semibold">Información importante</h3>
              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-semibold text-emerald-200">🔒 Pago seguro</p>
                  <p className="mt-1 text-sm text-white/65">
                    Tu compra será validada manualmente por el administrador.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-semibold text-diamond-200">🧾 Verificación de comprobante</p>
                  <p className="mt-1 text-sm text-white/65">
                    Tu orden inicia en estado pendiente hasta que el pago sea confirmado.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-semibold text-white">📩 Seguimiento desde tu perfil</p>
                  <p className="mt-1 text-sm text-white/65">
                    Después de crear la orden, podrás verla en la sección “Mis pedidos”.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {qrOpen && (
          <div className="fixed inset-0 z-[9999]">
            <div className="absolute inset-0 bg-black/70" onClick={() => setQrOpen(false)} />
            <div className="absolute left-1/2 top-1/2 w-[560px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/10 bg-ink-950/95 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold">QR de Transferencia</h3>
                <button
                  onClick={() => setQrOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
                >
                  Cerrar
                </button>
              </div>

              <p className="mt-3 text-base text-white/70">
                Puedes compartir o escanear este QR para copiar rápidamente los datos del pago.
              </p>

              <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white p-4">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR"
                    className="mx-auto h-[340px] w-[340px]"
                  />
                ) : null}
              </div>

              <button
                onClick={() => copy(qrText, "✅ Texto del QR copiado")}
                className="mt-5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base font-semibold text-white/80 hover:bg-white/10"
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