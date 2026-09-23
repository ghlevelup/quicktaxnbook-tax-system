import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { clearAuthCookies, REFRESH_COOKIE } from '@/libs/auth-cookies';
import { backendFetch } from '@/libs/backend';

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (refreshToken) {
    await backendFetch('/auth/logout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
  }

  const response = NextResponse.json({
    success: true,
    statusCode: 200,
    message: 'Logged out successfully',
  });
  clearAuthCookies(response.cookies);
  return response;
}
