import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const basicAuthUser = process.env.BASIC_AUTH_USER || 'admin';
const basicAuthPass = process.env.BASIC_AUTH_PASS || 'password';
const basicAuth = Buffer.from(`${basicAuthUser}:${basicAuthPass}`).toString('base64');

export function middleware(request: NextRequest) {
  // Protect /admin and /api/admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const auth = request.headers.get('authorization');
    if (auth === `Basic ${basicAuth}`) {
      return NextResponse.next();
    }
    return new NextResponse('Auth required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' },
    });
  }
  return NextResponse.next();
} 