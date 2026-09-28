import type { Metadata } from "next";
import Link from "next/link";
import { adminPasswordConfigured } from "@/lib/auth";

export const metadata: Metadata = { title: "Prisijungimas" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ klaida?: string }> }) {
  const params = await searchParams;
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-16">
      <Link href="/" className="font-serif text-4xl tracking-[0.18em]">
        MOT
      </Link>
      <h1 className="mt-8 font-serif text-4xl">Parduotuvės valdymas</h1>
      <p className="mt-3 text-sm text-muted">Čia keliate prekes, kainas ir aprašymus.</p>
      {adminPasswordConfigured() ? null : (
        <p className="mt-3 text-sm text-muted">
          Pradinis slaptažodis: <span className="num">mot-admin</span>
        </p>
      )}
      <form action="/api/admin/login" method="post" className="mt-8 grid gap-4">
        <label className="grid gap-2 text-sm" htmlFor="password">
          Slaptažodis
          <input id="password" name="password" type="password" required autoComplete="current-password" className="h-12 border border-line bg-card px-3 text-base" />
        </label>
        {params.klaida ? (
          <p role="alert" className="text-sm text-danger">
            Slaptažodis netinka.
          </p>
        ) : null}
        <button type="submit" className="h-12 bg-ink text-sm text-paper">
          Prisijungti
        </button>
      </form>
    </main>
  );
}
