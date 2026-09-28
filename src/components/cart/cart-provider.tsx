"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  size: string;
  price: number;
  image: string | null;
  quantity: number;
  stock: number;
};

type CartContextValue = {
  items: CartItem[];
  ready: boolean;
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  replace: (items: CartItem[]) => void;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage prieinamas tik naršyklėje
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const add = useCallback<CartContextValue["add"]>((item, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === item.variantId);
      if (existing) {
        return prev.map((i) =>
          i.variantId === item.variantId
            ? { ...i, ...item, quantity: Math.min(i.quantity + quantity, item.stock) }
            : i,
        );
      }
      return [...prev, { ...item, quantity: Math.min(quantity, item.stock) }];
    });
    setOpen(true);
  }, []);

  const setQuantity = useCallback((variantId: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.variantId === variantId ? { ...i, quantity: Math.max(0, Math.min(quantity, i.stock)) } : i))
        .filter((i) => i.quantity > 0),
    );
  }, []);

  const remove = useCallback((variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      ready,
      count: items.reduce((s, i) => s + i.quantity, 0),
      subtotal: items.reduce((s, i) => s + i.quantity * i.price, 0),
      add,
      setQuantity,
      remove,
      clear,
      replace: setItems,
      isOpen,
      setOpen,
    }),
    [items, ready, add, setQuantity, remove, clear, isOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart turi būti naudojamas CartProvider viduje");
  return ctx;
}
