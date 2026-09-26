import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED = [
  '/dashboard',
  '/upload',
  '/chat',
  '/settings',
  '/admin',
  '/notifications',
  '/collaborate',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const needsAuth = PROTECTED.some((p) => pathname.startsWith(p));
  if (!needsAuth) {
    return NextResponse.next();
  }

  const userId = request.cookies.get('currentUserId')?.value;

  if (!userId) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/upload/:path*',
    '/chat/:path*',
    '/settings/:path*',
    '/admin/:path*',
    '/notifications/:path*',
    '/collaborate/:path*',
  ],
};