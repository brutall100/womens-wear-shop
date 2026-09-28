"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { QuantityControl } from "@/components/cart/quantity-control";
import { formatPrice } from "@/lib/format";
import type { ShippingMethod } from "@/config/store";
import { createOrder } from "./actions";

export function CheckoutForm({
  shippingMethods,
  freeShippingFrom,
}: {
  shippingMethods: ShippingMethod[];
  freeShippingFrom: number;
}) {
  const { items, ready, subtotal, setQuantity, remove, replace, clear } = useCart();
  const [methodId, setMethodId] = useState(shippingMethods[0].id);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const method = shippingMethods.find((m) => m.id === methodId)!;
  const shipping = subtotal >= freeShippingFrom ? 0 : method.price;

  if (!ready) return <div className="h-96" />;

  if (items.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-4 px-6 py-20 text-center">
        <p className="text-muted">Jūsų krepšelis tuščias.</p>
        <Link href="/parduotuve" className="btn-primary">
          Žiūrėti prekes
        </Link>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => String(fd.get(k) ?? "");
    setFormError(null);

    startTransition(async () => {
      const result = await createOrder({
        email: get("email"),
        phone: get("phone"),
        firstName: get("firstName"),
        lastName: get("lastName"),
        shippingMethod: methodId,
        address: get("address"),
        city: get("city"),
        postalCode: get("postalCode"),
        note: get("note"),
        acceptTerms: (fd.get("acceptTerms") === "on") as true,
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      });

      if (result.ok) {
        clear();
        window.location.href = result.redirectUrl;
        return;
      }
      setErrors(result.fieldErrors ?? {});
      setFormError(result.error ?? "Patikrinkite pažymėtus laukus.");
      if (result.stockIssues) {
        replace(
          items
            .map((i) => {
              const issue = result.stockIssues!.find((s) => s.variantId === i.variantId);
              return issue ? { ...i, stock: issue.available, quantity: Math.min(i.quantity, issue.available) } : i;
            })
            .filter((i) => i.quantity > 0),
        );
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-10 lg:grid-cols-[1fr_24rem]">
      <div className="space-y-10">
        {formError && (
          <div className="rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-accent-dark">{formError}</div>
        )}

        <Fieldset title="Kontaktai">
          <Field name="email" label="El. paštas" type="email" autoComplete="email" error={errors.email} className="sm:col-span-2" />
          <Field name="phone" label="Telefonas" type="tel" autoComplete="tel" placeholder="+370 6xx xxxxx" error={errors.phone} className="sm:col-span-2" />
          <Field name="firstName" label="Vardas" autoComplete="given-name" error={errors.firstName} />
          <Field name="lastName" label="Pavardė" autoComplete="family-name" error={errors.lastName} />
        </Fieldset>

        <Fieldset title="Pristatymas">
          <div className="space-y-3 sm:col-span-2">
            {shippingMethods.map((m) => (
              <label
                key={m.id}
                className={`flex cursor-pointer items-center gap-4 rounded-xl border bg-white px-4 py-4 transition ${
                  methodId === m.id ? "border-ink ring-1 ring-ink" : "border-line hover:border-stone-400"
                }`}
              >
                <input
                  type="radio"
                  name="shippingMethod"
                  value={m.id}
                  checked={methodId === m.id}
                  onChange={() => setMethodId(m.id)}
                  className="accent-ink"
                />
                <span className="flex-1">
                  <span className="block text-sm font-medium">{m.name}</span>
                  <span className="block text-xs text-muted">{m.description}</span>
                </span>
                <span className="text-sm font-semibold">
                  {subtotal >= freeShippingFrom ? "Nemokamai" : formatPrice(m.price)}
                </span>
              </label>
            ))}
          </div>
          <Field
            key={method.requiresLocker ? "locker" : "address"}
            name="address"
            label={method.requiresLocker ? "Paštomatas (pavadinimas arba adresas)" : "Adresas"}
            placeholder={method.requiresLocker ? "pvz. Akropolis, Ozo g. 25" : "Gatvė, namo ir buto nr."}
            autoComplete={method.requiresLocker ? "off" : "street-address"}
            error={errors.address}
            className="sm:col-span-2"
          />
          <Field name="city" label="Miestas" autoComplete="address-level2" error={errors.city} />
          <Field
            name="postalCode"
            label={method.requiresLocker ? "Pašto kodas (nebūtina)" : "Pašto kodas"}
            placeholder="LT-00000"
            autoComplete="postal-code"
            error={errors.postalCode}
          />
          <div className="sm:col-span-2">
            <label htmlFor="note" className="label">
              Pastabos (nebūtina)
            </label>
            <textarea id="note" name="note" rows={3} className="input" />
          </div>
        </Fieldset>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card p-6">
          <h2 className="font-serif text-2xl">Užsakymas</h2>
          <ul className="mt-5 divide-y divide-line">
            {items.map((item) => (
              <li key={item.variantId} className="flex gap-3 py-4">
                <div className="h-20 w-16 shrink-0 overflow-hidden rounded-md bg-sand">
                  {item.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex flex-1 flex-col text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="font-medium">{item.name}</span>
                    <span className="font-semibold whitespace-nowrap">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                  <span className="text-xs text-muted">Dydis: {item.size}</span>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <QuantityControl value={item.quantity} max={item.stock} onChange={(q) => setQuantity(item.variantId, q)} />
                    <button type="button" onClick={() => remove(item.variantId)} className="text-xs text-muted underline">
                      Pašalinti
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <dl className="space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Prekės</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Pristatymas</dt>
              <dd>{shipping === 0 ? "Nemokamai" : formatPrice(shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
              <dt>Iš viso</dt>
              <dd>{formatPrice(subtotal + shipping)}</dd>
            </div>
            <p className="text-xs text-muted">Kainos nurodytos su PVM.</p>
          </dl>

          <label className="mt-5 flex items-start gap-3 text-sm">
            <input type="checkbox" name="acceptTerms" className="mt-0.5 accent-ink" />
            <span>
              Susipažinau ir sutinku su{" "}
              <Link href="/taisykles" target="_blank" className="underline">
                pirkimo taisyklėmis
              </Link>{" "}
              ir{" "}
              <Link href="/privatumas" target="_blank" className="underline">
                privatumo politika
              </Link>
            </span>
          </label>
          {errors.acceptTerms && <p className="mt-1 text-xs text-accent">{errors.acceptTerms}</p>}

          <button type="submit" disabled={pending} className="btn-primary mt-6 w-full py-4 text-base">
            {pending ? "Jungiamasi prie banko…" : `Apmokėti ${formatPrice(subtotal + shipping)}`}
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 018 0v4" />
            </svg>
            Saugus apmokėjimas per SEB — banko nuoroda arba kortele
          </p>
        </div>
      </aside>
    </form>
  );
}

function Fieldset({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-5 font-serif text-2xl">{title}</legend>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Field({
  name,
  label,
  error,
  className = "",
  ...props
}: { name: string; label: string; error?: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label htmlFor={name} className="label">
        {label}
      </label>
      <input
        id={name}
        name={name}
        className={`input ${error ? "!border-accent" : ""}`}
        aria-invalid={!!error}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-accent">{error}</p>}
    </div>
  );
}
