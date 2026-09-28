"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { parsePriceToCents } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { slugify, uniqueSlug } from "@/lib/slug";

const imageSchema = z.object({
  url: z.string().trim().min(1),
  alt: z.string().trim().max(200).optional().default(""),
});

const variantSchema = z.object({
  size: z.string().trim().min(1).max(10),
  stock: z.coerce.number().int().min(0).max(99999),
});

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Įveskite prekės pavadinimą"),
  slug: z.string().trim().optional().default(""),
  categoryId: z.string().optional().default(""),
  summary: z.string().trim().max(300).optional().default(""),
  description: z.string().trim().max(8000).optional().default(""),
  price: z.string().trim().min(1, "Įveskite kainą"),
  compareAt: z.string().trim().optional().default(""),
  sku: z.string().trim().max(60).optional().default(""),
  color: z.string().trim().max(60).optional().default(""),
  material: z.string().trim().max(200).optional().default(""),
  careInstructions: z.string().trim().max(400).optional().default(""),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  images: z.array(imageSchema).max(10).default([]),
  variants: z.array(variantSchema).max(20).default([]),
});

export type ProductFormValues = z.input<typeof productSchema>;

export type SaveResult =
  | { ok: true; id: string; slug: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

export async function saveProduct(values: ProductFormValues): Promise<SaveResult> {
  await requireAdmin();

  const parsed = productSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, message: "Patikslinkite prekės duomenis", fieldErrors };
  }

  const data = parsed.data;

  const priceCents = parsePriceToCents(data.price);
  if (priceCents === null || priceCents <= 0) {
    return {
      ok: false,
      message: "Neteisinga kaina",
      fieldErrors: { price: "Kaina turi būti didesnė už 0, pvz. 49,90" },
    };
  }

  let compareAtCents: number | null = null;
  if (data.compareAt) {
    compareAtCents = parsePriceToCents(data.compareAt);
    if (compareAtCents === null) {
      return {
        ok: false,
        message: "Neteisinga sena kaina",
        fieldErrors: { compareAt: "Netinkamas formatas, pvz. 69,00" },
      };
    }
    if (compareAtCents <= priceCents) {
      return {
        ok: false,
        message: "Sena kaina turi būti didesnė už dabartinę",
        fieldErrors: { compareAt: "Turi būti didesnė už dabartinę kainą" },
      };
    }
  }

  const sizes = new Set<string>();
  for (const variant of data.variants) {
    const size = variant.size.toUpperCase();
    if (sizes.has(size)) {
      return { ok: false, message: `Dydis ${size} nurodytas du kartus` };
    }
    sizes.add(size);
  }

  const desiredSlug = data.slug ? slugify(data.slug) : slugify(data.name);
  const slug = await uniqueSlug(desiredSlug || data.name, async (candidate) => {
    const existing = await prisma.product.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    return Boolean(existing) && existing?.id !== data.id;
  });

  const fields = {
    name: data.name,
    slug,
    summary: data.summary || null,
    description: data.description || null,
    priceCents,
    compareAtCents,
    sku: data.sku || null,
    color: data.color || null,
    material: data.material || null,
    careInstructions: data.careInstructions || null,
    categoryId: data.categoryId || null,
    isActive: data.isActive,
    isFeatured: data.isFeatured,
    sortOrder: data.sortOrder,
  };

  const product = data.id
    ? await prisma.product.update({ where: { id: data.id }, data: fields })
    : await prisma.product.create({ data: fields });

  await prisma.productImage.deleteMany({ where: { productId: product.id } });
  if (data.images.length > 0) {
    await prisma.productImage.createMany({
      data: data.images.map((image, index) => ({
        productId: product.id,
        url: image.url,
        alt: image.alt || product.name,
        sortOrder: index,
      })),
    });
  }

  await prisma.productVariant.deleteMany({ where: { productId: product.id } });
  if (data.variants.length > 0) {
    await prisma.productVariant.createMany({
      data: data.variants.map((variant, index) => ({
        productId: product.id,
        size: variant.size.toUpperCase(),
        stock: variant.stock,
        sortOrder: index,
      })),
    });
  }

  revalidatePath("/");
  revalidatePath("/parduotuve");
  revalidatePath(`/preke/${product.slug}`);
  revalidatePath("/admin/prekes");

  return { ok: true, id: product.id, slug: product.slug };
}

export async function deleteProduct(id: string): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();

  const usedInOrders = await prisma.orderItem.count({ where: { productId: id } });
  if (usedInOrders > 0) {
    // Užsakymų istorija privalo išlikti, todėl prekę tik paslepiame.
    await prisma.product.update({ where: { id }, data: { isActive: false } });
    revalidatePath("/admin/prekes");
    return {
      ok: true,
      message: "Prekė yra užsakymuose, todėl ji buvo paslėpta, o ne ištrinta",
    };
  }

  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/prekes");
  revalidatePath("/parduotuve");
  return { ok: true };
}

export async function toggleProductActive(id: string, isActive: boolean): Promise<void> {
  await requireAdmin();
  await prisma.product.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/prekes");
  revalidatePath("/parduotuve");
}
