"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { clearCart } from "@/lib/cart";
import { openPayment, startCheckout } from "@/lib/client-api";
import { formatEur } from "@/lib/money";
import { isDemo, routes } from "@/lib/routes";
import { DELIVERIES, shippingCents } from "@/lib/shipping";
import { useCart } from "./cart-view";
import { ArrowIcon, LockIcon } from "./icons";

export function CheckoutForm({ freeShippingCents }: { freeShippingCents: number }) {
  const router = useRouter();
  const lines = useCart();
  const [delivery, setDelivery] = useState("lp");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  if (!lines) {
    return (
      <div className="mt-8 grid gap-4" aria-busy="true">
        <div className="skeleton h-48" />
        <div className="skeleton h-32" />
      </div>
    );
  }
  if (lines.length === 0) {
    return (
      <div className="pattern-card mt-8 max-w-xl">
        <p>Krepšelis tuščias.</p>
        <Link href={routes.catalog} className="btn btn-ghost mt-4">
          Grįžti į katalogą
        </Link>
      </div>
    );
  }

  const subtotal = lines.reduce((sum, line) => sum + line.priceCents * line.qty, 0);
  const method = DELIVERIES.find((item) => item.id === delivery) ?? DELIVERIES[1];
  const shipping = shippingCents(subtotal, method.priceCents, freeShippingCents);
  const needsAddress = delivery !== "shop";

  return (
    <form
      className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_360px]"
      onSubmit={async (event) => {
        event.preventDefault();
        if (pending) return;
        setError("");
        setPending(true);
        const data = new FormData(event.currentTarget);
        const result = await startCheckout({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          address: data.get("address") ?? "",
          city: data.get("city") ?? "",
          postal: data.get("postal") ?? "",
          note: data.get("note") ?? "",
          deliveryId: delivery,
          items: lines.map((line) => ({ productId: line.productId, size: line.size, qty: line.qty })),
        });
        if (!result.ok) {
          setPending(false);
          setError(result.error);
          return;
        }
        clearCart();
        openPayment(result.payment, (href) => router.push(href));
      }}
    >
      <div className="grid gap-6">
        <fieldset className="pattern-card grid gap-5">
          <legend className="sr-only">Kontaktai</legend>
          <h2 className="text-2xl">1. Kontaktai</h2>
          <Field label="Vardas ir pavardė" name="name" autoComplete="name" required />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="El. paštas" name="email" type="email" autoComplete="email" required />
            <Field label="Telefonas" name="phone" type="tel" autoComplete="tel" required />
          </div>
        </fieldset>

        <fieldset className="pattern-card grid gap-5">
          <legend className="sr-only">Pristatymas</legend>
          <h2 className="text-2xl">2. Pristatymas</h2>
          <div className="grid gap-3">
            {DELIVERIES.map((item) => {
              const price = shippingCents(subtotal, item.priceCents, freeShippingCents);
              return (
                <label key={item.id} className="choice">
                  <input type="radio" name="delivery" value={item.id} checked={delivery === item.id} onChange={() => setDelivery(item.id)} />
                  <span className="flex-1">
                    <span className="block font-semibold">{item.label}</span>
                    <span className="block text-sm text-muted">{item.detail}</span>
                  </span>
                  <span className="price text-sm">{price === 0 ? "Nemokamai" : formatEur(price)}</span>
                </label>
              );
            })}
          </div>
          {needsAddress ? (
            <div className="grid gap-5">
              <Field label="Adresas arba paštomatas" name="address" autoComplete="street-address" required />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Miestas" name="city" autoComplete="address-level2" required />
                <Field label="Pašto kodas" name="postal" autoComplete="postal-code" required />
              </div>
            </div>
          ) : null}
        </fieldset>

        <div className="pattern-card grid gap-3">
          <h2 className="text-2xl">3. Pastaba</h2>
          <div className="field">
            <label htmlFor="note" className="label">
              Pastaba parduotuvei (nebūtina)
            </label>
            <textarea id="note" name="note" rows={3} maxLength={500} className="textarea" />
          </div>
        </div>
      </div>

      <aside className="pattern-card lg:sticky lg:top-28" aria-label="Užsakymo suvestinė">
        <h2 className="text-2xl">Jūsų užsakymas</h2>
        <ul className="mt-4 grid gap-3 text-sm">
          {lines.map((line) => (
            <li key={`${line.productId}-${line.size}`} className="flex justify-between gap-3">
              <span>
                {line.name}
                <span className="block text-muted">
                  {line.size} · {line.qty} vnt.
                </span>
              </span>
              <span className="price">{formatEur(line.priceCents * line.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-dashed border-line pt-4 text-sm">
          <span>Pristatymas</span>
          <span className="price">{shipping === 0 ? "Nemokamai" : formatEur(shipping)}</span>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="font-semibold">Iš viso</span>
          <span className="price text-3xl">{formatEur(subtotal + shipping)}</span>
        </div>
        <p className="notice mt-5">
          {isDemo
            ? "Demo svetainė: atsidarys bandomasis banko langas, pinigai nenuskaičiuojami."
            : "Būsite nukreipti į SEB patvirtinti jau užpildyto pavedimo. Kol neįkelti sutarties raktai, atsidaro bandomoji aplinka."}
        </p>
        {error ? (
          <p role="alert" className="notice notice--danger mt-4">
            <strong>Nepavyko.</strong> {error}
          </p>
        ) : null}
        <button type="submit" disabled={pending} className="btn btn-primary btn-block mt-5 min-h-[54px]">
          <LockIcon size={18} />
          {pending ? "Ruošiama…" : "Mokėti per SEB"}
          {pending ? null : <ArrowIcon size={18} />}
        </button>
      </aside>
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
    <div className="field">
      <label htmlFor={name} className="label">
        {label}
        {required ? (
          <span aria-hidden="true" className="text-accent-ink">
            {" "}
            *
          </span>
        ) : null}
      </label>
      <input id={name} name={name} type={type} autoComplete={autoComplete} required={required} className="input" />
    </div>
  );
}
