import type { NextResponse } from 'next/server';

type CookieJar = NextResponse['cookies'];

export const ACCESS_COOKIE = 'qt_access';
export const REFRESH_COOKIE = 'qt_refresh';

export interface TokenPair {
  access: { token: string; expires: string | Date };
  refresh: { token: string; expires: string | Date };
}

const isProd = process.env.NODE_ENV === 'production';

/**
 * The app is opened inside a GoHighLevel custom-menu iframe, so in production the
 * browser treats these as THIRD-PARTY cookies. `SameSite=Lax` cookies are never
 * sent from a cross-site iframe, which silently breaks the session. Production
 * therefore uses `SameSite=None; Secure; Partitioned`: the cookie is stored per
 * embedding site (CHIPS), which is what browsers still allow for iframes. Local
 * http keeps `Lax`, since `None` requires HTTPS.
 */
const cookieSecurity = isProd
  ? ({ secure: true, sameSite: 'none', partitioned: true } as const)
  : ({ secure: false, sameSite: 'lax' } as const);

function maxAgeSeconds(expires: string | Date): number {
  const ms = new Date(expires).getTime() - Date.now();
  return Math.max(Math.floor(ms / 1000), 60);
}

/** Sets both session cookies on a Route Handler's cookie jar (NextResponse.cookies or next/headers cookies()). */
export function setAuthCookies(jar: CookieJar, tokens: TokenPair): void {
  jar.set(ACCESS_COOKIE, tokens.access.token, {
    httpOnly: true,
    ...cookieSecurity,
    path: '/',
    maxAge: maxAgeSeconds(tokens.access.expires),
  });
  jar.set(REFRESH_COOKIE, tokens.refresh.token, {
    httpOnly: true,
    ...cookieSecurity,
    path: '/',
    maxAge: maxAgeSeconds(tokens.refresh.expires),
  });
}

export function clearAuthCookies(jar: CookieJar): void {
  // Must repeat the same security attributes, or a partitioned cookie isn't cleared.
  jar.set(ACCESS_COOKIE, '', { httpOnly: true, ...cookieSecurity, path: '/', maxAge: 0 });
  jar.set(REFRESH_COOKIE, '', { httpOnly: true, ...cookieSecurity, path: '/', maxAge: 0 });
}
