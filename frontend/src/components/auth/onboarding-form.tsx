'use client';

import { Icon } from '@/components/icons/app-icons';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { Skeleton } from '@/components/ui/skeleton';
import { roleHomePath } from '@/features/auth/lib/role-home';
import {
  completeOnboardingSchema,
  type CompleteOnboardingInput,
} from '@/features/auth/schemas/onboarding';
import type { CurrentUser } from '@/features/auth/types';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { ApiError, onboardingFetch } from '@/libs/api-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

interface OnboardingLinkInfo {
  firmName: string;
  clientDisplayName: string;
  expiresAt: string;
}

export function OnboardingForm({ token }: { token: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const linkQuery = useQuery({
    queryKey: ['onboarding-link', token],
    queryFn: () =>
      onboardingFetch<OnboardingLinkInfo>(`/${token}`).then((r) => r.data),
    retry: false,
  });

  const form = useForm<CompleteOnboardingInput>({
    resolver: zodResolver(completeOnboardingSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
    },
  });

  const mutation = useApiMutation<
    { user: CurrentUser },
    CompleteOnboardingInput,
    CompleteOnboardingInput
  >({
    mutationFn: (values) =>
      onboardingFetch(`/${token}/complete`, { method: 'POST', body: values }),
    form,
    successMessage: 'Welcome — your account is ready.',
    onSuccessData: (data) => {
      queryClient.setQueryData(['auth', 'me'], data.user);
      router.replace(roleHomePath(data.user));
      router.refresh();
    },
  });

  if (linkQuery.isPending) {
    return (
      <div className="flex w-full max-w-md flex-col gap-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (linkQuery.isError || !linkQuery.data) {
    const message =
      linkQuery.error instanceof ApiError
        ? linkQuery.error.message
        : 'This onboarding link is invalid or has expired.';
    return (
      <Card
        flat
        className="w-full max-w-md border-0 bg-transparent pb-10 shadow-none"
      >
        <CardHeader className="px-4">
          <div className="flex items-center gap-2 text-destructive">
            <Icon name="linkBreak" weight="fill" className="h-6 w-6" />
            <CardTitle className="text-2xl">Link unavailable</CardTitle>
          </div>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Contact your firm to request a new onboarding link.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      flat
      className="w-full max-w-md border-0 bg-transparent pb-10 shadow-none"
    >
      <CardHeader className="px-4">
        <CardTitle className="text-2xl">
          Welcome to {linkQuery.data.firmName}
        </CardTitle>
        <CardDescription>
          Set up your client portal account for{' '}
          {linkQuery.data.clientDisplayName}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-4 sm:gap-6"
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          noValidate
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                autoComplete="given-name"
                autoFocus
                aria-invalid={!!form.formState.errors.firstName}
                {...form.register('firstName')}
              />
              <InputError message={form.formState.errors.firstName?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                autoComplete="family-name"
                aria-invalid={!!form.formState.errors.lastName}
                {...form.register('lastName')}
              />
              <InputError message={form.formState.errors.lastName?.message} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!form.formState.errors.email}
              {...form.register('email')}
            />
            <InputError message={form.formState.errors.email?.message} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="(555) 555-5555"
              aria-invalid={!!form.formState.errors.phone}
              {...form.register('phone')}
            />
            <InputError message={form.formState.errors.phone?.message} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Create a password</Label>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              aria-invalid={!!form.formState.errors.password}
              {...form.register('password')}
            />
            <InputError message={form.formState.errors.password?.message} />
          </div>

          <Button type="submit" loading={mutation.isPending}>
            Complete setup &amp; sign in
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
