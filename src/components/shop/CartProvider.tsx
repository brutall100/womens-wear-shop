"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export interface CartItem {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  size: string;
  priceCents: number;
  imageUrl: string | null;
  quantity: number;
  maxQuantity: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotalCents: number;
  hydrated: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clear: () => void;
}

const STORAGE_KEY = "muza-cart-v1";
const EMPTY: CartItem[] = [];

/* localStorage-backed external store so the cart survives reloads and
   stays consistent across tabs without setState-in-effect hydration. */
let cache: CartItem[] | null = null;
const listeners = new Set<() => void>();

function read(): CartItem[] {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    cache = raw ? (JSON.parse(raw) as CartItem[]) : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(next: CartItem[]) {
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage full or unavailable */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const getServerSnapshot = () => EMPTY;
const subscribeHydration = () => () => {};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, read, getServerSnapshot);
  const hydrated = useSyncExternalStore(subscribeHydration, () => true, () => false);

  const addItem = useCallback<CartContextValue["addItem"]>((item, quantity = 1) => {
    const prev = read();
    const existing = prev.find((i) => i.variantId === item.variantId);
    write(
      existing
        ? prev.map((i) =>
            i.variantId === item.variantId
              ? { ...i, ...item, quantity: Math.min(i.quantity + quantity, item.maxQuantity) }
              : i,
          )
        : [...prev, { ...item, quantity: Math.min(quantity, item.maxQuantity) }],
    );
  }, []);

  const updateQuantity = useCallback<CartContextValue["updateQuantity"]>((variantId, quantity) => {
    write(
      read()
        .map((i) =>
          i.variantId === variantId
            ? { ...i, quantity: Math.max(0, Math.min(quantity, i.maxQuantity)) }
            : i,
        )
        .filter((i) => i.quantity > 0),
    );
  }, []);

  const removeItem = useCallback((variantId: string) => {
    write(read().filter((i) => i.variantId !== variantId));
  }, []);

  const clear = useCallback(() => write(EMPTY), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotalCents = items.reduce((sum, i) => sum + i.quantity * i.priceCents, 0);
    return { items, count, subtotalCents, hydrated, addItem, updateQuantity, removeItem, clear };
  }, [items, hydrated, addItem, updateQuantity, removeItem, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart turi būti naudojamas CartProvider viduje");
  return ctx;
}
