"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { parsePriceToCents } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

export async function saveShippingMethod(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return;

  const code =
    slugify(String(formData.get("code") ?? "").trim() || name) || `budas-${Date.now()}`;
  const description = String(formData.get("description") ?? "").trim();
  const priceCents = parsePriceToCents(String(formData.get("price") ?? "0")) ?? 0;
  const freeFromRaw = String(formData.get("freeFrom") ?? "").trim();
  const freeFromCents = freeFromRaw ? parsePriceToCents(freeFromRaw) : null;

  const data = {
    name,
    description: description || null,
    priceCents,
    freeFromCents,
    isActive: formData.get("isActive") === "on",
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
  };

  if (id) {
    await prisma.shippingMethod.update({ where: { id }, data });
  } else {
    await prisma.shippingMethod.create({ data: { ...data, code } });
  }

  revalidatePath("/admin/pristatymas");
  revalidatePath("/pristatymas");
  revalidatePath("/atsiskaitymas");
}

export async function deleteShippingMethod(id: string): Promise<void> {
  await requireAdmin();
  await prisma.shippingMethod.delete({ where: { id } });
  revalidatePath("/admin/pristatymas");
  revalidatePath("/pristatymas");
}
