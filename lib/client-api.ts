/**
 * Everything the browser asks the shop to do goes through here.
 * Server mode calls the API routes; the GitHub Pages demo changes the browser store instead.
 */
import type { CheckoutRequest } from "./checkout";
import * as demo from "./demo/store";
import { blobToDataUrl, shrinkImage } from "./image-resize";
import { isDemo, routes } from "./routes";

export type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const OFFLINE = "Nepavyko susisiekti su parduotuve. Patikrinkite interneto ryšį ir bandykite dar kartą.";

async function call<T extends object>(url: string, init: RequestInit): Promise<Result<T>> {
  try {
    const response = await fetch(url, init);
    const body = (await response.json().catch(() => ({}))) as T & { error?: string };
    if (!response.ok) return { ok: false, error: body.error || "Nepavyko. Pabandykite dar kartą." };
    return { ok: true, ...body };
  } catch {
    return { ok: false, error: OFFLINE };
  }
}

function json(method: string, body: unknown): RequestInit {
  return { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) };
}

function fail(error: unknown): { ok: false; error: string } {
  return { ok: false, error: error instanceof Error ? error.message : "Nepavyko. Pabandykite dar kartą." };
}

// ---------- payments ----------

/** Either a signed form for the bank (server) or a page to open (demo). */
export type PaymentStart = { kind: "form"; action: string; fields: Record<string, string> } | { kind: "go"; href: string };

type ServerPayment = { payment: { action: string; fields: Record<string, string> } };

export async function startCheckout(payload: CheckoutRequest): Promise<Result<{ payment: PaymentStart }>> {
  if (isDemo) {
    try {
      const result = demo.checkout(payload);
      if ("error" in result) return { ok: false, error: result.error };
      return { ok: true, payment: { kind: "go", href: routes.bank(result.stamp) } };
    } catch (error) {
      return fail(error);
    }
  }
  const result = await call<ServerPayment>("/api/checkout", json("POST", payload));
  if (!result.ok) return result;
  return { ok: true, payment: { kind: "form", ...result.payment } };
}

export async function startPayAgain(stamp: string): Promise<Result<{ payment: PaymentStart }>> {
  if (isDemo) return { ok: true, payment: { kind: "go", href: routes.bank(stamp) } };
  const result = await call<ServerPayment>(`/api/orders/${stamp}/pay`, { method: "POST" });
  if (!result.ok) return result;
  return { ok: true, payment: { kind: "form", ...result.payment } };
}

/** Sends the buyer to the bank. A real bank link needs a POST form, so one is built and submitted. */
export function openPayment(payment: PaymentStart, navigate: (href: string) => void): void {
  if (payment.kind === "go") {
    navigate(payment.href);
    return;
  }
  const form = document.createElement("form");
  form.method = "post";
  form.action = payment.action;
  for (const [name, value] of Object.entries(payment.fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.append(input);
  }
  document.body.append(form);
  form.submit();
}

// ---------- admin ----------

export async function adminLogin(password: string): Promise<Result> {
  if (isDemo) return demo.demoLogin(password) ? { ok: true } : { ok: false, error: "Slaptažodis netinka." };
  return call("/api/admin/login", json("POST", { password }));
}

export async function adminLogout(): Promise<Result> {
  if (isDemo) {
    demo.demoLogout();
    return { ok: true };
  }
  return call("/api/admin/logout", { method: "POST" });
}

export type ProductPayload = {
  name: string;
  description: string;
  price: string;
  category: string;
  stock: number;
  published: boolean;
  sizes: string[];
};

export async function saveProduct(id: string | null, payload: ProductPayload): Promise<Result<{ product: { id: string } }>> {
  if (isDemo) {
    try {
      const result = demo.saveProduct(id, payload);
      return "error" in result ? { ok: false, error: result.error } : { ok: true, product: result.product };
    } catch (error) {
      return fail(error);
    }
  }
  return call(id ? `/api/admin/products/${id}` : "/api/admin/products", json(id ? "PATCH" : "POST", payload));
}

export async function deleteProduct(id: string): Promise<Result> {
  if (isDemo) {
    try {
      demo.deleteProduct(id);
      return { ok: true };
    } catch (error) {
      return fail(error);
    }
  }
  return call(`/api/admin/products/${id}`, { method: "DELETE" });
}

export type SavedImage = { id: string; path: string };

export async function uploadImages(productId: string, files: File[]): Promise<Result<{ images: SavedImage[] }>> {
  if (files.length === 0) return { ok: true, images: [] };
  let blobs: Blob[];
  try {
    blobs = await Promise.all(files.map((file) => shrinkImage(file)));
  } catch {
    if (isDemo) return { ok: false, error: "Šios nuotraukos naršyklė neatidaro. Pabandykite JPG, PNG arba WEBP." };
    blobs = files;
  }
  if (isDemo) {
    try {
      const urls = await Promise.all(blobs.map((blob) => blobToDataUrl(blob)));
      return { ok: true, images: demo.addImages(productId, urls) };
    } catch (error) {
      return fail(error);
    }
  }
  const data = new FormData();
  blobs.forEach((blob, index) => data.append("files", blob, files[index]?.name ?? `nuotrauka-${index + 1}`));
  return call(`/api/admin/products/${productId}/images`, { method: "POST", body: data });
}

export async function deleteImage(imageId: string): Promise<Result> {
  if (isDemo) {
    try {
      demo.deleteImage(imageId);
      return { ok: true };
    } catch (error) {
      return fail(error);
    }
  }
  return call(`/api/admin/images/${imageId}`, { method: "DELETE" });
}

export async function saveSettings(group: "shop" | "seb", payload: Record<string, unknown>): Promise<Result> {
  if (isDemo) {
    if (group === "seb") return { ok: false, error: "Demo svetainėje SEB raktai nesaugomi. Paleiskite parduotuvę su serveriu." };
    try {
      const error = demo.saveShop(payload);
      return error ? { ok: false, ...error } : { ok: true };
    } catch (caught) {
      return fail(caught);
    }
  }
  return call("/api/admin/settings", json("POST", { group, ...payload }));
}

export async function changeOrderStatus(id: string, status: string): Promise<Result> {
  if (isDemo) {
    try {
      const error = demo.setOrderStatus(id, status);
      return error ? { ok: false, ...error } : { ok: true };
    } catch (caught) {
      return fail(caught);
    }
  }
  return call(`/api/admin/orders/${id}`, json("PATCH", { status }));
}
