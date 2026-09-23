'use client';

import { useApiMutation } from '@/hooks/use-api-mutation';
import { apiFetch } from '@/libs/api-client';
import type { PaginatedResult } from '@/libs/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import type { CreateClientInput } from '@/features/clients/schemas/client';
import type { ClientRecord } from '@/features/clients/types';

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

export function useCreateOnboardingLink() {
  return useApiMutation<
    { onboardingUrl: string; expiresAt: string },
    { clientId: string }
  >({
    mutationFn: ({ clientId }) =>
      apiFetch(`/clients/${clientId}/onboarding-link`, { method: 'POST' }),
    successMessage: false,
  });
}
