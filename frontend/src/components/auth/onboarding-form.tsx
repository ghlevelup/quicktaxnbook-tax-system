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
import { PhoneInput } from '@/components/ui/phone-input';
import { Skeleton } from '@/components/ui/skeleton';
import { roleHomePath } from '@/features/auth/lib/role-home';
import {
  businessOnboardingSchema,
  individualOnboardingSchema,
  type BusinessOnboardingInput,
  type IndividualOnboardingInput,
} from '@/features/auth/schemas/onboarding';
import type { CurrentUser } from '@/features/auth/types';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { ApiError, onboardingFetch } from '@/libs/api-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Controller,
  useForm,
  type FieldValues,
  type UseFormReturn,
} from 'react-hook-form';

interface OnboardingLinkInfo {
  firmName: string;
  clientDisplayName: string;
  clientType: 'INDIVIDUAL' | 'BUSINESS' | 'TRUST_ESTATE' | 'NONPROFIT';
  prefillFirstName: string | null;
  prefillLastName: string | null;
  prefillEmail: string | null;
  prefillPhone: string | null;
  expiresAt: string;
}

export function OnboardingForm({ token }: { token: string }) {
  const linkQuery = useQuery({
    queryKey: ['onboarding-link', token],
    queryFn: () =>
      onboardingFetch<OnboardingLinkInfo>(`/${token}`).then((r) => r.data),
    retry: false,
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

  const info = linkQuery.data;

  return (
    <Card
      flat
      className="w-full max-w-lg border-0 bg-transparent pb-10 shadow-none"
    >
      <CardHeader className="px-4">
        <CardTitle className="text-2xl">Welcome to {info.firmName}</CardTitle>
        <CardDescription>
          Set up your client portal account for {info.clientDisplayName}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {info.clientType === 'INDIVIDUAL' && info.prefillEmail ? (
          <IndividualOnboardingForm token={token} info={info} />
        ) : (
          <BusinessOnboardingForm token={token} info={info} />
        )}
      </CardContent>
    </Card>
  );
}

function useOnboardingComplete<T extends FieldValues>(
  token: string,
  form?: UseFormReturn<T>,
) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useApiMutation<{ user: CurrentUser }, T, T>({
    mutationFn: (values) =>
      onboardingFetch(`/${token}/complete`, { method: 'POST', body: values }),
    form,
    successMessage: 'Welcome! Your account is ready.',
    onSuccessData: (data) => {
      queryClient.setQueryData(['auth', 'me'], data.user);
      router.replace(roleHomePath(data.user));
      router.refresh();
    },
  });
}

function IndividualOnboardingForm({
  token,
  info,
}: {
  token: string;
  info: OnboardingLinkInfo;
}) {
  const mutation = useOnboardingComplete<
    IndividualOnboardingInput & { email: string }
  >(token);

  const form = useForm<IndividualOnboardingInput>({
    resolver: zodResolver(individualOnboardingSchema),
    defaultValues: {
      firstName: info.prefillFirstName ?? '',
      lastName: info.prefillLastName ?? '',
      phone: info.prefillPhone ?? '',
      password: '',
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate({ ...values, email: info.prefillEmail as string });
  });

  return (
    <form
      className="flex flex-col gap-4 sm:gap-6"
      onSubmit={onSubmit}
      noValidate
    >
      <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
        Signing up as{' '}
        <span className="font-medium text-foreground">{info.prefillEmail}</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" autoFocus {...form.register('firstName')} />
          <InputError message={form.formState.errors.firstName?.message} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" {...form.register('lastName')} />
          <InputError message={form.formState.errors.lastName?.message} />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="phone">Phone</Label>
        <Controller
          control={form.control}
          name="phone"
          render={({ field }) => (
            <PhoneInput
              id="phone"
              value={field.value}
              onChange={field.onChange}
            />
          )}
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
  );
}

function BusinessOnboardingForm({
  token,
  info,
}: {
  token: string;
  info: OnboardingLinkInfo;
}) {
  const form = useForm<BusinessOnboardingInput>({
    resolver: zodResolver(businessOnboardingSchema),
    defaultValues: {
      business: {
        legalName: info.clientDisplayName,
        ein: '',
        website: '',
        phone: '',
        address: {
          line1: '',
          line2: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'US',
        },
      },
      firstName: '',
      lastName: '',
      email: info.prefillEmail ?? '',
      phone: info.prefillPhone ?? '',
      password: '',
    },
  });

  const mutation = useOnboardingComplete<BusinessOnboardingInput>(token, form);

  const errors = form.formState.errors;

  const onSubmit = form.handleSubmit((values) => mutation.mutate(values));

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit} noValidate>
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 text-sm font-semibold text-foreground">
          Business information
        </legend>

        <div className="grid gap-2">
          <Label htmlFor="business.legalName">Legal business name</Label>
          <Input
            id="business.legalName"
            autoFocus
            {...form.register('business.legalName')}
          />
          <InputError message={errors.business?.legalName?.message} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="business.ein">EIN</Label>
            <Input
              id="business.ein"
              placeholder="12-3456789"
              {...form.register('business.ein')}
            />
            <InputError message={errors.business?.ein?.message} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="business.website">Website</Label>
            <Input
              id="business.website"
              placeholder="https://"
              {...form.register('business.website')}
            />
            <InputError message={errors.business?.website?.message} />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="business.phone">Business phone</Label>
          <Controller
            control={form.control}
            name="business.phone"
            render={({ field }) => (
              <PhoneInput
                id="business.phone"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="business.address.line1">Address</Label>
            <Input
              id="business.address.line1"
              placeholder="Street address"
              {...form.register('business.address.line1')}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="business.address.city">City</Label>
            <Input
              id="business.address.city"
              {...form.register('business.address.city')}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="business.address.state">State</Label>
              <Input
                id="business.address.state"
                placeholder="CA"
                {...form.register('business.address.state')}
              />
              <InputError message={errors.business?.address?.state?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="business.address.postalCode">ZIP</Label>
              <Input
                id="business.address.postalCode"
                placeholder="12345"
                {...form.register('business.address.postalCode')}
              />
              <InputError
                message={errors.business?.address?.postalCode?.message}
              />
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4 border-t border-border pt-4">
        <legend className="mb-1 text-sm font-semibold text-foreground">
          Your info (the person signing in)
        </legend>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" {...form.register('firstName')} />
            <InputError message={errors.firstName?.message} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" {...form.register('lastName')} />
            <InputError message={errors.lastName?.message} />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Your login email</Label>
          <Input id="email" type="email" {...form.register('email')} />
          <InputError message={errors.email?.message} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="phone">Your phone</Label>
          <Controller
            control={form.control}
            name="phone"
            render={({ field }) => (
              <PhoneInput
                id="phone"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <InputError message={errors.phone?.message} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">Create a password</Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            {...form.register('password')}
          />
          <InputError message={errors.password?.message} />
        </div>
      </fieldset>

      <Button type="submit" loading={mutation.isPending}>
        Complete setup &amp; sign in
      </Button>
    </form>
  );
}
