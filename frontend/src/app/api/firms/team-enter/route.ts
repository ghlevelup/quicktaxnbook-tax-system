import { NextResponse } from 'next/server';

import { setAuthCookies, type TokenPair } from '@/libs/auth-cookies';
import { backendFetch } from '@/libs/backend';
import { publicUrl } from '@/libs/public-url';

interface TeamEnterPayload {
  firm: { slug: string };
  tokens: TokenPair;
}

/**
 * `/firms/{locationId}/teams/{userId}` entry for a team member. Express checks the
 * sub-account, then that the user is staff of it, before signing them in. Session
 * cookies are set here (httpOnly); failures go back to the page with a message.
 */
export async function GET(req: Request): Promise<NextResponse> {
  const url = publicUrl(req, req.url);
  const locationId = url.searchParams.get('locationId') ?? '';
  const userId = url.searchParams.get('userId') ?? '';

  const { status, body } = await backendFetch<TeamEnterPayload>(
    '/ghl/firm/team-enter',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ locationId, userId }),
    },
  );

  if (!body.success || !body.data) {
    const target = publicUrl(
      req,
      `/firms/${encodeURIComponent(locationId)}/teams/${encodeURIComponent(userId)}`,
    );
    target.searchParams.set('error', body.message || `Failed (${status})`);
    return NextResponse.redirect(target);
  }

  const response = NextResponse.redirect(
    publicUrl(req, `/firm/${body.data.firm.slug}/dashboard`),
  );
  setAuthCookies(response.cookies, body.data.tokens);
  return response;
}
