import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if ESLint errors are present.
    ignoreDuringBuilds: false,
  },
  images: {
    // Configure image domains if using external images
    domains: ['smartpark-backend.vercel.app'],
    // If you want to disable image optimization for static export
    unoptimized: false,
  },
  // Enable static export if needed
  // output: 'export',
  // trailingSlash: true,
};

export default nextConfig;