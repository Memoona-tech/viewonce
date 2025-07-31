// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      // Whitelist your Supabase storage host (no protocol)
      "skghehbyswddngiqdmqt.supabase.co",
    ],
  },
};

export default nextConfig;
