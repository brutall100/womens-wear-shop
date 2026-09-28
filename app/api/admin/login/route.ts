import { NextResponse } from "next/server";
import { ADMIN_COOKIE, checkAdminPassword, cookieOptions, signAdminToken } from "@/lib/auth";
import { appOrigin, formToRecord } from "@/lib/origin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const form = formToRecord(await request.formData());
  const url = new URL("/admin/prisijungti", request.url);
  if (!checkAdminPassword(form.password ?? "")) {
    url.searchParams.set("klaida", "1");
    return NextResponse.redirect(url, 303);
  }
  const response = NextResponse.redirect(new URL("/admin/prekes", request.url), 303);
  response.cookies.set(ADMIN_COOKIE, signAdminToken(), {
    ...cookieOptions(),
    secure: appOrigin(request).startsWith("https:"),
  });
  return response;
}
