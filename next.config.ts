import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        // When accessing gge-social.com, rewrite to /gge routes
        {
          source: "/",
          has: [
            {
              type: "host",
              value: "gge-social.com",
            },
          ],
          destination: "/gge",
        },
        {
          source: "/",
          has: [
            {
              type: "host",
              value: "www.gge-social.com",
            },
          ],
          destination: "/gge",
        },
        {
          source: "/:path*",
          has: [
            {
              type: "host",
              value: "gge-social.com",
            },
          ],
          destination: "/gge/:path*",
        },
        {
          source: "/:path*",
          has: [
            {
              type: "host",
              value: "www.gge-social.com",
            },
          ],
          destination: "/gge/:path*",
        },
      ],
    };
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gaelic-trips-bucket.s3.eu-west-1.amazonaws.com",
      },
    ],
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizePackageImports: ["@heroicons/react"],
  },
};

export default nextConfig;
