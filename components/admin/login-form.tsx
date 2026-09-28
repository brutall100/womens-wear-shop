"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { LockIcon } from "@/components/icons";
import { adminLogin } from "@/lib/client-api";
import { routes } from "@/lib/routes";

export function LoginForm({ hint, disabled = false }: { hint?: ReactNode; disabled?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <main className="page-main mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-16">
      <Link href={routes.home} className="logo self-start">
        MOT
      </Link>
      <form
        className="pattern-card mt-8 grid gap-5"
        onSubmit={async (event) => {
          event.preventDefault();
          setPending(true);
          setError("");
          const password = String(new FormData(event.currentTarget).get("password") ?? "");
          const result = await adminLogin(password);
          if (!result.ok) {
            setPending(false);
            setError(result.error);
            return;
          }
          router.push(routes.adminProducts);
          router.refresh();
        }}
      >
        <div>
          <p className="eyebrow">Valdymas</p>
          <h1 className="mt-3 text-4xl">Prisijungimas</h1>
          <p className="mt-2 text-sm text-muted">Čia keliate prekes, kainas ir aprašymus.</p>
        </div>
        {hint}
        <div className="field">
          <label htmlFor="password" className="label">
            Slaptažodis
          </label>
          <input id="password" name="password" type="password" required autoComplete="current-password" className="input" disabled={disabled} />
        </div>
        {error ? (
          <p role="alert" className="notice notice--danger">
            {error}
          </p>
        ) : null}
        <button type="submit" disabled={pending || disabled} className="btn btn-primary">
          <LockIcon size={18} />
          {pending ? "Tikrinama…" : "Prisijungti"}
        </button>
      </form>
    </main>
  );
}
