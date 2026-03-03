import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  id: string;
  type: string;
  brand: string;
  model: string;
  price: number;
  qty: number;
  imageUrl?: string | null;
};

type CartCtxValue = {
  items: CartItem[];
  count: number;
  total: number;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;

  open: boolean;
  setOpen: (v: boolean) => void;
};

const CartCtx = createContext<CartCtxValue | null>(null);

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart() usado fuera de <CartProvider>.");
  return ctx;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem("dg_cart");
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("dg_cart", JSON.stringify(items));
  }, [items]);

  const count = useMemo(() => items.reduce((s, x) => s + (x.qty || 0), 0), [items]);
  const total = useMemo(
    () => items.reduce((s, x) => s + Number(x.price || 0) * Number(x.qty || 0), 0),
    [items]
  );

  function add(item: Omit<CartItem, "qty">, qty = 1) {
    setItems((prev) => {
      const i = prev.findIndex((p) => p.id === item.id);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + qty };
        return next;
      }
      return [...prev, { ...item, qty }];
    });
    setOpen(true);
  }

  function inc(id: string) {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x)));
  }

  function dec(id: string) {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, qty: Math.max(1, x.qty - 1) } : x)));
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  function clear() {
    setItems([]);
  }

  const value = useMemo<CartCtxValue>(
    () => ({ items, count, total, add, inc, dec, remove, clear, open, setOpen }),
    [items, count, total, open]
  );

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}