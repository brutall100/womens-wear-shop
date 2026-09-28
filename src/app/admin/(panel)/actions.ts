"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { parseEurToCents, slugify } from "@/lib/format";
import { cancelOrder } from "@/lib/orders";
import { saveUploadedImage } from "@/lib/uploads";

export interface ActionState {
  error?: string;
  success?: string;
}

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/prisijungimas");
}

function revalidateShop() {
  revalidatePath("/", "layout");
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const root = slugify(base) || "preke";
  let candidate = root;
  for (let i = 2; ; i++) {
    const existing = await prisma.product.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${root}-${i}`;
  }
}

/* ----------------------------- Products -------------------------------- */

const productSchema = z.object({
  name: z.string().trim().min(2, "Pavadinimas per trumpas.").max(160),
  slug: z.string().trim().max(80).optional(),
  description: z.string().trim().max(5000).optional().default(""),
  price: z.string().trim().min(1, "Įveskite kainą."),
  compareAtPrice: z.string().trim().optional(),
  sku: z.string().trim().max(60).optional(),
  categoryId: z.string().optional(),
  isActive: z.string().optional(),
  isFeatured: z.string().optional(),
  imageUrl: z.string().trim().optional(),
});

function parseVariants(formData: FormData): { size: string; stock: number }[] {
  const sizes = formData.getAll("variantSize").map(String);
  const stocks = formData.getAll("variantStock").map(String);
  const seen = new Set<string>();
  const result: { size: string; stock: number }[] = [];
  sizes.forEach((rawSize, i) => {
    const size = rawSize.trim();
    if (!size || seen.has(size)) return;
    seen.add(size);
    const stock = Math.max(0, parseInt(stocks[i] ?? "0", 10) || 0);
    result.push({ size, stock });
  });
  return result;
}

async function collectImages(formData: FormData, imageUrl: string | undefined) {
  const urls: string[] = [];
  for (const entry of formData.getAll("images")) {
    if (entry instanceof File && entry.size > 0) {
      urls.push(await saveUploadedImage(entry));
    }
  }
  if (imageUrl && /^(https?:\/\/|\/)/.test(imageUrl)) urls.push(imageUrl);
  return urls;
}

export async function saveProduct(
  productId: string | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = productSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Neteisingi duomenys." };
  const d = parsed.data;

  const priceCents = parseEurToCents(d.price);
  if (priceCents === null || priceCents <= 0) return { error: "Neteisinga kaina. Pvz. 49,90" };
  let compareAtPriceCents: number | null = null;
  if (d.compareAtPrice) {
    compareAtPriceCents = parseEurToCents(d.compareAtPrice);
    if (compareAtPriceCents === null) return { error: "Neteisinga kaina prieš nuolaidą." };
    if (compareAtPriceCents <= priceCents) compareAtPriceCents = null;
  }

  const variants = parseVariants(formData);
  if (variants.length === 0) return { error: "Pridėkite bent vieną dydį." };

  let newImageUrls: string[];
  try {
    newImageUrls = await collectImages(formData, d.imageUrl);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Nepavyko įkelti nuotraukos." };
  }

  const slug = await uniqueSlug(d.slug || d.name, productId ?? undefined);
  const base = {
    name: d.name,
    slug,
    description: d.description ?? "",
    priceCents,
    compareAtPriceCents,
    sku: d.sku || null,
    categoryId: d.categoryId || null,
    isActive: d.isActive === "on",
    isFeatured: d.isFeatured === "on",
  };

  let id = productId;
  if (!id) {
    const created = await prisma.product.create({
      data: {
        ...base,
        variants: { create: variants.map((v, i) => ({ ...v, position: i })) },
        images: { create: newImageUrls.map((url, i) => ({ url, alt: d.name, position: i })) },
      },
    });
    id = created.id;
  } else {
    const existing = await prisma.product.findUnique({
      where: { id },
      include: { variants: true, images: { orderBy: { position: "desc" }, take: 1 } },
    });
    if (!existing) return { error: "Prekė nerasta." };

    const keepSizes = new Set(variants.map((v) => v.size));
    const nextPosition = (existing.images[0]?.position ?? -1) + 1;

    await prisma.$transaction([
      prisma.product.update({ where: { id }, data: base }),
      prisma.productVariant.deleteMany({
        where: { productId: id, size: { notIn: [...keepSizes] } },
      }),
      ...variants.map((v, i) =>
        prisma.productVariant.upsert({
          where: { productId_size: { productId: id!, size: v.size } },
          update: { stock: v.stock, position: i },
          create: { productId: id!, size: v.size, stock: v.stock, position: i },
        }),
      ),
      ...newImageUrls.map((url, i) =>
        prisma.productImage.create({
          data: { productId: id!, url, alt: d.name, position: nextPosition + i },
        }),
      ),
    ]);
  }

  revalidateShop();
  if (!productId) redirect(`/admin/prekes/${id}?sukurta=1`);
  return { success: "Prekė išsaugota." };
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) await prisma.product.delete({ where: { id } });
  revalidateShop();
  redirect("/admin/prekes");
}

export async function toggleProductActive(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const product = await prisma.product.findUnique({ where: { id } });
  if (product) {
    await prisma.product.update({ where: { id }, data: { isActive: !product.isActive } });
  }
  revalidateShop();
}

export async function removeProductImage(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("imageId") ?? "");
  if (id) await prisma.productImage.delete({ where: { id } });
  revalidateShop();
}

export async function moveProductImage(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("imageId") ?? "");
  const direction = formData.get("direction") === "up" ? -1 : 1;
  const image = await prisma.productImage.findUnique({ where: { id } });
  if (!image) return;
  const siblings = await prisma.productImage.findMany({
    where: { productId: image.productId },
    orderBy: { position: "asc" },
  });
  const index = siblings.findIndex((s) => s.id === id);
  const swapWith = siblings[index + direction];
  if (!swapWith) return;
  await prisma.$transaction(
    siblings.map((s, i) => {
      let position = i;
      if (s.id === id) position = index + direction;
      if (s.id === swapWith.id) position = index;
      return prisma.productImage.update({ where: { id: s.id }, data: { position } });
    }),
  );
  revalidateShop();
}

/* ---------------------------- Categories ------------------------------- */

export async function saveCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const position = parseInt(String(formData.get("position") ?? "0"), 10) || 0;
  if (name.length < 2) return { error: "Pavadinimas per trumpas." };

  const slugBase = slugify(name) || "kategorija";
  let slug = slugBase;
  for (let i = 2; ; i++) {
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (!existing || existing.id === id) break;
    slug = `${slugBase}-${i}`;
  }

  if (id) {
    await prisma.category.update({ where: { id }, data: { name, slug, position } });
  } else {
    await prisma.category.create({ data: { name, slug, position } });
  }
  revalidateShop();
  return { success: "Kategorija išsaugota." };
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) await prisma.category.delete({ where: { id } });
  revalidateShop();
}

/* ------------------------------ Orders --------------------------------- */

const ORDER_STATUSES = ["NEW", "PAID", "SHIPPED", "COMPLETED", "CANCELLED"] as const;

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) return;

  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return;

  if (status === "CANCELLED") {
    await cancelOrder(order);
  } else {
    await prisma.order.update({ where: { id }, data: { status } });
  }
  revalidatePath("/admin/uzsakymai");
  revalidatePath(`/admin/uzsakymai/${id}`);
}

export async function markOrderPaidManually(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order || order.paymentStatus === "PAID") return;
  await prisma.order.update({
    where: { id },
    data: {
      paymentStatus: "PAID",
      paymentState: "manual",
      paymentMethod: "manual",
      status: order.status === "NEW" ? "PAID" : order.status,
    },
  });
  revalidatePath("/admin/uzsakymai");
  revalidatePath(`/admin/uzsakymai/${id}`);
}
