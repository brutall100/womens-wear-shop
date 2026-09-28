"use client";

import { useActionState } from "react";
import type { LoginState } from "@/app/admin/prisijungimas/page";

export function LoginForm({ action }: { action: (prev: LoginState, fd: FormData) => Promise<LoginState> }) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="label">El. paštas</label>
        <input id="email" name="email" type="email" autoComplete="username" required className="input" />
      </div>
      <div>
        <label htmlFor="password" className="label">Slaptažodis</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="input" />
      </div>
      {state.error && <p className="text-sm text-danger" role="alert">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Jungiamasi…" : "Prisijungti"}
      </button>
    </form>
  );
}
