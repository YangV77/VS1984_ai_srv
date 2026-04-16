import type { NextConfig } from "next";

const envAllowedOrigins = (process.env.ALLOWED_DEV_ORIGINS ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  allowedDevOrigins: ["localhost", "127.0.0.1", "0.0.0.0", ...envAllowedOrigins],
};

export default nextConfig;
