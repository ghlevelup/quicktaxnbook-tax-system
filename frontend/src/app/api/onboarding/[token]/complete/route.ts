import { NextResponse } from 'next/server';

import type { TokenPair } from '@/libs/auth-cookies';
import { setAuthCookies } from '@/libs/auth-cookies';
import { backendFetch } from '@/libs/backend';

export async function POST(
  req: Request,
  ctx: { params: Promise<{ token: string }> },
) {
  const { token } = await ctx.params;
  const payload = await req.text();

  const { status, body } = await backendFetch<{
    user: unknown;
    tokens: TokenPair;
  }>(`/onboarding/${encodeURIComponent(token)}/complete`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: payload,
  });

  if (!body.success || !body.data) {
    return NextResponse.json(body, { status });
  }

  const response = NextResponse.json(
    { ...body, data: { user: body.data.user } },
    { status },
  );
  setAuthCookies(response.cookies, body.data.tokens);
  return response;
}
