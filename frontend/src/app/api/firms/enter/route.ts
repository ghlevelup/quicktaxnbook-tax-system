import { NextResponse } from 'next/server';

import { setAuthCookies, type TokenPair } from '@/libs/auth-cookies';
import { backendFetch } from '@/libs/backend';

interface EnterPayload {
  outcome: 'OK' | 'TOKEN_REQUIRED';
  firm?: { slug: string };
  tokens?: TokenPair;
}

/**
 * `/firms/{locationId}` entry for the firm owner. Express checks the sub-account
 * against the agency and the firm's stored token against GoHighLevel; on success
 * the session cookies are set here (httpOnly) and the owner lands on the
 * dashboard. When no working token is on file, the page is sent to the token form.
 */
export async function GET(req: Request): Promise<NextResponse> {
  const url = new URL(req.url);
  const locationId = url.searchParams.get('locationId') ?? '';
  const page = `/firms/${encodeURIComponent(locationId)}`;

  const { status, body } = await backendFetch<EnterPayload>('/ghl/firm/enter', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ locationId }),
  });

  if (!body.success || !body.data) {
    const target = new URL(page, url);
    target.searchParams.set('error', body.message || `Failed (${status})`);
    return NextResponse.redirect(target);
  }

  if (body.data.outcome === 'TOKEN_REQUIRED' || !body.data.tokens) {
    const target = new URL(page, url);
    target.searchParams.set('connect', '1');
    return NextResponse.redirect(target);
  }

  const response = NextResponse.redirect(
    new URL(`/firm/${body.data.firm?.slug}/dashboard`, url),
  );
  setAuthCookies(response.cookies, body.data.tokens);
  return response;
}
