"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export type SettingsState = { error?: string; success?: string } | null;

export async function changePassword(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  const admin = await requireAdmin();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const user = await prisma.adminUser.findUniqueOrThrow({ where: { id: admin.id } });
  if (!(await bcrypt.compare(current, user.passwordHash))) return { error: "Neteisingas dabartinis slaptažodis" };
  if (next.length < 10) return { error: "Naujas slaptažodis turi būti bent 10 simbolių" };
  await prisma.adminUser.update({ where: { id: admin.id }, data: { passwordHash: await bcrypt.hash(next, 12) } });
  return { success: "Slaptažodis pakeistas" };
}

export async function addAdmin(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  await requireAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Neteisingas el. paštas" };
  if (password.length < 10) return { error: "Slaptažodis turi būti bent 10 simbolių" };
  if (await prisma.adminUser.findUnique({ where: { email } })) return { error: "Toks vartotojas jau yra" };
  await prisma.adminUser.create({ data: { email, passwordHash: await bcrypt.hash(password, 12) } });
  revalidatePath("/admin/nustatymai");
  return { success: `Pridėtas ${email}` };
}

export async function removeAdmin(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id"));
  if (id === admin.id) return;
  await prisma.adminUser.delete({ where: { id } });
  revalidatePath("/admin/nustatymai");
}
