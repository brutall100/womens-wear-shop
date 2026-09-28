"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { LoginForm } from "@/components/admin/login-form";
import { OrderDetailView, OrdersView } from "@/components/admin/orders-view";
import { ProductForm } from "@/components/admin/product-form";
import { ProductsView } from "@/components/admin/products-view";
import { SebSettingsForm, ShopSettingsForm } from "@/components/admin/settings-forms";
import { categoriesOf } from "@/lib/catalog";
import { DEMO_PASSWORD, demoLoggedIn, findOrder, findProduct } from "@/lib/demo/store";
import { useDemoState } from "@/lib/demo/use-demo";
import { centsToInput } from "@/lib/money";
import { routes } from "@/lib/routes";
import { SEB_GATEWAY_HINT } from "@/lib/seb-hint";

const noop = () => () => {};

/** `null` until the browser tells us, then true/false. */
function useLoggedIn(): boolean | null {
  return useSyncExternalStore(noop, demoLoggedIn, () => null);
}

function Waiting() {
  return (
    <div className="grid gap-4" aria-busy="true">
      <div className="skeleton h-14 w-64" />
      <div className="skeleton h-72" />
    </div>
  );
}

/** Keeps the demo admin behind the (public) demo password. */
export function DemoAdminGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const loggedIn = useLoggedIn();

  useEffect(() => {
    if (loggedIn === false) router.replace(routes.adminLogin);
  }, [loggedIn, router]);

  return (
    <AdminShell
      notice={
        <p className="notice mb-8 max-w-3xl">
          Demo valdymas: pakeitimai saugomi tik jūsų naršyklėje. Tikra administracija veikia paleidus parduotuvę su serveriu.
        </p>
      }
    >
      {loggedIn ? children : <Waiting />}
    </AdminShell>
  );
}

export function DemoLogin() {
  const router = useRouter();
  const loggedIn = useLoggedIn();

  useEffect(() => {
    if (loggedIn) router.replace(routes.adminProducts);
  }, [loggedIn, router]);

  return (
    <LoginForm
      hint={
        <p className="notice">
          Demo slaptažodis: <span className="price font-semibold">{DEMO_PASSWORD}</span>
        </p>
      }
    />
  );
}

export function DemoAdminIndex() {
  const router = useRouter();
  useEffect(() => {
    router.replace(routes.adminProducts);
  }, [router]);
  return (
    <p>
      <Link href={routes.adminProducts} className="link">
        Atidaryti prekes
      </Link>
    </p>
  );
}

export function DemoAdminProducts() {
  const state = useDemoState();
  return <ProductsView products={state.products} />;
}

export function DemoAdminNewProduct() {
  const state = useDemoState();
  return (
    <div>
      <Link href={routes.adminProducts} className="link text-sm">
        ← Visos prekės
      </Link>
      <h1 className="mt-4 text-5xl">Nauja prekė</h1>
      <ProductForm product={null} categories={categoriesOf(state.products)} />
    </div>
  );
}

function EditProductFromUrl() {
  const params = useSearchParams();
  const state = useDemoState();
  const product = findProduct(state, params.get("id") ?? "");
  if (!product) {
    return (
      <p className="pattern-card">
        Prekė nerasta.{" "}
        <Link href={routes.adminProducts} className="link">
          Grįžti į sąrašą
        </Link>
      </p>
    );
  }
  return (
    <div>
      <Link href={routes.adminProducts} className="link text-sm">
        ← Visos prekės
      </Link>
      <h1 className="mt-4 text-5xl">{product.name}</h1>
      <ProductForm
        product={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          description: product.description,
          price: centsToInput(product.priceCents),
          category: product.category,
          sizes: product.sizes,
          stock: product.stock,
          published: product.published,
          images: product.images.map((image) => ({ id: image.id, path: image.path })),
        }}
        categories={categoriesOf(state.products)}
      />
    </div>
  );
}

export function DemoAdminEditProduct() {
  return (
    <Suspense fallback={<Waiting />}>
      <EditProductFromUrl />
    </Suspense>
  );
}

export function DemoAdminOrders() {
  const state = useDemoState();
  return <OrdersView orders={[...state.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt))} />;
}

function OrderFromUrl() {
  const params = useSearchParams();
  const state = useDemoState();
  const order = findOrder(state, params.get("id") ?? "");
  if (!order) {
    return (
      <p className="pattern-card">
        Užsakymas nerastas.{" "}
        <Link href={routes.adminOrders} className="link">
          Grįžti į sąrašą
        </Link>
      </p>
    );
  }
  return <OrderDetailView order={order} />;
}

export function DemoAdminOrder() {
  return (
    <Suspense fallback={<Waiting />}>
      <OrderFromUrl />
    </Suspense>
  );
}

export function DemoAdminSeb() {
  return (
    <SebSettingsForm
      merchantId=""
      gatewayUrl=""
      bankId=""
      live={false}
      merchantBits=""
      bankSubject=""
      hint={SEB_GATEWAY_HINT}
      disabled
      notice={
        <p className="notice">
          Demo svetainėje banko raktai nesaugomi – privačių raktų negalima laikyti naršyklėje. Paleidus parduotuvę su serveriu čia įkeliami
          tikri SEB sutarties duomenys.
        </p>
      }
    />
  );
}

export function DemoAdminShop() {
  const state = useDemoState();
  return (
    <ShopSettingsForm
      email={state.shop.email}
      phone={state.shop.phone}
      pickup={state.shop.pickup}
      freeShipping={centsToInput(state.shop.freeShippingCents)}
    />
  );
}
