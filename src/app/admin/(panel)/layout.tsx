import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { clearAdminSessionCookie, getAdminSession } from "@/lib/auth";
import { shopConfig } from "@/lib/config";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: { default: "Administravimas", template: `%s | Administravimas – ${shopConfig.name}` },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/prisijungimas");

  async function logout() {
    "use server";
    await clearAdminSessionCookie();
    redirect("/admin/prisijungimas");
  }

  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-ink/8 bg-white px-4 py-6 md:flex">
        <Link href="/admin" className="px-2 font-display text-xl font-semibold uppercase tracking-[0.18em]">
          {shopConfig.name}
        </Link>
        <p className="px-2 text-xs text-ink-muted">Administravimas</p>
        <div className="mt-8 flex-1">
          <AdminNav />
        </div>
        <div className="border-t border-ink/8 pt-4 text-xs text-ink-muted">
          <p className="truncate px-2">{session.email}</p>
          <div className="mt-2 flex flex-col gap-1">
            <Link href="/" className="btn-ghost justify-start text-xs" target="_blank">↗ Atidaryti parduotuvę</Link>
            <form action={logout}>
              <button type="submit" className="btn-ghost w-full justify-start text-xs">Atsijungti</button>
            </form>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-ink/8 bg-white px-4 py-3 md:hidden">
          <Link href="/admin" className="font-display text-lg font-semibold uppercase tracking-[0.18em]">
            {shopConfig.name}
          </Link>
          <form action={logout}>
            <button type="submit" className="btn-ghost text-xs">Atsijungti</button>
          </form>
        </header>
        <div className="border-b border-ink/8 bg-white px-4 py-2 md:hidden">
          <AdminNav horizontal />
        </div>
        <main className="flex-1 px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
