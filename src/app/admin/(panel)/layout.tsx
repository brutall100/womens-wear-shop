import Link from "next/link";
import { logout } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/auth";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col lg:flex-row">
      <aside className="border-b border-line bg-shell lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-4 p-5 lg:block">
          <div>
            <Link href="/admin" className="font-display text-xl tracking-[0.25em] pl-[0.25em]">
              {site.name}
            </Link>
            <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted">
              Administravimas
            </p>
          </div>
        </div>

        <div className="px-2 pb-4 lg:px-3">
          <AdminNav />
        </div>

        <div className="mt-auto border-t border-line p-4 lg:p-5">
          <p className="truncate text-xs text-muted">{admin.email}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
            <Link href="/" target="_blank" className="text-muted link-underline hover:text-ink">
              Parduotuvė
            </Link>
            <form action={logout}>
              <button type="submit" className="text-muted link-underline hover:text-danger cursor-pointer">
                Atsijungti
              </button>
            </form>
          </div>
        </div>
      </aside>

      <main className="flex-1 px-5 py-7 lg:px-8">{children}</main>
    </div>
  );
}
