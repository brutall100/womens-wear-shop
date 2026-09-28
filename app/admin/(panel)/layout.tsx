import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { ADMIN_COOKIE, adminAccess, DEV_PASSWORD, verifyAdminToken } from "@/lib/auth";
import { routes } from "@/lib/routes";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const jar = await cookies();
  if (!verifyAdminToken(jar.get(ADMIN_COOKIE)?.value)) redirect(routes.adminLogin);
  return (
    <AdminShell
      notice={
        adminAccess() === "dev-default" ? (
          <p className="notice mb-8 max-w-3xl">
            Naudojamas kūrimo slaptažodis <span className="price">{DEV_PASSWORD}</span>. Prieš viešinant nustatykite ADMIN_PASSWORD_HASH.
          </p>
        ) : null
      }
    >
      {children}
    </AdminShell>
  );
}
