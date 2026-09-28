"use client";

import { useState, useTransition } from "react";

export function RetryPaymentButton({ action }: { action: () => Promise<string | null> }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <button
        type="button"
        className="btn-accent"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            try {
              const url = await action();
              if (url) window.location.assign(url);
              else window.location.reload();
            } catch {
              setError("Nepavyko pradėti apmokėjimo. Bandykite vėliau.");
            }
          })
        }
      >
        {pending ? "Nukreipiama…" : "Apmokėti dar kartą"}
      </button>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}
