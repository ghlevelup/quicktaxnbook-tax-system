export interface ApiFieldError {
  path: string;
  message: string;
}

export class ApiError extends Error {
  statusCode: number;
  errors?: ApiFieldError[];

  constructor(message: string, statusCode: number, errors?: ApiFieldError[]) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

interface ApiEnvelope<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  errors?: ApiFieldError[];
}

interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  /** Set when sending a native FormData body (file uploads) — skips JSON.stringify/content-type. */
  isFormData?: boolean;
}

async function request<T>(
  basePath: string,
  path: string,
  { method = 'GET', body, isFormData = false }: ApiFetchOptions,
): Promise<{ message: string; data: T }> {
  const res = await fetch(`${basePath}${path}`, {
    method,
    credentials: 'same-origin',
    headers:
      isFormData || body === undefined
        ? undefined
        : { 'content-type': 'application/json' },
    body:
      body === undefined
        ? undefined
        : isFormData
          ? (body as FormData)
          : JSON.stringify(body),
  });

  const json = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!json || !json.success) {
    throw new ApiError(
      json?.message ?? 'Something went wrong. Please try again.',
      json?.statusCode ?? res.status,
      json?.errors,
    );
  }

  return { message: json.message, data: json.data as T };
}

/**
 * Client-side fetch for authenticated app data. Always hits our own
 * same-origin /api/backend/<path> proxy (never the Express API directly) so
 * the session cookie is sent automatically and tokens never touch the page.
 */
export function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {},
) {
  return request<T>('/api/backend', path, { method: 'GET', ...options });
}

/** Same shape, for the dedicated /api/auth/* routes (login, logout, me, ...). */
export function authFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {},
) {
  return request<T>('/api/auth', path, { method: 'POST', ...options });
}

/** Public, unauthenticated calls for the client onboarding flow. */
export function onboardingFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {},
) {
  return request<T>('/api/onboarding', path, { method: 'GET', ...options });
}
