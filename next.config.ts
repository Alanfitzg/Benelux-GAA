import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        // When accessing gge-social.com, rewrite to Rome Hibernia demo
        {
          source: "/",
          has: [
            {
              type: "host",
              value: "gge-social.com",
            },
          ],
          destination: "/demo/rome-hibernia",
        },
        {
          source: "/",
          has: [
            {
              type: "host",
              value: "www.gge-social.com",
            },
          ],
          destination: "/demo/rome-hibernia",
        },
        {
          source: "/:path*",
          has: [
            {
              type: "host",
              value: "gge-social.com",
            },
          ],
          destination: "/demo/rome-hibernia/:path*",
        },
        {
          source: "/:path*",
          has: [
            {
              type: "host",
              value: "www.gge-social.com",
            },
          ],
          destination: "/demo/rome-hibernia/:path*",
        },
        // Rome Hibernia GAA Italian domain
        {
          source: "/",
          has: [
            {
              type: "host",
              value: "romehiberniagaa.it",
            },
          ],
          destination: "/demo/rome-hibernia",
        },
        {
          source: "/",
          has: [
            {
              type: "host",
              value: "www.romehiberniagaa.it",
            },
          ],
          destination: "/demo/rome-hibernia",
        },
        {
          source: "/:path*",
          has: [
            {
              type: "host",
              value: "romehiberniagaa.it",
            },
          ],
          destination: "/demo/rome-hibernia/:path*",
        },
        {
          source: "/:path*",
          has: [
            {
              type: "host",
              value: "www.romehiberniagaa.it",
            },
          ],
          destination: "/demo/rome-hibernia/:path*",
        },
        // Benelux GAA standalone site (custom domain)
        {
          source: "/",
          has: [
            {
              type: "host",
              value: "beneluxgaa.com",
            },
          ],
          destination: "/demo/benelux-gaa",
        },
        {
          source: "/",
          has: [
            {
              type: "host",
              value: "www.beneluxgaa.com",
            },
          ],
          destination: "/demo/benelux-gaa",
        },
        {
          source: "/:path*",
          has: [
            {
              type: "host",
              value: "beneluxgaa.com",
            },
          ],
          destination: "/demo/benelux-gaa/:path*",
        },
        {
          source: "/:path*",
          has: [
            {
              type: "host",
              value: "www.beneluxgaa.com",
            },
          ],
          destination: "/demo/benelux-gaa/:path*",
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
