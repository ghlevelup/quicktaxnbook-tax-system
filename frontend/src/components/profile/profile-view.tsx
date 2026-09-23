'use client';

import { Icon } from '@/components/icons/app-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { ROLE_LABELS } from '@/features/auth/types';
import {
  changePasswordSchema,
  updateProfileSchema,
  type ChangePasswordInput,
  type UpdateProfileInput,
} from '@/features/profile/schemas/profile';
import {
  useChangePassword,
  useMyProfile,
  useUpdateProfile,
  useUploadAvatar,
} from '@/features/profile/hooks/use-profile';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';

const initialsFor = (name: string | null, email: string | null): string => {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'U';
  }
  return email?.slice(0, 2).toUpperCase() || 'U';
};

export function ProfileView() {
  const { data: profile, isPending } = useMyProfile();

  if (isPending || !profile) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <AvatarCard
        avatarUrl={profile.avatarUrl}
        displayName={profile.displayName}
        email={profile.email}
        role={profile.accountRole}
      />
      <PersonalInfoCard
        firstName={profile.firstName}
        lastName={profile.lastName}
        phone={profile.phone}
        email={profile.email}
      />
      {profile.canChangePassword ? (
        <PasswordCard />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Team members can&apos;t change their own password. Ask your firm
              admin to reset it for you.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}

function AvatarCard({
  avatarUrl,
  displayName,
  email,
  role,
}: {
  avatarUrl: string | null;
  displayName: string | null;
  email: string | null;
  role: keyof typeof ROLE_LABELS;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadAvatar = useUploadAvatar();

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) uploadAvatar.mutate(file);
    event.target.value = '';
  };

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
        <Avatar className="h-20 w-20 border-2 border-primary/20">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={displayName ?? 'Avatar'} />
          ) : null}
          <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
            {initialsFor(displayName, email)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1 text-center sm:text-left">
          <p className="text-lg font-semibold">{displayName || email}</p>
          <p className="text-sm text-muted-foreground">{email}</p>
          <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
            {ROLE_LABELS[role]}
          </span>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={onFileChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            loading={uploadAvatar.isPending}
            onClick={() => inputRef.current?.click()}
          >
            <Icon name="edit" className="h-4 w-4" /> Change photo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PersonalInfoCard({
  firstName,
  lastName,
  phone,
  email,
}: {
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email: string | null;
}) {
  const updateProfile = useUpdateProfile();

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: firstName ?? '',
      lastName: lastName ?? '',
      phone: phone ?? '',
    },
  });

  useEffect(() => {
    form.reset({
      firstName: firstName ?? '',
      lastName: lastName ?? '',
      phone: phone ?? '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstName, lastName, phone]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal information</CardTitle>
        <CardDescription>Your name and contact details.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit((values) => updateProfile.mutate(values))}
          noValidate
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" {...form.register('firstName')} />
              <InputError message={form.formState.errors.firstName?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" {...form.register('lastName')} />
              <InputError message={form.formState.errors.lastName?.message} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email ?? ''} disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" {...form.register('phone')} />
              <InputError message={form.formState.errors.phone?.message} />
            </div>
          </div>
          <div>
            <Button type="submit" loading={updateProfile.isPending}>
              Save changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function PasswordCard() {
  const changePassword = useChangePassword();

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    changePassword.mutate(
      {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      },
      { onSuccess: () => form.reset() },
    );
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>
          You&apos;ll stay signed in on this device.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
          <div className="grid gap-2">
            <Label htmlFor="currentPassword">Current password</Label>
            <PasswordInput
              id="currentPassword"
              autoComplete="current-password"
              {...form.register('currentPassword')}
            />
            <InputError
              message={form.formState.errors.currentPassword?.message}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="newPassword">New password</Label>
              <PasswordInput
                id="newPassword"
                autoComplete="new-password"
                {...form.register('newPassword')}
              />
              <InputError
                message={form.formState.errors.newPassword?.message}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <PasswordInput
                id="confirmPassword"
                autoComplete="new-password"
                {...form.register('confirmPassword')}
              />
              <InputError
                message={form.formState.errors.confirmPassword?.message}
              />
            </div>
          </div>
          <div>
            <Button type="submit" loading={changePassword.isPending}>
              Update password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
