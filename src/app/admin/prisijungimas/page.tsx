import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { shopConfig } from "@/lib/config";
import { checkAdminCredentials, getAdminSession, setAdminSessionCookie } from "@/lib/auth";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Prisijungimas – administravimas", robots: { index: false } };

export interface LoginState {
  error?: string;
}

export default async function LoginPage({ searchParams }: PageProps<"/admin/prisijungimas">) {
  const sp = await searchParams;
  const back = typeof sp.grizti === "string" && sp.grizti.startsWith("/admin") ? sp.grizti : "/admin";

  if (await getAdminSession()) redirect(back);

  async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
    "use server";
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    if (!checkAdminCredentials(email, password)) {
      return { error: "Neteisingas el. paštas arba slaptažodis." };
    }
    await setAdminSessionCookie(email);
    redirect(back);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="card w-full max-w-sm p-8">
        <p className="font-display text-2xl font-semibold uppercase tracking-[0.18em]">{shopConfig.name}</p>
        <p className="mt-1 text-sm text-ink-muted">Administravimo panelė</p>
        <div className="mt-8">
          <LoginForm action={login} />
        </div>
      </div>
    </div>
  );
}
