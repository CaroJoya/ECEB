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

// Pages that a signed-in user should never see — bounce them to the app.
const AUTH_PAGES = ['/', '/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userId = request.cookies.get('currentUserId')?.value;

  // 1. Signed-in users skip marketing / login pages.
  if (userId && AUTH_PAGES.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/discover';
    url.search = '';
    return NextResponse.redirect(url);
  }

  // 2. Protect authenticated routes.
  const needsAuth = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );
  if (!needsAuth) {
    return NextResponse.next();
  }

  if (!userId) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/dashboard/:path*',
    '/upload/:path*',
    '/chat/:path*',
    '/settings/:path*',
    '/admin/:path*',
    '/notifications/:path*',
    '/collaborate/:path*',
  ],
};