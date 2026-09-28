"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { parsePrice, slugify } from "@/lib/format";
import { deleteImage, saveImage } from "@/lib/uploads";

export type ProductFormState = { error?: string; fieldErrors?: Record<string, string> } | null;

const variantSchema = z.array(
  z.object({
    id: z.string().optional(),
    size: z.string().trim().min(1, "Įveskite dydį"),
    stock: z.coerce.number().int().min(0, "Likutis negali būti neigiamas"),
  }),
);

export async function saveProduct(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "") || null;
  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "") || name);
  const description = String(formData.get("description") ?? "").trim();
  const price = parsePrice(String(formData.get("price") ?? ""));
  const compareRaw = String(formData.get("compareAtPrice") ?? "").trim();
  const compareAtPrice = compareRaw ? parsePrice(compareRaw) : null;
  const categoryId = String(formData.get("categoryId") ?? "") || null;
  const isActive = formData.get("isActive") === "on";
  const isFeatured = formData.get("isFeatured") === "on";

  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = "Įveskite pavadinimą";
  if (!slug) fieldErrors.slug = "Netinkamas nuorodos pavadinimas";
  if (price == null || price <= 0) fieldErrors.price = "Įveskite kainą, pvz. 49,90";
  if (compareRaw && compareAtPrice == null) fieldErrors.compareAtPrice = "Netinkama kaina";
  if (compareAtPrice != null && price != null && compareAtPrice <= price) {
    fieldErrors.compareAtPrice = "Sena kaina turi būti didesnė už dabartinę";
  }

  const variantsParsed = variantSchema.safeParse(JSON.parse(String(formData.get("variants") ?? "[]")));
  if (!variantsParsed.success) fieldErrors.variants = variantsParsed.error.issues[0].message;
  const variants = variantsParsed.success ? variantsParsed.data : [];
  if (variantsParsed.success && variants.length === 0) fieldErrors.variants = "Pridėkite bent vieną dydį";
  const sizes = variants.map((v) => v.size.toLowerCase());
  if (new Set(sizes).size !== sizes.length) fieldErrors.variants = "Dydžiai kartojasi";

  const slugTaken = slug && (await prisma.product.findFirst({ where: { slug, NOT: id ? { id } : undefined } }));
  if (slugTaken) fieldErrors.slug = "Tokia nuoroda jau naudojama kitai prekei";

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors, error: "Patikrinkite pažymėtus laukus" };

  const keptImages: string[] = JSON.parse(String(formData.get("existingImages") ?? "[]"));
  const newFiles = formData.getAll("newImages").filter((f): f is File => f instanceof File && f.size > 0);

  let uploaded: string[];
  try {
    uploaded = await Promise.all(newFiles.map(saveImage));
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Nepavyko įkelti nuotraukų" };
  }
  const imageUrls = [...keptImages, ...uploaded];

  const data = { name, slug, description, price: price!, compareAtPrice, categoryId, isActive, isFeatured };

  let productId = id;
  let removedImages: string[] = [];
  await prisma.$transaction(async (tx) => {
    if (productId) {
      await tx.product.update({ where: { id: productId }, data });
    } else {
      productId = (await tx.product.create({ data })).id;
    }

    const existingImages = await tx.productImage.findMany({ where: { productId } });
    removedImages = existingImages.filter((img) => !imageUrls.includes(img.url)).map((img) => img.url);
    await tx.productImage.deleteMany({ where: { productId } });
    await tx.productImage.createMany({
      data: imageUrls.map((url, i) => ({ productId: productId!, url, sortOrder: i })),
    });

    const keepIds = variants.filter((v) => v.id).map((v) => v.id!);
    await tx.productVariant.deleteMany({ where: { productId, id: { notIn: keepIds } } });
    for (const [i, v] of variants.entries()) {
      if (v.id) {
        await tx.productVariant.updateMany({
          where: { id: v.id, productId: productId! },
          data: { size: v.size, stock: v.stock, sortOrder: i },
        });
      } else {
        await tx.productVariant.create({ data: { productId: productId!, size: v.size, stock: v.stock, sortOrder: i } });
      }
    }
  });

  await Promise.all(removedImages.map(deleteImage));
  revalidatePath("/", "layout");
  redirect(`/admin/prekes/${productId}?issaugota=1`);
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const product = await prisma.product.findUnique({ where: { id }, include: { images: true } });
  if (!product) return;
  await prisma.product.delete({ where: { id } });
  await Promise.all(product.images.map((img) => deleteImage(img.url)));
  revalidatePath("/", "layout");
  redirect("/admin/prekes");
}

export async function toggleProductActive(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return;
  await prisma.product.update({ where: { id }, data: { isActive: !product.isActive } });
  revalidatePath("/", "layout");
}
