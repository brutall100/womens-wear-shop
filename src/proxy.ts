import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE } from "@/lib/auth-constants";

/**
 * Optimistic admin guard: redirects unauthenticated visitors away from /admin
 * before the page renders. The signed cookie is fully verified in the admin layout.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/prisijungimas")) {
    if (!request.cookies.get(ADMIN_COOKIE)?.value) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/prisijungimas";
      url.searchParams.set("grizti", pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
