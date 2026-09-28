export type ProductImage = { id: string; path: string; sort: number };

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  category: string;
  sizes: string[];
  stock: number;
  published: boolean;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
};

export type ProductInput = {
  name: string;
  description: string;
  priceCents: number;
  category: string;
  sizes: string[];
  stock: number;
  published: boolean;
};

export type OrderItem = {
  id: string;
  productId: string;
  name: string;
  size: string;
  priceCents: number;
  qty: number;
};

export type Order = {
  id: string;
  stamp: string;
  status: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  postal: string;
  note: string;
  deliveryId: string;
  deliveryLabel: string;
  deliveryCents: number;
  subtotalCents: number;
  amountCents: number;
  vkMsg: string;
  createdAt: string;
  paidAt: string | null;
  bankPayload: string | null;
  items: OrderItem[];
};

export type CheckoutCustomer = {
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  postal: string;
  note: string;
  deliveryId: string;
  deliveryLabel: string;
  deliveryCents: number;
};

export type ShopConfig = {
  email: string;
  phone: string;
  pickup: string;
  freeShippingCents: number;
};

export type CatalogQuery = {
  publishedOnly?: boolean;
  category?: string;
  q?: string;
  sort?: string;
};
