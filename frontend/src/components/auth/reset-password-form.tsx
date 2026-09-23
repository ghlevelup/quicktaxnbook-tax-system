'use client';

import TextLink from '@/components/shared/text-link';
import { Icon } from '@/components/icons/app-icons';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from '@/features/auth/schemas/password-reset';
import { authFetch } from '@/libs/api-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError(null);
    try {
      await authFetch('/reset-password', {
        method: 'POST',
        body: { token, password: values.password },
      });
      setDone(true);
      setTimeout(() => router.replace('/login'), 2000);
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : 'Something went wrong',
      );
    }
  });

  if (!token) {
    return (
      <div className="flex w-full items-center justify-center py-4">
        <Card
          flat
          className="w-full max-w-md border-0 bg-transparent pb-10 shadow-none"
        >
          <CardHeader className="px-4">
            <CardTitle className="text-2xl">Invalid link</CardTitle>
            <CardDescription>
              This password reset link is missing its token.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TextLink href="/forgot-password" className="text-sm text-primary">
              Request a new link
            </TextLink>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-center py-4">
      <Card
        flat
        className="w-full max-w-md border-0 bg-transparent pb-10 shadow-none"
      >
        <CardHeader className="px-4">
          <CardTitle className="text-2xl">Set a new password</CardTitle>
          <CardDescription>
            Choose a new password for your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {done ? (
            <div className="flex items-center gap-2 text-success">
              <Icon name="checkCircle" weight="fill" className="h-5 w-5" />
              <p className="text-sm font-medium">
                Password reset — redirecting to sign in…
              </p>
            </div>
          ) : (
            <form
              className="flex flex-col gap-4 sm:gap-6"
              onSubmit={onSubmit}
              noValidate
            >
              <div className="grid gap-2">
                <Label htmlFor="password">New password</Label>
                <PasswordInput
                  id="password"
                  autoComplete="new-password"
                  autoFocus
                  aria-invalid={!!form.formState.errors.password}
                  {...form.register('password')}
                />
                <InputError message={form.formState.errors.password?.message} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <PasswordInput
                  id="confirmPassword"
                  autoComplete="new-password"
                  aria-invalid={!!form.formState.errors.confirmPassword}
                  {...form.register('confirmPassword')}
                />
                <InputError
                  message={form.formState.errors.confirmPassword?.message}
                />
              </div>

              {serverError && (
                <p className="text-sm text-destructive" role="alert">
                  {serverError}
                </p>
              )}

              <Button type="submit" loading={form.formState.isSubmitting}>
                Reset password
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
