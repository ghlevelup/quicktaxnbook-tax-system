'use client';

import { useApiMutation } from '@/hooks/use-api-mutation';
import { apiFetch } from '@/libs/api-client';
import type { PaginatedResult } from '@/libs/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import type { CreateClientInput } from '@/features/clients/schemas/client';
import type {
  ClientRecord,
  ClientStatus,
  GhlClientSyncResult,
} from '@/features/clients/types';

const clientsKey = () => ['clients'] as const;

export function useClients() {
  return useQuery({
    queryKey: clientsKey(),
    queryFn: () =>
      apiFetch<PaginatedResult<ClientRecord>>('/clients').then((r) => r.data),
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useApiMutation<ClientRecord, CreateClientInput>({
    mutationFn: (values) =>
      apiFetch('/clients', {
        method: 'POST',
        body: {
          ...values,
          email: values.email || undefined,
          phone: values.phone || undefined,
        },
      }),
    onSuccessData: () => {
      void queryClient.invalidateQueries({ queryKey: clientsKey() });
    },
  });
}

/**
 * Pulls contacts tagged as clients out of the firm's GoHighLevel sub-account and
 * mirrors them into the client list. Read-only against GoHighLevel.
 */
export function useSyncClientsFromGhl() {
  const queryClient = useQueryClient();
  return useApiMutation<GhlClientSyncResult, void>({
    mutationFn: () => apiFetch('/clients/ghl/sync', { method: 'POST' }),
    onSuccessData: () => {
      void queryClient.invalidateQueries({ queryKey: clientsKey() });
    },
  });
}

/**
 * Silently mirrors GoHighLevel "client" contacts once per visit to the list, so
 * clients that already exist in the sub-account show up without a manual click.
 * Failures (e.g. firm not connected yet) are ignored; the manual button still
 * reports them.
 */
export function useAutoSyncClientsFromGhl() {
  const queryClient = useQueryClient();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    apiFetch<GhlClientSyncResult>('/clients/ghl/sync', { method: 'POST' })
      .then(({ data }) => {
        if (data.created > 0 || data.updated > 0) {
          void queryClient.invalidateQueries({ queryKey: clientsKey() });
        }
      })
      .catch(() => {});
  }, [queryClient]);
}

export function useSetClientStatus() {
  const queryClient = useQueryClient();
  return useApiMutation<
    ClientRecord,
    { clientId: string; status: Extract<ClientStatus, 'ACTIVE' | 'INACTIVE'> }
  >({
    mutationFn: ({ clientId, status }) =>
      apiFetch(`/clients/${clientId}/status`, {
        method: 'PATCH',
        body: { status },
      }),
    onSuccessData: () => {
      void queryClient.invalidateQueries({ queryKey: clientsKey() });
    },
  });
}

export function useCreateOnboardingLink() {
  return useApiMutation<
    { onboardingUrl: string; expiresAt: string },
    { clientId: string }
  >({
    mutationFn: ({ clientId }) =>
      apiFetch(`/clients/${clientId}/onboarding-link`, { method: 'POST' }),
  });
}
