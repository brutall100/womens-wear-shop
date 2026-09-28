"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/session";

export async function login(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = await prisma.adminUser.findUnique({ where: { email } });
  const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !valid) {
    await new Promise((r) => setTimeout(r, 400));
    return { error: "Neteisingas el. paštas arba slaptažodis" };
  }

  const token = await signSession({ userId: user.id, email: user.email });
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/prisijungti");
}
