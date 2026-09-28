"use client";

import { useActionState, useEffect, useRef } from "react";
import { deleteCategory, saveCategory } from "./actions";
import { ConfirmButton } from "../confirm-button";

export function NewCategoryForm({ nextOrder }: { nextOrder: number }) {
  const [state, action, pending] = useActionState(saveCategory, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} className="card flex flex-wrap items-end gap-3 p-5">
      <div className="min-w-48 flex-1">
        <label htmlFor="new-name" className="label">
          Nauja kategorija
        </label>
        <input id="new-name" name="name" placeholder="pvz. Suknelės" className="input" />
      </div>
      <input type="hidden" name="sortOrder" value={nextOrder} />
      <button disabled={pending} className="btn-primary py-2.5">
        Pridėti
      </button>
      {state?.error && <p className="w-full text-sm text-accent">{state.error}</p>}
    </form>
  );
}

export function CategoryRow({
  category,
  productCount,
}: {
  category: { id: string; name: string; slug: string; sortOrder: number };
  productCount: number;
}) {
  const [state, action, pending] = useActionState(saveCategory, null);

  return (
    <div className="px-5 py-3">
      <form action={action} className="grid grid-cols-[1fr_1fr_5rem_auto] items-center gap-3">
        <input type="hidden" name="id" value={category.id} />
        <input name="name" defaultValue={category.name} className="input" aria-label="Pavadinimas" />
        <input name="slug" defaultValue={category.slug} className="input text-muted" aria-label="Nuoroda" />
        <input name="sortOrder" type="number" defaultValue={category.sortOrder} className="input" aria-label="Eilė" />
        <div className="flex w-36 items-center justify-end gap-2">
          <button disabled={pending} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-sand">
            {pending ? "…" : state?.ok ? "✓" : "Saugoti"}
          </button>
          <ConfirmButton
            message={`Ištrinti kategoriją „${category.name}“? ${productCount} prekės liks be kategorijos.`}
            formAction={deleteCategory}
            className="rounded-lg px-3 py-2 text-sm text-accent hover:bg-accent/10"
          >
            Trinti
          </ConfirmButton>
        </div>
      </form>
      <p className="mt-1 text-xs text-muted">{productCount} prekės</p>
      {state?.error && <p className="mt-1 text-xs text-accent">{state.error}</p>}
    </div>
  );
}
