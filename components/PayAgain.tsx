"use client";

import { useState } from "react";

export function PayAgain({ stamp }: { stamp: string }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <div className="mt-6">
      <button
        type="button"
        disabled={pending}
        className="h-12 bg-clay px-6 text-sm text-paper"
        onClick={async () => {
          setPending(true);
          setError("");
          const response = await fetch(`/api/orders/${stamp}/pay`, { method: "POST" });
          const body = (await response.json()) as {
            error?: string;
            payment?: { action: string; fields: Record<string, string> };
          };
          if (!response.ok || !body.payment) {
            setPending(false);
            setError(body.error || "Nepavyko pradėti mokėjimo.");
            return;
          }
          const form = document.createElement("form");
          form.method = "post";
          form.action = body.payment.action;
          for (const [name, value] of Object.entries(body.payment.fields)) {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = name;
            input.value = value;
            form.append(input);
          }
          document.body.append(form);
          form.submit();
        }}
      >
        {pending ? "Jungiama su SEB…" : "Mokėti per SEB"}
      </button>
      {error ? (
        <p role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
