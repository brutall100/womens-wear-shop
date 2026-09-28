import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { getCurrentAdmin } from "@/lib/auth";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Prisijungimas",
};

export default async function LoginPage() {
  const admin = await getCurrentAdmin();
  if (admin) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <Link href="/" className="font-display text-3xl tracking-[0.3em] pl-[0.3em]">
            {site.name}
          </Link>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">
            Prekių administravimas
          </p>
        </div>

        <div className="mt-8 border border-line bg-shell p-7">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          <Link href="/" className="link-underline">
            Grįžti į parduotuvę
          </Link>
        </p>
      </div>
    </div>
  );
}
