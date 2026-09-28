"use client";

import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="mt-8 space-y-4">
      <div>
        <label htmlFor="email" className="label">
          El. paštas
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required className="input" />
      </div>
      <div>
        <label htmlFor="password" className="label">
          Slaptažodis
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="input" />
      </div>
      {state?.error && <p className="text-sm text-accent">{state.error}</p>}
      <button disabled={pending} className="btn-primary w-full">
        {pending ? "Jungiamasi…" : "Prisijungti"}
      </button>
    </form>
  );
}
