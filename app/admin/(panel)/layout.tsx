import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/AdminNav";
import { ADMIN_COOKIE, adminPasswordConfigured, verifyAdminToken } from "@/lib/auth";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  if (!verifyAdminToken(jar.get(ADMIN_COOKIE)?.value)) redirect("/admin/prisijungti");
  return (
    <div className="lg:grid lg:grid-cols-[220px_1fr]">
      <AdminNav />
      <div className="px-5 py-8 lg:px-10">
        {adminPasswordConfigured() ? null : (
          <p className="mb-6 border border-line bg-card px-4 py-3 text-sm">
            Naudojamas pradinis slaptažodis <span className="num">mot-admin</span>. Prieš viešinant nustatykite ADMIN_PASSWORD.
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
