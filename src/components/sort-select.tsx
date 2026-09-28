"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function SortSelect({ options }: { options: readonly { value: string; label: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted">Rikiuoti:</span>
      <select
        value={params.get("rikiuoti") ?? options[0].value}
        onChange={(e) => {
          const next = new URLSearchParams(params);
          next.set("rikiuoti", e.target.value);
          router.push(`${pathname}?${next}`);
        }}
        className="rounded-full border border-line bg-white px-3 py-1.5 text-sm outline-none focus:border-ink"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
