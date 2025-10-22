import type { NextConfig } from "next";

// Ensure Turbopack resolves the correct project root to avoid internal module resolution issues
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
} satisfies NextConfig & { turbopack: { root: string } };

export default nextConfig;
