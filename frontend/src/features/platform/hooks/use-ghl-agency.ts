'use client';

import { useApiMutation } from '@/hooks/use-api-mutation';
import { apiFetch } from '@/libs/api-client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseFormReturn } from 'react-hook-form';

import type { ConnectAgencyInput } from '@/features/platform/schemas/connect-agency';
import type {
  ConnectAgencyResult,
  GhlAgencyLocationList,
  GhlAgencyState,
} from '@/features/platform/types';

const agencyKey = () => ['platform', 'ghl', 'agency'] as const;
const locationsKey = (page: number) =>
  ['platform', 'ghl', 'agency', 'locations', page] as const;
const locationsPrefix = () =>
  ['platform', 'ghl', 'agency', 'locations'] as const;

/** Whether the agency is connected, and which one. */
export function useGhlAgencyState() {
  return useQuery({
    queryKey: agencyKey(),
    queryFn: () =>
      apiFetch<GhlAgencyState>('/platform/ghl/agency').then((r) => r.data),
  });
}

/** Convenience wrapper: just the connection, for the panel that renders it. */
export function useGhlAgency() {
  const { data, ...rest } = useGhlAgencyState();
  return { ...rest, data: data?.connection ?? null };
}

/** Verifies the pasted token + company id with GoHighLevel, then stores them. */
export function useConnectGhlAgency(form?: UseFormReturn<ConnectAgencyInput>) {
  const queryClient = useQueryClient();
  return useApiMutation<
    ConnectAgencyResult,
    ConnectAgencyInput,
    ConnectAgencyInput
  >({
    mutationFn: (values) =>
      apiFetch('/platform/ghl/agency/connect', {
        method: 'POST',
        body: {
          privateToken: values.privateToken,
          relationshipNumber: values.relationshipNumber.trim(),
        },
      }),
    form,
    onSuccessData: () => {
      void queryClient.invalidateQueries({ queryKey: agencyKey() });
      void queryClient.invalidateQueries({ queryKey: locationsPrefix() });
    },
  });
}

export function useGhlAgencyLocations(page: number, enabled: boolean) {
  return useQuery({
    queryKey: locationsKey(page),
    queryFn: () =>
      apiFetch<GhlAgencyLocationList>(
        `/platform/ghl/agency/locations?page=${page}&limit=25`,
      ).then((r) => r.data),
    enabled,
  });
}
