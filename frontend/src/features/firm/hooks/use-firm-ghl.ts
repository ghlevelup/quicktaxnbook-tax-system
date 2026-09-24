'use client';

import type { UseFormReturn } from 'react-hook-form';

import type { ConnectFirmGhlInput } from '@/features/firm/schemas/connect-firm-ghl';
import type { GhlFirmConnectResult } from '@/features/firm/types';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { firmFetch } from '@/libs/api-client';

/**
 * Connects a sub-account by proving its Private Integration Token.
 *
 * On success the route handler has already set the session cookies (the token is
 * the credential), so the caller only needs to navigate to the firm dashboard.
 * The token is never returned in the response.
 */
export function useConnectFirmGhl(
  locationId: string,
  form?: UseFormReturn<ConnectFirmGhlInput>,
) {
  return useApiMutation<
    GhlFirmConnectResult,
    ConnectFirmGhlInput,
    ConnectFirmGhlInput
  >({
    mutationFn: (values) =>
      firmFetch('/ghl/connect', {
        method: 'POST',
        body: { locationId, privateToken: values.privateToken },
      }),
    form,
  });
}
