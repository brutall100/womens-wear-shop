"use client";

import { useActionState, useEffect, useRef } from "react";
import { saveCategory, type ActionState } from "@/app/admin/(panel)/actions";

export function CategoryForm({
  initial,
  compact = false,
}: {
  initial: { id: string; name: string; position: number };
  compact?: boolean;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(saveCategory, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success && !initial.id) formRef.current?.reset();
  }, [state.success, initial.id]);

  return (
    <form ref={formRef} action={formAction} className={compact ? "flex flex-wrap items-center gap-2" : "space-y-3"}>
      <input type="hidden" name="id" value={initial.id} />
      <input
        name="position"
        type="number"
        defaultValue={initial.position}
        className="input w-20"
        aria-label="Eilės nr."
        title="Eilės nr."
      />
      <input
        name="name"
        defaultValue={initial.name}
        required
        className={`input ${compact ? "w-56" : ""}`}
        placeholder="Kategorijos pavadinimas"
        aria-label="Pavadinimas"
      />
      <button type="submit" disabled={pending} className={compact ? "btn-ghost text-xs" : "btn-primary w-full"}>
        {pending ? "Saugoma…" : initial.id ? "Išsaugoti" : "Pridėti"}
      </button>
      {state.error && <p className="text-xs text-danger">{state.error}</p>}
      {state.success && !compact && <p className="text-xs text-success">{state.success}</p>}
    </form>
  );
}
