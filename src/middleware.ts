import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Clone the request headers
  const requestHeaders = new Headers(request.headers)
  
  // Get the host from the request
  const host = request.headers.get('host') || ''
  
  // List of allowed domains
  const allowedDomains = [
    'localhost:3000',
    'localhost:3002', // Add port 3002 for development
    'playawaygaa.com',
    'www.playawaygaa.com',
    'playgaaaway.com',
    'www.playgaaaway.com',
    // Add your Vercel preview URLs if needed
  ]
  
  // Set the NEXTAUTH_URL dynamically based on the current domain
  if (allowedDomains.some(domain => host.includes(domain))) {
    const protocol = request.url.startsWith('https') ? 'https' : 'http'
    const authUrl = `${protocol}://${host}`
    requestHeaders.set('x-nextauth-url', authUrl)
  }
  
  // Continue with the request
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
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
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}