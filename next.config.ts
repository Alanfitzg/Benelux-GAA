import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        // Domain-based rewrites for club sites
        // gge-social.com
        {
          source: "/",
          has: [{ type: "host", value: "gge-social.com" }],
          destination: "/demo/rome-hibernia",
        },
        {
          source: "/",
          has: [{ type: "host", value: "www.gge-social.com" }],
          destination: "/demo/rome-hibernia",
        },
        // romehiberniagaa.it
        {
          source: "/",
          has: [{ type: "host", value: "romehiberniagaa.it" }],
          destination: "/demo/rome-hibernia",
        },
        {
          source: "/",
          has: [{ type: "host", value: "www.romehiberniagaa.it" }],
          destination: "/demo/rome-hibernia",
        },
        // beneluxgaa.com
        {
          source: "/",
          has: [{ type: "host", value: "beneluxgaa.com" }],
          destination: "/demo/benelux-gaa",
        },
        {
          source: "/",
          has: [{ type: "host", value: "www.beneluxgaa.com" }],
          destination: "/demo/benelux-gaa",
        },
      ],
      afterFiles: [
        // Path rewrites go in afterFiles so static files are served first
        // gge-social.com
        {
          source: "/:path*",
          has: [{ type: "host", value: "gge-social.com" }],
          destination: "/demo/rome-hibernia/:path*",
        },
        {
          source: "/:path*",
          has: [{ type: "host", value: "www.gge-social.com" }],
          destination: "/demo/rome-hibernia/:path*",
        },
        // romehiberniagaa.it
        {
          source: "/:path*",
          has: [{ type: "host", value: "romehiberniagaa.it" }],
          destination: "/demo/rome-hibernia/:path*",
        },
        {
          source: "/:path*",
          has: [{ type: "host", value: "www.romehiberniagaa.it" }],
          destination: "/demo/rome-hibernia/:path*",
        },
        // beneluxgaa.com
        {
          source: "/:path*",
          has: [{ type: "host", value: "beneluxgaa.com" }],
          destination: "/demo/benelux-gaa/:path*",
        },
        {
          source: "/:path*",
          has: [{ type: "host", value: "www.beneluxgaa.com" }],
          destination: "/demo/benelux-gaa/:path*",
        },
        // Benelux GAA custom domain
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
          source: "/:path((?!demo|api|_next).*)",
          has: [
            {
              type: "host",
              value: "beneluxgaa.com",
            },
          ],
          destination: "/demo/benelux-gaa/:path",
        },
        {
          source: "/:path((?!demo|api|_next).*)",
          has: [
            {
              type: "host",
              value: "www.beneluxgaa.com",
            },
          ],
          destination: "/demo/benelux-gaa/:path",
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
