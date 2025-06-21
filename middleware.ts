import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createRateLimitMiddleware, RATE_LIMITS } from "@/lib/rate-limit"

// Create rate limiters for different route types
const authRateLimit = createRateLimitMiddleware(RATE_LIMITS.AUTH)

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Apply rate limiting to auth routes
  if (path.startsWith("/api/auth")) {
    const rateLimitResponse = authRateLimit(request)
    if (rateLimitResponse) {
      return rateLimitResponse
    }
  }
  
  // Allow public routes
  const publicPaths = [
    "/",
    "/signin",
    "/signup",
    "/api/auth",
    "/api/clubs",
    "/api/events",
    "/api/interest",
  ]
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(publicPath + "/")
  )
  
  // Allow public access to GET requests for clubs and events
  const isPublicApiGet = 
    (path.startsWith("/api/clubs") || path.startsWith("/api/events")) && 
    request.method === "GET"
  
  if (isPublicPath || isPublicApiGet) {
    return NextResponse.next()
  }
  
  // For protected routes, we'll check authentication in the API routes themselves
  // This allows for more granular control based on user roles
  return NextResponse.next()
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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}