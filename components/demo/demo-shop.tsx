"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type ReactNode } from "react";
import { CartView } from "@/components/cart-view";
import { CheckoutForm } from "@/components/checkout-form";
import { CheckIcon, CloseIcon } from "@/components/icons";
import { ShopFrame } from "@/components/shop-frame";
import { BankView } from "@/components/views/bank-view";
import { CatalogView } from "@/components/views/catalog-view";
import { HomeView } from "@/components/views/home-view";
import { NotFoundView } from "@/components/views/not-found-view";
import { OrderView } from "@/components/views/order-view";
import { ProductView } from "@/components/views/product-view";
import { countByCategory, featuredCategories } from "@/lib/catalog";
import { findBySlug, findOrderByStamp, listCategories, listProducts, payOrder, rejectOrder } from "@/lib/demo/store";
import { useDemoState, useHydrated } from "@/lib/demo/use-demo";
import { canPay } from "@/lib/labels";
import { routes } from "@/lib/routes";

/** Tape, header and footer filled from the browser store. */
export function DemoShopFrame({ children }: { children: ReactNode }) {
  const state = useDemoState();
  const published = listProducts(state, { publishedOnly: true });
  return (
    <ShopFrame categories={listCategories(state)} featured={featuredCategories(published)} shop={state.shop}>
      {children}
    </ShopFrame>
  );
}

export function DemoHome() {
  const state = useDemoState();
  return <HomeView products={listProducts(state, { publishedOnly: true })} categories={listCategories(state)} shop={state.shop} />;
}

function Catalog({ category = "", q = "", sort = "" }: { category?: string; q?: string; sort?: string }) {
  const state = useDemoState();
  const published = listProducts(state, { publishedOnly: true });
  return (
    <CatalogView
      products={listProducts(state, { publishedOnly: true, category: category || undefined, q, sort })}
      categories={listCategories(state)}
      counts={countByCategory(published)}
      filters={{ category, q, sort }}
    />
  );
}

function CatalogFromUrl() {
  const params = useSearchParams();
  return <Catalog category={params.get("kategorija") ?? ""} q={params.get("q") ?? ""} sort={params.get("rikiuoti") ?? ""} />;
}

export function DemoCatalog() {
  return (
    <Suspense fallback={<Catalog />}>
      <CatalogFromUrl />
    </Suspense>
  );
}

function Loading() {
  return (
    <div className="container-page grid gap-6 py-12 lg:grid-cols-2" aria-busy="true">
      <div className="skeleton aspect-[3/4]" />
      <div className="skeleton h-96" />
    </div>
  );
}

function ProductFromUrl() {
  const params = useSearchParams();
  const state = useDemoState();
  const product = findBySlug(state, params.get("p") ?? "");
  if (!product) return <NotFoundView />;
  return <ProductView product={product} shop={state.shop} />;
}

export function DemoProduct() {
  return (
    <Suspense fallback={<Loading />}>
      <ProductFromUrl />
    </Suspense>
  );
}

export function DemoCart() {
  const state = useDemoState();
  return (
    <div className="container-page py-10 sm:py-14">
      <p className="eyebrow">Jūsų pasirinkimai</p>
      <h1 className="mt-3 text-5xl sm:text-6xl">Krepšelis</h1>
      <CartView freeShippingCents={state.shop.freeShippingCents} />
    </div>
  );
}

export function DemoCheckout() {
  const state = useDemoState();
  return (
    <div className="container-page py-10 sm:py-14">
      <p className="eyebrow">Beveik viskas</p>
      <h1 className="mt-3 text-5xl sm:text-6xl">Atsiskaitymas</h1>
      <p className="mt-4 max-w-xl text-muted">Užpildykite duomenis. Toliau atsidarys bandomasis banko langas.</p>
      <CheckoutForm freeShippingCents={state.shop.freeShippingCents} />
    </div>
  );
}

function MissingOrder() {
  return (
    <div className="container-page max-w-2xl py-16">
      <div className="pattern-card">
        <h1 className="text-4xl">Užsakymas nerastas</h1>
        <p className="mt-3 text-muted">Demo užsakymai saugomi tik toje naršyklėje, kurioje buvo sukurti.</p>
      </div>
    </div>
  );
}

function OrderFromUrl() {
  const params = useSearchParams();
  const state = useDemoState();
  const hydrated = useHydrated();
  if (!hydrated) return <Loading />;
  const order = findOrderByStamp(state, params.get("nr") ?? "");
  return order ? <OrderView order={order} /> : <MissingOrder />;
}

export function DemoOrder() {
  return (
    <Suspense fallback={<Loading />}>
      <OrderFromUrl />
    </Suspense>
  );
}

function BankActions({ stamp }: { stamp: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const answer = (pay: boolean) => {
    setBusy(true);
    if (pay) payOrder(stamp);
    else rejectOrder(stamp);
    router.push(routes.order(stamp));
  };
  return (
    <div className="flex flex-wrap gap-3">
      <button type="button" className="btn btn-primary" disabled={busy} onClick={() => answer(true)}>
        <CheckIcon size={18} /> Patvirtinti mokėjimą
      </button>
      <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => answer(false)}>
        <CloseIcon size={18} /> Atmesti
      </button>
    </div>
  );
}

function BankFromUrl() {
  const params = useSearchParams();
  const state = useDemoState();
  const hydrated = useHydrated();
  if (!hydrated) return <Loading />;
  const order = findOrderByStamp(state, params.get("nr") ?? "");
  if (!order) return <MissingOrder />;
  return (
    <BankView
      order={order}
      actions={
        canPay(order.status) ? (
          <BankActions stamp={order.stamp} />
        ) : (
          <Link href={routes.order(order.stamp)} className="btn btn-ghost">
            Šis užsakymas jau apmokėtas – grįžti į užsakymą
          </Link>
        )
      }
    />
  );
}

export function DemoBank() {
  return (
    <Suspense fallback={<Loading />}>
      <BankFromUrl />
    </Suspense>
  );
}
