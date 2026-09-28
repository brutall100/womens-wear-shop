"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify, uniqueSlug } from "@/lib/slug";

export type CategoryState = { error?: string; success?: string };

export async function saveCategory(
  _prev: CategoryState,
  formData: FormData,
): Promise<CategoryState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0) || 0;
  const isActive = formData.get("isActive") === "on";

  if (name.length < 2) {
    return { error: "Įveskite kategorijos pavadinimą" };
  }

  const slugSource = String(formData.get("slug") ?? "").trim() || name;
  const slug = await uniqueSlug(slugify(slugSource), async (candidate) => {
    const existing = await prisma.category.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    return Boolean(existing) && existing?.id !== id;
  });

  const data = { name, slug, description: description || null, sortOrder, isActive };

  if (id) {
    await prisma.category.update({ where: { id }, data });
  } else {
    await prisma.category.create({ data });
  }

  revalidatePath("/admin/kategorijos");
  revalidatePath("/parduotuve");
  revalidatePath("/");

  return { success: id ? "Kategorija atnaujinta" : "Kategorija sukurta" };
}

export async function deleteCategory(id: string): Promise<void> {
  await requireAdmin();
  // Prekės lieka, tik netenka kategorijos (schemoje nurodyta SetNull).
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/kategorijos");
  revalidatePath("/parduotuve");
  revalidatePath("/");
}
