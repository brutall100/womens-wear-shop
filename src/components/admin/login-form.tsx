"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login, type LoginState } from "@/app/admin/prisijungti/actions";
import { buttonClass } from "@/lib/ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={buttonClass("primary", "lg", "mt-6 w-full")}>
      {pending ? "Jungiamasi…" : "Prisijungti"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={formAction}>
      {state.error && (
        <p className="mb-5 border border-danger/30 bg-danger/5 px-3 py-2 text-xs text-danger">
          {state.error}
        </p>
      )}

      <div>
        <label className="field-label" htmlFor="email">
          El. paštas
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="field"
          placeholder="admin@veja.lt"
        />
      </div>

      <div className="mt-4">
        <label className="field-label" htmlFor="password">
          Slaptažodis
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="field"
        />
      </div>

      <SubmitButton />
    </form>
  );
}
