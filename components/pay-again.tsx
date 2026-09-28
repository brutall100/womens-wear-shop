"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { openPayment, startPayAgain } from "@/lib/client-api";
import { LockIcon } from "./icons";

export function PayAgain({ stamp }: { stamp: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <div className="mt-6">
      <button
        type="button"
        disabled={pending}
        className="btn btn-primary"
        onClick={async () => {
          setPending(true);
          setError("");
          const result = await startPayAgain(stamp);
          if (!result.ok) {
            setPending(false);
            setError(result.error);
            return;
          }
          openPayment(result.payment, (href) => router.push(href));
        }}
      >
        <LockIcon size={18} />
        {pending ? "Jungiama su SEB…" : "Mokėti per SEB"}
      </button>
      {error ? (
        <p role="alert" className="notice notice--danger mt-3">
          {error}
        </p>
      ) : null}
    </div>
  );
}
