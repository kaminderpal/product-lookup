import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos"
      },
      {
        protocol: "https",
        hostname: "i5.walmartimages.com"
      },
      {
        protocol: "https",
        hostname: "i.walmartimages.com"
      }
    ]
  }
};

export default nextConfig;
