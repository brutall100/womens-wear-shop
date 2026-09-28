import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { store } from "@/config/store";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Prisijungimas", robots: { index: false } };

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <div className="flex min-h-screen items-center justify-center bg-sand px-4">
      <div className="card w-full max-w-sm p-8">
        <p className="text-center font-serif text-3xl font-semibold tracking-[0.2em]">{store.name}</p>
        <p className="mt-1 text-center text-sm text-muted">Administravimo skydelis</p>
        <LoginForm />
      </div>
    </div>
  );
}
