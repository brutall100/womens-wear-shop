import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Uploaded photos are served from disk via /uploads/[...path]; remote
    // URLs pasted in the admin panel are allowed from any https host.
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "40mb",
    },
  },
};

export default nextConfig;
