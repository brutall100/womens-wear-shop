"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { changeOrderStatus } from "@/lib/client-api";
import { STATUS_LABEL } from "@/lib/labels";
import { isDemo } from "@/lib/routes";

export function OrderStatusForm({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <form
      className="panel mt-6 flex flex-wrap items-end gap-3 p-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setMessage("");
        setError("");
        const next = String(new FormData(event.currentTarget).get("status") ?? "");
        const result = await changeOrderStatus(id, next);
        setPending(false);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setMessage("Būsena išsaugota.");
        if (!isDemo) router.refresh();
      }}
    >
      <div className="field min-w-48 flex-1">
        <label htmlFor="status" className="label">
          Būsena
        </label>
        <select id="status" name="status" defaultValue={status} className="select">
          {Object.entries(STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? "Saugoma…" : "Išsaugoti būseną"}
      </button>
      <p className="w-full text-sm" aria-live="polite">
        {error ? <span className="text-danger">{error}</span> : <span className="text-ok">{message}</span>}
      </p>
    </form>
  );
}
