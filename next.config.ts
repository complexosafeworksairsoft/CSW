import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default is 1MB, too small for the "Ficha da Equipe" photo uploads
      // (team/operator/equipment photos, up to ~4MB each per the prototype
      // upload flow in src/lib/photo-upload.ts). Raised with headroom for
      // multipart overhead and the other form fields sent alongside a photo.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
