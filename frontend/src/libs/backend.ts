import 'server-only';

import { env } from '@/libs/env';

export interface BackendFieldError {
  path: string;
  message: string;
}

export interface BackendEnvelope<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  errors?: BackendFieldError[];
}

/** Server-only fetch against the Express API. Never throws — network/parse
 * failures are normalized into a synthetic envelope so callers have one shape
 * to handle. */
export async function backendFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<{ status: number; body: BackendEnvelope<T> }> {
  try {
    const res = await fetch(`${env.EXPRESS_API_URL}${path}`, {
      ...init,
      cache: 'no-store',
    });
    const body = (await res
      .json()
      .catch(() => null)) as BackendEnvelope<T> | null;
    if (!body) {
      return {
        status: 502,
        body: {
          success: false,
          statusCode: 502,
          message: 'The server returned an unexpected response.',
        },
      };
    }
    return { status: res.status, body };
  } catch {
    return {
      status: 503,
      body: {
        success: false,
        statusCode: 503,
        message: 'Could not reach the server. Please try again.',
      },
    };
  }
}

export function bearer(token?: string): HeadersInit {
  return token ? { authorization: `Bearer ${token}` } : {};
}
