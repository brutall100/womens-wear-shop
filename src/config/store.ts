/**
 * Pagrindiniai parduotuvės nustatymai. Pakeiskite įmonės duomenis prieš paleidžiant.
 */
export const store = {
  name: "LUMA",
  tagline: "Moteriški drabužiai kasdienai ir šventei",
  email: "info@luma.lt",
  phone: "+370 600 00000",
  company: {
    name: "UAB „Pavyzdys“",
    code: "000000000",
    vatCode: "LT000000000",
    address: "Gedimino pr. 1, LT-01103 Vilnius",
  },
  freeShippingFrom: 6000,
};

export type ShippingMethod = {
  id: string;
  name: string;
  description: string;
  price: number;
  /** Ar klientas turi nurodyti paštomatą vietoj namų adreso */
  requiresLocker?: boolean;
};

export const shippingMethods: ShippingMethod[] = [
  {
    id: "omniva",
    name: "Omniva paštomatas",
    description: "Pristatymas per 1–3 d. d.",
    price: 299,
    requiresLocker: true,
  },
  {
    id: "lpexpress",
    name: "LP Express paštomatas",
    description: "Pristatymas per 1–3 d. d.",
    price: 299,
    requiresLocker: true,
  },
  {
    id: "courier",
    name: "Kurjeris į namus",
    description: "DPD kurjeris per 1–2 d. d.",
    price: 499,
  },
];

export function shippingPrice(method: ShippingMethod, subtotal: number) {
  return subtotal >= store.freeShippingFrom ? 0 : method.price;
}

export const orderStatuses: Record<string, { label: string; tone: string }> = {
  PENDING_PAYMENT: { label: "Laukiama apmokėjimo", tone: "bg-amber-100 text-amber-800" },
  PAYMENT_FAILED: { label: "Apmokėjimas nepavyko", tone: "bg-red-100 text-red-800" },
  PAID: { label: "Apmokėtas", tone: "bg-emerald-100 text-emerald-800" },
  PROCESSING: { label: "Ruošiamas", tone: "bg-sky-100 text-sky-800" },
  SHIPPED: { label: "Išsiųstas", tone: "bg-indigo-100 text-indigo-800" },
  COMPLETED: { label: "Įvykdytas", tone: "bg-stone-200 text-stone-800" },
  CANCELLED: { label: "Atšauktas", tone: "bg-stone-100 text-stone-500" },
};
