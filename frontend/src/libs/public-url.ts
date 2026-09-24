/**
 * An absolute URL on the address the BROWSER used, for redirects issued from route
 * handlers and middleware. Behind a proxy (Railway, Vercel) `request.url` can carry
 * the internal host (`0.0.0.0:PORT`), which would send the browser somewhere
 * unreachable, so the forwarded headers win.
 */
export function publicUrl(request: Request, path: string): URL {
  const headers = request.headers;
  const host = headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  const proto = headers.get('x-forwarded-proto')?.split(',')[0]?.trim();

  const base = new URL(request.url);
  if (host) {
    base.host = host;
    base.protocol = `${proto ?? 'https'}:`;
  }
  return new URL(path, base);
}
