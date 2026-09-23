import type { NextResponse } from 'next/server';

type CookieJar = NextResponse['cookies'];

export const ACCESS_COOKIE = 'qt_access';
export const REFRESH_COOKIE = 'qt_refresh';

export interface TokenPair {
  access: { token: string; expires: string | Date };
  refresh: { token: string; expires: string | Date };
}

const isProd = process.env.NODE_ENV === 'production';

function maxAgeSeconds(expires: string | Date): number {
  const ms = new Date(expires).getTime() - Date.now();
  return Math.max(Math.floor(ms / 1000), 60);
}

/** Sets both session cookies on a Route Handler's cookie jar (NextResponse.cookies or next/headers cookies()). */
export function setAuthCookies(jar: CookieJar, tokens: TokenPair): void {
  jar.set(ACCESS_COOKIE, tokens.access.token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSeconds(tokens.access.expires),
  });
  jar.set(REFRESH_COOKIE, tokens.refresh.token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSeconds(tokens.refresh.expires),
  });
}

export function clearAuthCookies(jar: CookieJar): void {
  jar.set(ACCESS_COOKIE, '', { path: '/', maxAge: 0 });
  jar.set(REFRESH_COOKIE, '', { path: '/', maxAge: 0 });
}
