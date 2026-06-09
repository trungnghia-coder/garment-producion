import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "firebase-admin",
    "firebase-admin/app",
    "firebase-admin/auth",
  ],
};

export default nextConfig;
