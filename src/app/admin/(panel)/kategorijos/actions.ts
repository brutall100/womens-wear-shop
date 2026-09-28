"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/format";

export type CategoryState = { error?: string; ok?: boolean } | null;

export async function saveCategory(_prev: CategoryState, formData: FormData): Promise<CategoryState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "") || null;
  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "") || name);
  const sortOrder = Number(formData.get("sortOrder") ?? 0) || 0;
  if (!name) return { error: "Įveskite pavadinimą" };

  const taken = await prisma.category.findFirst({ where: { slug, NOT: id ? { id } : undefined } });
  if (taken) return { error: `Nuoroda „${slug}“ jau naudojama` };

  if (id) await prisma.category.update({ where: { id }, data: { name, slug, sortOrder } });
  else await prisma.category.create({ data: { name, slug, sortOrder } });

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  await prisma.category.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/", "layout");
}
