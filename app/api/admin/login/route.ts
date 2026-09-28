import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminAccess, checkAdminPassword, cookieOptions, loginBlocked, recordLogin, signAdminToken } from "@/lib/auth";
import { appOrigin, clientKey } from "@/lib/origin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (adminAccess() === "locked") {
    return NextResponse.json({ error: "Prisijungimas išjungtas. Nustatykite ADMIN_PASSWORD_HASH (žr. README)." }, { status: 403 });
  }
  const key = clientKey(request);
  if (loginBlocked(key)) {
    return NextResponse.json({ error: "Per daug bandymų. Pabandykite po 10 minučių." }, { status: 429 });
  }
  const body = (await request.json().catch(() => null)) as { password?: unknown } | null;
  const password = typeof body?.password === "string" ? body.password : "";
  const ok = checkAdminPassword(password);
  recordLogin(key, ok);
  if (!ok) return NextResponse.json({ error: "Slaptažodis netinka." }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, signAdminToken(), cookieOptions(appOrigin(request).startsWith("https:")));
  return response;
}
