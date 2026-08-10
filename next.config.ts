import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep firebase-admin outside the Turbopack/server bundle so its
  // native/CJS dependency graph (jwks-rsa + jose) loads correctly on Vercel.
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;
