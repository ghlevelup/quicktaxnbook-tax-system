'use client';

import { useApiMutation } from '@/hooks/use-api-mutation';
import { apiFetch } from '@/libs/api-client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import type { UpdateProfileInput } from '@/features/profile/schemas/profile';
import type { CurrentUser } from '@/features/auth/types';

const profileKey = () => ['profile'] as const;

export function useMyProfile() {
  return useQuery({
    queryKey: profileKey(),
    queryFn: () => apiFetch<CurrentUser>('/me').then((r) => r.data),
  });
}

function useInvalidateProfile() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: profileKey() });
    void queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
  };
}

export function useUpdateProfile() {
  const invalidate = useInvalidateProfile();
  return useApiMutation<CurrentUser, UpdateProfileInput>({
    mutationFn: (values) =>
      apiFetch('/me', {
        method: 'PATCH',
        body: {
          firstName: values.firstName || undefined,
          lastName: values.lastName || undefined,
          phone: values.phone || undefined,
        },
      }),
    onSuccessData: invalidate,
  });
}

export function useChangePassword() {
  return useApiMutation<
    unknown,
    { currentPassword: string; newPassword: string }
  >({
    mutationFn: (values) =>
      apiFetch('/me/password', { method: 'PATCH', body: values }),
  });
}

export function useUploadAvatar() {
  const invalidate = useInvalidateProfile();
  return useApiMutation<{ avatarUrl: string }, File>({
    mutationFn: (file) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return apiFetch('/me/avatar', {
        method: 'POST',
        body: formData,
        isFormData: true,
      });
    },
    onSuccessData: invalidate,
  });
}
