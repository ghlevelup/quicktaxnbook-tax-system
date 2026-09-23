'use client';

import { useApiMutation } from '@/hooks/use-api-mutation';
import { apiFetch } from '@/libs/api-client';
import type { PaginatedResult } from '@/libs/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import type { CreateTeamMemberInput } from '@/features/team/schemas/team';
import type { MemberStatus, TeamMember } from '@/features/team/types';

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
