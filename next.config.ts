import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/flighty",
  images: { unoptimized: true },
};

export default nextConfig;
