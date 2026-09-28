/**
 * The shop runs in two modes:
 * - server mode (`npm run dev` / `npm start`): real database, admin and SEB;
 * - demo mode (`npm run build:demo`): a static site for GitHub Pages that keeps data in the browser.
 * Static pages cannot have one page per new product, so the demo passes ids in the query string.
 */
export const isDemo = process.env.NEXT_PUBLIC_DEMO === "1";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const routes = {
  home: "/",
  catalog: "/katalogas",
  cart: "/krepselis",
  checkout: "/atsiskaitymas",
  category: (category: string) => `/katalogas?kategorija=${encodeURIComponent(category)}`,
  product: (slug: string) => (isDemo ? `/preke?p=${encodeURIComponent(slug)}` : `/preke/${slug}`),
  order: (stamp: string) => (isDemo ? `/uzsakymas?nr=${stamp}` : `/uzsakymas/${stamp}`),
  bank: (stamp: string) => (isDemo ? `/bankas?nr=${stamp}` : `/bankas/${stamp}`),
  admin: "/admin",
  adminLogin: "/admin/prisijungti",
  adminProducts: "/admin/prekes",
  adminNewProduct: "/admin/prekes/nauja",
  adminProduct: (id: string) => (isDemo ? `/admin/prekes/redaguoti?id=${id}` : `/admin/prekes/${id}`),
  adminOrders: "/admin/uzsakymai",
  adminOrder: (id: string) => (isDemo ? `/admin/uzsakymai/perziura?id=${id}` : `/admin/uzsakymai/${id}`),
  adminSeb: "/admin/seb",
  adminShop: "/admin/parduotuve",
};

/** Adds the GitHub Pages base path to files from `public/`. Uploaded data URLs stay as they are. */
export function asset(path: string): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return path;
  return `${basePath}${path}`;
}
