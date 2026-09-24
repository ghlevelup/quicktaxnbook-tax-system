'use client';

import { useApiMutation } from '@/hooks/use-api-mutation';
import { apiFetch } from '@/libs/api-client';
import type { PaginatedResult } from '@/libs/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import type { CreateTeamMemberInput } from '@/features/team/schemas/team';
import type {
  GhlTeamSyncResult,
  MemberStatus,
  TeamMember,
} from '@/features/team/types';

const teamKey = () => ['team'] as const;

export function useTeamMembers(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: teamKey(),
    queryFn: () =>
      apiFetch<PaginatedResult<TeamMember>>('/team').then((r) => r.data),
    enabled: options.enabled,
  });
}

export function useCreateTeamMember() {
  const queryClient = useQueryClient();
  return useApiMutation<
    { member: TeamMember; temporaryPassword: string },
    CreateTeamMemberInput
  >({
    mutationFn: (values) =>
      apiFetch('/team', {
        method: 'POST',
        body: {
          ...values,
          phone: values.phone || undefined,
          title: values.title || undefined,
        },
      }),
    onSuccessData: () => {
      void queryClient.invalidateQueries({ queryKey: teamKey() });
    },
  });
}

export function useSetTeamMemberStatus() {
  const queryClient = useQueryClient();
  return useApiMutation<
    { member: TeamMember },
    { memberId: string; status: MemberStatus }
  >({
    mutationFn: ({ memberId, status }) =>
      apiFetch(`/team/${memberId}/status`, {
        method: 'PATCH',
        body: { status },
      }),
    onSuccessData: () => {
      void queryClient.invalidateQueries({ queryKey: teamKey() });
    },
  });
}

export function useResetTeamMemberPassword() {
  return useApiMutation<
    { member: TeamMember; temporaryPassword: string },
    { memberId: string }
  >({
    mutationFn: ({ memberId }) =>
      apiFetch(`/team/${memberId}/reset-password`, { method: 'PATCH' }),
  });
}

/** Pulls the GoHighLevel sub-account's staff into the team. Read-only against GoHighLevel. */
export function useSyncTeamFromGhl() {
  const queryClient = useQueryClient();
  return useApiMutation<GhlTeamSyncResult, void>({
    mutationFn: () => apiFetch('/team/ghl/sync', { method: 'POST' }),
    onSuccessData: () => {
      void queryClient.invalidateQueries({ queryKey: teamKey() });
    },
  });
}

/** Silently mirrors GoHighLevel staff once per visit; the manual button reports failures. */
export function useAutoSyncTeamFromGhl() {
  const queryClient = useQueryClient();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    apiFetch<GhlTeamSyncResult>('/team/ghl/sync', { method: 'POST' })
      .then(({ data }) => {
        if (data.created > 0 || data.updated > 0) {
          void queryClient.invalidateQueries({ queryKey: teamKey() });
        }
      })
      .catch(() => {});
  }, [queryClient]);
}
