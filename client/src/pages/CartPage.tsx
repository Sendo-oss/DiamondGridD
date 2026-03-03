import { Layout } from "../components/Layout";
import { API_BASE } from "../lib/api";
import { useCart } from "../app/cart";

export function CartPage() {
  const { items, totalPrice, totalQty, remove, setQty, clear } = useCart();

  return (
    <Layout>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Carrito</h2>
            <p className="mt-1 text-white/70">Productos agregados: {totalQty}</p>
          </div>

          <button
            onClick={() => {
              if (!confirm("¿Vaciar carrito?")) return;
              clear();
            }}
            className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm text-red-200 hover:bg-red-500/20"
            disabled={items.length === 0}
          >
            Vaciar
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {items.map((it) => (
            <div key={it.id} className="rounded-2xl border border-white/10 bg-ink-900/50 p-4">
              <div className="flex gap-4">
                <div className="h-20 w-24 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  {it.imageUrl ? (
                    <img
                      src={`${API_BASE}${it.imageUrl}`}
                      alt={it.model}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-white/50">
                      Sin imagen
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-white/60">{it.type}</p>
                      <p className="text-lg font-semibold">{it.brand} {it.model}</p>
                      <p className="text-sm text-diamond-200">${Number(it.price).toFixed(2)}</p>
                    </div>

                    <button
                      onClick={() => remove(it.id)}
                      className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200 hover:bg-red-500/20"
                    >
                      Eliminar
                    </button>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-sm text-white/70">Cantidad:</span>
                    <button
                      onClick={() => setQty(it.id, it.qty - 1)}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 hover:bg-white/10"
                    >
                      -
                    </button>
                    <input
                      value={it.qty}
                      onChange={(e) => setQty(it.id, Number(e.target.value))}
                      type="number"
                      className="w-20 rounded-lg border border-white/10 bg-white/5 px-3 py-1 outline-none"
                    />
                    <button
                      onClick={() => setQty(it.id, it.qty + 1)}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 hover:bg-white/10"
                    >
                      +
                    </button>

                    {typeof it.stock === "number" && (
                      <span className="ml-2 text-xs text-white/50">Stock: {it.stock}</span>
                    )}

                    <div className="ml-auto text-sm text-white/70">
                      Subtotal:{" "}
                      <span className="font-semibold text-white">
                        ${(it.qty * Number(it.price)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">
              Tu carrito está vacío. Ve al catálogo y agrega componentes.
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-white/70">Total</p>
          <p className="text-xl font-semibold text-white">${totalPrice.toFixed(2)}</p>
        </div>
      </div>
    </Layout>
  );
}