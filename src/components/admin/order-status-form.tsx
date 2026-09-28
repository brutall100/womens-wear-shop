"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  updateOrder,
  type OrderUpdateState,
} from "@/app/admin/(panel)/uzsakymai/actions";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/orders";
import { buttonClass } from "@/lib/ui";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={buttonClass("primary", "md", "w-full")}>
      {pending ? "Saugoma…" : "Atnaujinti būseną"}
    </button>
  );
}

export function OrderStatusForm({
  orderId,
  status,
  paymentStatus,
}: {
  orderId: string;
  status: string;
  paymentStatus: string;
}) {
  const [state, formAction] = useActionState<OrderUpdateState, FormData>(updateOrder, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={orderId} />

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
        <label className="field-label" htmlFor="status">
          Užsakymo būsena
        </label>
        <select
          id="status"
          name="status"
          defaultValue={status}
          className="field cursor-pointer"
        >
          {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="field-label" htmlFor="paymentStatus">
          Apmokėjimo būsena
        </label>
        <select
          id="paymentStatus"
          name="paymentStatus"
          defaultValue={paymentStatus}
          className="field cursor-pointer"
        >
          {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-muted">
          Keiskite rankiniu būdu tik tuomet, kai apmokėjimą patvirtinote banke.
        </p>
      </div>

      <SaveButton />
    </form>
  );
}
