import type { NextConfig } from "next";

/**
 * `npm run dev` / `npm run build` – the real shop (SQLite, admin, SEB), needs Node.js.
 * `npm run build:demo` – a static copy for GitHub Pages. Only `*.demo.tsx` route files are used,
 * the API routes are left out and the data lives in the visitor's browser.
 */
const isDemo = process.env.DEMO === "1";
const basePath = isDemo ? (process.env.PAGES_BASE_PATH ?? "").replace(/\/$/, "") : "";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_DEMO: isDemo ? "1" : "",
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  ...(isDemo
    ? {
        output: "export" as const,
        pageExtensions: ["demo.tsx", "demo.ts"],
        basePath,
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
