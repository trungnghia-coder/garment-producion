import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  bundlePagesRouterDependencies: true,
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;
