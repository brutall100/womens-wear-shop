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

export type CartState = {
  items: CartItem[];
  /** Ar krepšelis jau nuskaitytas iš naršyklės atminties */
  ready: boolean;
};

const STORAGE_KEY = "veja_cart_v1";
const EMPTY: CartState = { items: [], ready: false };

/**
 * Krepšelis laikomas už React ribų (localStorage), todėl komponentai jį skaito
 * per `useSyncExternalStore` – taip išvengiama būsenos nustatymo efektuose.
 */
let state: CartState = EMPTY;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function read(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // privačiame režime saugojimas gali būti neleidžiamas – krepšelis veiks tik sesijai
  }
}

function setItems(items: CartItem[], persist = true) {
  state = { items, ready: true };
  if (persist) write(items);
  emit();
}

function handleStorage(event: StorageEvent) {
  if (event.key === STORAGE_KEY) setItems(read(), false);
}

export function subscribe(listener: () => void): () => void {
  if (!state.ready) {
    state = { items: read(), ready: true };
  }
  if (listeners.size === 0) {
    window.addEventListener("storage", handleStorage);
  }
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener("storage", handleStorage);
    }
  };
}

export function getSnapshot(): CartState {
  return state;
}

export function getServerSnapshot(): CartState {
  return EMPTY;
}

function sameLine(line: CartItem, productId: string, size: string): boolean {
  return line.productId === productId && line.size === size;
}

export function addItem(item: CartItem): void {
  const existing = state.items.find((line) =>
    sameLine(line, item.productId, item.size),
  );

  if (!existing) {
    setItems([...state.items, item]);
    return;
  }

  const limit = item.stock > 0 ? item.stock : existing.quantity + item.quantity;
  setItems(
    state.items.map((line) =>
      sameLine(line, item.productId, item.size)
        ? { ...line, quantity: Math.min(line.quantity + item.quantity, limit) }
        : line,
    ),
  );
}

export function setQuantity(productId: string, size: string, quantity: number): void {
  setItems(
    state.items
      .map((line) =>
        sameLine(line, productId, size)
          ? { ...line, quantity: Math.max(0, quantity) }
          : line,
      )
      .filter((line) => line.quantity > 0),
  );
}

export function removeItem(productId: string, size: string): void {
  setItems(state.items.filter((line) => !sameLine(line, productId, size)));
}

export function clear(): void {
  setItems([]);
}
