import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["pseudoaggressively-nonguidable-nancy.ngrok-free.dev"],
    },
    optimizePackageImports: ["framer-motion", "@tanstack/react-virtual"],
  },
};

export default nextConfig;