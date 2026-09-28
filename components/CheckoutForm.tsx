"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { clearCart, readCart, type CartLine } from "@/lib/cart";
import { formatEur } from "@/lib/money";
import { DELIVERIES } from "@/lib/shipping";

type Payment = { action: string; fields: Record<string, string>; demo: boolean; totalCents: number };

export function CheckoutForm({ freeShippingCents }: { freeShippingCents: number }) {
  const [lines, setLines] = useState<CartLine[] | null>(null);
  const [delivery, setDelivery] = useState("lp");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [payment, setPayment] = useState<Payment | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setLines(readCart());
  }, []);

  useEffect(() => {
    if (payment && formRef.current) formRef.current.submit();
  }, [payment]);

  if (!lines) return <p className="mt-8 text-muted">Kraunama.</p>;
  if (lines.length === 0) {
    return (
      <p className="mt-8">
        Krepšelis tuščias. <Link href="/katalogas" className="underline">Grįžti į katalogą</Link>
      </p>
    );
  }

  const subtotal = lines.reduce((sum, line) => sum + line.priceCents * line.qty, 0);
  const method = DELIVERIES.find((item) => item.id === delivery) ?? DELIVERIES[1];
  const shipping = method.priceCents === 0 || subtotal >= freeShippingCents ? 0 : method.priceCents;
  const needsAddress = delivery !== "shop";

  return (
    <form
      className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]"
      onSubmit={async (event) => {
        event.preventDefault();
        setError("");
        setPending(true);
        const data = new FormData(event.currentTarget);
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name: data.get("name"),
            email: data.get("email"),
            phone: data.get("phone"),
            address: data.get("address") ?? "",
            city: data.get("city") ?? "",
            postal: data.get("postal") ?? "",
            note: data.get("note") ?? "",
            deliveryId: delivery,
            items: lines.map((line) => ({ productId: line.productId, size: line.size, qty: line.qty })),
          }),
        });
        const body = (await response.json()) as { error?: string; payment?: Payment };
        setPending(false);
        if (!response.ok || !body.payment) {
          setError(body.error || "Nepavyko sukurti užsakymo.");
          return;
        }
        clearCart();
        setPayment(body.payment);
      }}
    >
      <div className="grid gap-5">
        <Field label="Vardas ir pavardė" name="name" autoComplete="name" required />
        <Field label="El. paštas" name="email" type="email" autoComplete="email" required />
        <Field label="Telefonas" name="phone" type="tel" autoComplete="tel" required />
        <fieldset>
          <legend className="text-sm">Pristatymas</legend>
          <div className="mt-2 grid gap-2">
            {DELIVERIES.map((item) => {
              const price = item.priceCents === 0 || subtotal >= freeShippingCents ? 0 : item.priceCents;
              return (
                <label key={item.id} className="flex min-h-11 items-center gap-3 border border-line bg-card px-3 py-3">
                  <input
                    type="radio"
                    name="delivery"
                    value={item.id}
                    checked={delivery === item.id}
                    onChange={() => setDelivery(item.id)}
                  />
                  <span className="flex-1">
                    <span className="block">{item.label}</span>
                    <span className="block text-sm text-muted">{item.detail}</span>
                  </span>
                  <span className="num text-sm">{price === 0 ? "0,00 €" : formatEur(price)}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
        {needsAddress ? (
          <div className="grid gap-5">
            <Field label="Adresas arba paštomato pastaba" name="address" autoComplete="street-address" required />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Miestas" name="city" autoComplete="address-level2" required />
              <Field label="Pašto kodas" name="postal" autoComplete="postal-code" required />
            </div>
          </div>
        ) : null}
        <div>
          <label htmlFor="note" className="text-sm">
            Pastaba
          </label>
          <textarea id="note" name="note" rows={3} className="mt-2 w-full border border-line bg-card px-3 py-3" />
        </div>
        {error ? (
          <p role="alert" className="border border-danger px-3 py-3 text-sm text-danger">
            {error}
          </p>
        ) : null}
      </div>
      <aside className="h-fit border border-line bg-card p-5">
        <ul className="grid gap-3 text-sm">
          {lines.map((line) => (
            <li key={`${line.productId}-${line.size}`} className="flex justify-between gap-3">
              <span>
                {line.name}
                <span className="block text-muted">
                  {line.size} · {line.qty}
                </span>
              </span>
              <span className="num">{formatEur(line.priceCents * line.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-line pt-4 text-sm">
          <span>Pristatymas</span>
          <span className="num">{formatEur(shipping)}</span>
        </div>
        <div className="mt-2 flex justify-between">
          <span>Iš viso</span>
          <span className="num font-serif text-3xl">{formatEur(subtotal + shipping)}</span>
        </div>
        <p className="mt-4 text-sm text-muted">
          Mokėjimas per SEB. Būsite nukreipti patvirtinti jau užpildytą pavedimą. Kol neįkelti sutarties raktai, atsidaro bandomoji aplinka ir pinigai nenuskaičiuojami.
        </p>
        <button type="submit" disabled={pending} className="mt-5 h-12 w-full bg-clay text-sm text-paper">
          {pending ? "Ruošiama…" : "Mokėti per SEB"}
        </button>
      </aside>
      {payment ? (
        <form ref={formRef} method="post" action={payment.action} className="hidden">
          {Object.entries(payment.fields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
        </form>
      ) : null}
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm">
        {label}
        {required ? <span aria-hidden> *</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="mt-2 h-12 w-full border border-line bg-card px-3"
      />
    </div>
  );
}
