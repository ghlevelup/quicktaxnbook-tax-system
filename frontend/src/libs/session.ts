import 'server-only';

import type { TokenPair } from '@/libs/auth-cookies';
import { backendFetch } from '@/libs/backend';

export async function refreshTokens(
  refreshToken: string,
): Promise<TokenPair | null> {
  const { status, body } = await backendFetch<TokenPair>(
    '/auth/refresh-token',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    },
  );
  if (status !== 200 || !body.success || !body.data) return null;
  return body.data;
}
