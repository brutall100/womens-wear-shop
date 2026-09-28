"use client";

import { useState } from "react";
import { retryPayment } from "@/app/(shop)/uzsakymas/[id]/actions";
import { buttonClass } from "@/lib/ui";

export function RetryPaymentButton({ orderId }: { orderId: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);
    const result = await retryPayment(orderId);

    if (!result.ok) {
      setError(result.message);
      setPending(false);
      return;
    }

    const form = document.createElement("form");
    form.method = "POST";
    form.action = result.payment.url;
    form.acceptCharset = "UTF-8";
    form.style.display = "none";
    for (const [name, value] of Object.entries(result.payment.fields)) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className={buttonClass("primary", "lg")}
      >
        {pending ? "Nukreipiama į SEB…" : "Apmokėti su SEB"}
      </button>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}
