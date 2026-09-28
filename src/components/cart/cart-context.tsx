"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import * as cart from "@/lib/cart-store";

export type { CartItem } from "@/lib/cart-store";

type CartContextValue = {
  items: cart.CartItem[];
  ready: boolean;
  count: number;
  subtotalCents: number;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  addItem: (item: cart.CartItem) => void;
  setQuantity: (productId: string, size: string, quantity: number) => void;
  removeItem: (productId: string, size: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const state = useSyncExternalStore(
    cart.subscribe,
    cart.getSnapshot,
    cart.getServerSnapshot,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  const addItem = useCallback((item: cart.CartItem) => {
    cart.addItem(item);
    setDrawerOpen(true);
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const count = state.items.reduce((sum, line) => sum + line.quantity, 0);
    const subtotalCents = state.items.reduce(
      (sum, line) => sum + line.priceCents * line.quantity,
      0,
    );

    return {
      items: state.items,
      ready: state.ready,
      count,
      subtotalCents,
      drawerOpen,
      setDrawerOpen,
      addItem,
      setQuantity: cart.setQuantity,
      removeItem: cart.removeItem,
      clear: cart.clear,
    };
  }, [state, drawerOpen, addItem]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart turi būti naudojamas CartProvider viduje");
  }
  return context;
}
