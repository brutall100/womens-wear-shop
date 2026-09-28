import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    // Demonstracinės prekių nuotraukos yra SVG; į administravimo panelę
    // galima kelti tik JPG/PNG/WebP, o SVG atvaizduojamas izoliuotai.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
