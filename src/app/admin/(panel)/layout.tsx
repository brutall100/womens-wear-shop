import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { store } from "@/config/store";
import { logout } from "../prisijungti/actions";
import { AdminNav } from "./admin-nav";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Administravimas", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f4f0] lg:flex-row">
      <aside className="border-b border-line bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-60 lg:flex-col lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between px-5 py-4 lg:py-6">
          <Link href="/admin" className="font-serif text-2xl font-semibold tracking-[0.2em]">
            {store.name}
          </Link>
          <Link href="/" target="_blank" className="text-xs text-muted hover:text-ink lg:hidden">
            Parduotuvė ↗
          </Link>
        </div>
        <AdminNav />
        <div className="mt-auto hidden border-t border-line px-5 py-4 text-xs lg:block">
          <Link href="/" target="_blank" className="mb-3 block font-medium hover:text-accent">
            Atidaryti parduotuvę ↗
          </Link>
          <p className="truncate text-muted">{admin.email}</p>
          <form action={logout}>
            <button className="mt-1 font-medium underline hover:text-accent">Atsijungti</button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-10">{children}</main>
    </div>
  );
}
