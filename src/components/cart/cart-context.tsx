"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  size: string;
  priceCents: number;
  imageUrl: string | null;
  quantity: number;
  /** Likutis sandėlyje – kiek daugiausia galima pridėti */
  stock: number;
};

type CartContextValue = {
  items: CartItem[];
  ready: boolean;
  count: number;
  subtotalCents: number;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  addItem: (item: CartItem) => void;
  setQuantity: (productId: string, size: string, quantity: number) => void;
  removeItem: (productId: string, size: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "veja_cart_v1";

const CartContext = createContext<CartContextValue | null>(null);

function sameLine(a: CartItem, productId: string, size: string) {
  return a.productId === productId && a.size === size;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed as CartItem[]);
      }
    } catch {
      // sugadintus duomenis tiesiog ignoruojame
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const addItem = useCallback((item: CartItem) => {
    setItems((current) => {
      const existing = current.find((line) =>
        sameLine(line, item.productId, item.size),
      );
      if (!existing) return [...current, item];
      const limit = item.stock > 0 ? item.stock : existing.quantity + item.quantity;
      return current.map((line) =>
        sameLine(line, item.productId, item.size)
          ? { ...line, quantity: Math.min(line.quantity + item.quantity, limit) }
          : line,
      );
    });
    setDrawerOpen(true);
  }, []);

  const setQuantity = useCallback(
    (productId: string, size: string, quantity: number) => {
      setItems((current) =>
        current
          .map((line) =>
            sameLine(line, productId, size)
              ? { ...line, quantity: Math.max(0, quantity) }
              : line,
          )
          .filter((line) => line.quantity > 0),
      );
    },
    [],
  );

  const removeItem = useCallback((productId: string, size: string) => {
    setItems((current) =>
      current.filter((line) => !sameLine(line, productId, size)),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, line) => sum + line.quantity, 0);
    const subtotalCents = items.reduce(
      (sum, line) => sum + line.priceCents * line.quantity,
      0,
    );
    return {
      items,
      ready,
      count,
      subtotalCents,
      drawerOpen,
      setDrawerOpen,
      addItem,
      setQuantity,
      removeItem,
      clear,
    };
  }, [items, ready, drawerOpen, addItem, setQuantity, removeItem, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart turi būti naudojamas CartProvider viduje");
  }
  return context;
}
