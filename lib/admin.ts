import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyAdminToken } from "./auth";

export async function requireAdmin(): Promise<NextResponse | null> {
  const jar = await cookies();
  if (!verifyAdminToken(jar.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "Reikia prisijungti." }, { status: 401 });
  }
  return null;
}
