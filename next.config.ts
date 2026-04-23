import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["pseudoaggressively-nonguidable-nancy.ngrok-free.dev"],
    },
    optimizePackageImports: ["framer-motion", "@tanstack/react-virtual"],
  },
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  // Disable API routes for static export
  skipTrailingSlashRedirect: true,
  // Disable Next.js dev panel
  devIndicators: {
    position: 'bottom-right',
  },
};

export default nextConfig;