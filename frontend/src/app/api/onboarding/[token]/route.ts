import { NextResponse } from 'next/server';

import { backendFetch } from '@/libs/backend';

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ token: string }> },
) {
  const { token } = await ctx.params;
  const { status, body } = await backendFetch(
    `/onboarding/${encodeURIComponent(token)}`,
  );
  return NextResponse.json(body, { status });
}
