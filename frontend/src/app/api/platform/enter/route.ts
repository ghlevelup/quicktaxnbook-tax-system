import { NextResponse } from 'next/server';

import { setAuthCookies, type TokenPair } from '@/libs/auth-cookies';
import { backendFetch } from '@/libs/backend';

interface EnterPayload {
  outcome: 'OK' | 'TOKEN_REQUIRED';
  tokens?: TokenPair;
}

const enter = (body: unknown) =>
  backendFetch<EnterPayload>('/platform/agency/enter', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

/**
 * `/platform?relationshipNumber=...`: the agency admin arrives with only the
 * relationship number.
 * Express checks the token saved for that agency against GoHighLevel; if it is
 * still good the platform-owner session cookies are set and the dashboard opens.
 * Otherwise the page is sent back to the token form.
 */
export async function GET(req: Request): Promise<NextResponse> {
  const url = new URL(req.url);
  const relationshipNumber = url.searchParams.get('relationshipNumber') ?? '';

  const { status, body } = await enter({ relationshipNumber });

  const back = new URL('/platform', url);
  if (!body.success || !body.data) {
    back.searchParams.set('error', body.message || `Failed (${status})`);
    return NextResponse.redirect(back);
  }
  if (body.data.outcome === 'TOKEN_REQUIRED' || !body.data.tokens) {
    back.searchParams.set('connect', '1');
    back.searchParams.set('relationshipNumber', relationshipNumber);
    return NextResponse.redirect(back);
  }

  const response = NextResponse.redirect(new URL('/platform/firms', url));
  setAuthCookies(response.cookies, body.data.tokens);
  return response;
}

/**
 * The token form: `{ relationshipNumber, privateToken }`. The session
 * tokens are stripped from the JSON and set as httpOnly cookies, so client
 * JavaScript never sees them.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const payload = (await req.json().catch(() => null)) as unknown;
  const { status, body } = await enter(payload);

  if (!body.success || !body.data?.tokens) {
    return NextResponse.json(body, { status: status >= 400 ? status : 400 });
  }

  const { tokens, ...data } = body.data;
  const response = NextResponse.json({ ...body, data }, { status });
  setAuthCookies(response.cookies, tokens);
  return response;
}
