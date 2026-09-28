export type DeliveryMethod = {
  id: string;
  label: string;
  detail: string;
  priceCents: number;
};

export const DELIVERIES: DeliveryMethod[] = [
  {
    id: "shop",
    label: "Atsiėmimas",
    detail: "Susitariame el. paštu arba telefonu",
    priceCents: 0,
  },
  {
    id: "lp",
    label: "LP Express paštomatas",
    detail: "Visoje Lietuvoje",
    priceCents: 349,
  },
  {
    id: "omniva",
    label: "Omniva paštomatas",
    detail: "Visoje Lietuvoje",
    priceCents: 349,
  },
  {
    id: "courier",
    label: "Kurjeris",
    detail: "Pristatymas nurodytu adresu",
    priceCents: 599,
  },
];

export function deliveryById(id: string): DeliveryMethod | undefined {
  return DELIVERIES.find((method) => method.id === id);
}

export function shippingCents(subtotalCents: number, methodPriceCents: number, freeFromCents: number): number {
  if (methodPriceCents <= 0) return 0;
  if (subtotalCents >= freeFromCents) return 0;
  return methodPriceCents;
}
