"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const SORT_OPTIONS = [
  { value: "naujausios", label: "Naujausios" },
  { value: "pigiausios", label: "Kaina: nuo mažiausios" },
  { value: "brangiausios", label: "Kaina: nuo didžiausios" },
  { value: "pavadinimas", label: "Pagal pavadinimą" },
];

export function CatalogToolbar({
  total,
  sort,
  search,
}: {
  total: number;
  sort: string;
  search: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(search);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          updateParam("paieska", query.trim());
        }}
        className="flex items-center gap-2"
        role="search"
      >
        <input
          type="search"
          name="paieska"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ieškoti prekių"
          aria-label="Ieškoti prekių"
          className="field w-56 py-2 text-sm"
        />
        <button
          type="submit"
          className="border border-ink/25 px-3 py-2 text-[11px] uppercase tracking-[0.14em] hover:border-ink cursor-pointer"
        >
          Ieškoti
        </button>
      </form>

      <div className="flex items-center gap-4">
        <span className="text-xs text-muted">
          {total} {total === 1 ? "prekė" : total % 10 === 0 || total > 10 ? "prekių" : "prekės"}
        </span>
        <label className="flex items-center gap-2 text-xs text-muted">
          Rikiuoti
          <select
            value={sort}
            onChange={(event) => updateParam("rikiuoti", event.target.value)}
            className="field w-52 py-2 text-sm cursor-pointer"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
