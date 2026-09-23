import { NextResponse, type NextRequest } from 'next/server';

import { ACCESS_COOKIE } from '@/libs/auth-cookies';

// Fast, cookie-presence-only redirect for obviously-unauthenticated visits.
// Real authorization (role checks, token validity) happens server-side in
// each area's layout.tsx via requireRole() — this is a UX shortcut only.
const STAFF_PREFIXES = ['/platform', '/firm'];
const CLIENT_PREFIXES = ['/client'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(ACCESS_COOKIE);

  if (hasSession) return NextResponse.next();

  const isStaffPath = STAFF_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isClientPath = CLIENT_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isStaffPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (isClientPath) {
    return NextResponse.redirect(new URL('/client-login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/platform/:path*', '/firm/:path*', '/client/:path*'],
};
