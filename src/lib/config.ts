function intEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : fallback;
}

export const shopConfig = {
  name: process.env.NEXT_PUBLIC_SHOP_NAME || "Mūza",
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  shipping: {
    courier: intEnv("SHIPPING_COURIER_CENTS", 499),
    parcel_locker: intEnv("SHIPPING_PARCEL_LOCKER_CENTS", 299),
    freeFrom: intEnv("FREE_SHIPPING_FROM_CENTS", 10000),
  },
};

export type ShippingMethod = keyof typeof shopConfig.shipping extends infer K
  ? Exclude<K, "freeFrom">
  : never;

export const SHIPPING_METHODS: ShippingMethod[] = ["courier", "parcel_locker"];

export function shippingCost(method: ShippingMethod, subtotalCents: number): number {
  const { freeFrom } = shopConfig.shipping;
  if (freeFrom > 0 && subtotalCents >= freeFrom) return 0;
  return shopConfig.shipping[method];
}

export const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "Universalus"];
