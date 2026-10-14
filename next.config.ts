import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Preview environments proxy the dev server through a public host, so allow
  // cross-origin dev requests from the sandbox preview domains.
  allowedDevOrigins: ["*.e2b.app", "localhost", "127.0.0.1"],
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
