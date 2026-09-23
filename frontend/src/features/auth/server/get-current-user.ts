import 'server-only';

import { cookies } from 'next/headers';
import { cache } from 'react';

import { ACCESS_COOKIE } from '@/libs/auth-cookies';
import { backendFetch, bearer } from '@/libs/backend';
import type { CurrentUser } from '@/features/auth/types';

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  if (!accessToken) return null;

  const { status, body } = await backendFetch<CurrentUser>('/me', {
    headers: bearer(accessToken),
  });

  if (status !== 200 || !body.success || !body.data) return null;
  return body.data;
});
