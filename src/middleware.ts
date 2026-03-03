import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";

  // Redirect non-www to www for beneluxgaa.com (prevents POST redirect issues)
  if (host === "beneluxgaa.com") {
    const url = request.nextUrl.clone();
    url.host = "www.beneluxgaa.com";
    url.protocol = "https";
    return NextResponse.redirect(url, 308);
  }

  // Clone the request headers
  const requestHeaders = new Headers(request.headers);

  // GGE Social domain routing is handled by next.config.ts rewrites

  // List of allowed domains
  const allowedDomains = [
    "localhost:3000",
    "localhost:3002", // Add port 3002 for development
    "playawaygaa.com",
    "www.playawaygaa.com",
    "playgaaaway.com",
    "www.playgaaaway.com",
    "gge-social.com",
    "www.gge-social.com",
    "gge-socials.com",
    "www.gge-socials.com",
    "beneluxgaa.com",
    "www.beneluxgaa.com",
  ];

  // Set the NEXTAUTH_URL dynamically based on the current domain
  if (allowedDomains.some((domain) => host.includes(domain))) {
    const protocol = request.url.startsWith("https") ? "https" : "http";
    const authUrl = `${protocol}://${host}`;
    requestHeaders.set("x-nextauth-url", authUrl);
  }

  // Continue with the request
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
