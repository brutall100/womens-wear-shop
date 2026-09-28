"use client";

import { useActionState, useState } from "react";
import {
  saveCategory,
  type CategoryState,
} from "@/app/admin/(panel)/kategorijos/actions";
import { buttonClass } from "@/lib/ui";

export type CategoryValues = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
};

export function CategoryForm({
  category,
  onDone,
}: {
  category?: CategoryValues;
  onDone?: () => void;
}) {
  const [state, formAction] = useActionState<CategoryState, FormData>(
    async (prev, formData) => {
      const result = await saveCategory(prev, formData);
      if (result.success && onDone) onDone();
      return result;
    },
    {},
  );
  const [name, setName] = useState(category?.name ?? "");

  return (
    <form action={formAction} className="space-y-4">
      {category?.id && <input type="hidden" name="id" value={category.id} />}

      {state.error && (
        <p className="border border-danger/30 bg-danger/5 px-3 py-2 text-xs text-danger">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="border border-success/30 bg-success/5 px-3 py-2 text-xs text-success">
          {state.success}
        </p>
      )}

      <div>
        <label className="field-label" htmlFor={`name-${category?.id ?? "new"}`}>
          Pavadinimas *
        </label>
        <input
          id={`name-${category?.id ?? "new"}`}
          name="name"
          className="field"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Pvz. Suknelės"
          required
        />
      </div>

      <div>
        <label className="field-label" htmlFor={`slug-${category?.id ?? "new"}`}>
          Nuoroda (nebūtina)
        </label>
        <input
          id={`slug-${category?.id ?? "new"}`}
          name="slug"
          className="field"
          defaultValue={category?.slug ?? ""}
          placeholder="sukneles"
        />
      </div>

      <div>
        <label className="field-label" htmlFor={`description-${category?.id ?? "new"}`}>
          Aprašymas
        </label>
        <textarea
          id={`description-${category?.id ?? "new"}`}
          name="description"
          rows={2}
          className="field"
          defaultValue={category?.description ?? ""}
          placeholder="Trumpas kategorijos apibūdinimas"
        />
      </div>

      <div className="flex items-end gap-4">
        <div className="w-32">
          <label className="field-label" htmlFor={`sortOrder-${category?.id ?? "new"}`}>
            Eiliškumas
          </label>
          <input
            id={`sortOrder-${category?.id ?? "new"}`}
            name="sortOrder"
            type="number"
            min={0}
            className="field"
            defaultValue={category?.sortOrder ?? 0}
          />
        </div>
        <label className="flex items-center gap-2 pb-2.5 text-sm">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={category?.isActive ?? true}
            className="accent-[var(--color-clay)]"
          />
          Rodoma
        </label>
      </div>

      <button type="submit" className={buttonClass("primary", "md")}>
        {category?.id ? "Išsaugoti" : "Sukurti kategoriją"}
      </button>
    </form>
  );
}
