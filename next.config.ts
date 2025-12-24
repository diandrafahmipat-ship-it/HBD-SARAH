import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // Required for static site generation
  basePath: "/HBD-SARAH", // Required for GitHub Pages repo sub-path
  images: {
    unoptimized: true, // Required because Next.js Image Optimization doesn't work with 'export'
  },
};

export default nextConfig;
