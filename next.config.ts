import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.trycloudflare.com",
    "architectural-exceptions-discrimination-bless.trycloudflare.com",
    "*.loca.lt",
    "localhost:3000"
  ]
};

export default nextConfig;
