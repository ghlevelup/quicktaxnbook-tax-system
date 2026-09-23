'use client';

import TextLink from '@/components/shared/text-link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { roleHomePath } from '@/features/auth/lib/role-home';
import { loginSchema, type LoginInput } from '@/features/auth/schemas/login';
import type { CurrentUser } from '@/features/auth/types';
import { authFetch } from '@/libs/api-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

const LoginForm = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError(null);
    try {
      const { data } = await authFetch<{ user: CurrentUser }>('/login', {
        method: 'POST',
        body: values,
      });
      queryClient.setQueryData(['auth', 'me'], data.user);
      router.replace(roleHomePath(data.user));
      router.refresh();
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : 'Invalid credentials',
      );
      form.setValue('password', '');
    }
  });

  const emailError = form.formState.errors.email?.message;
  const passwordError = form.formState.errors.password?.message;

  return (
    <div className="flex w-full items-center justify-center py-4">
      <Card
        flat
        className="w-full max-w-md border-0 bg-transparent pb-10 shadow-none"
      >
        <CardHeader className="px-4">
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <CardDescription>
            Platform Owner, Firm Admin, or Team login.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-4 sm:gap-6"
            onSubmit={onSubmit}
            noValidate
          >
            <div className="grid gap-4 sm:gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  tabIndex={1}
                  placeholder="you@example.com"
                  aria-invalid={!!emailError}
                  {...form.register('email')}
                />
                <InputError message={emailError} />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <TextLink
                    href="/forgot-password"
                    className="text-xs text-primary"
                    tabIndex={4}
                  >
                    Forgot password?
                  </TextLink>
                </div>
                <PasswordInput
                  id="password"
                  autoComplete="current-password"
                  tabIndex={2}
                  placeholder="Enter your password"
                  aria-invalid={!!passwordError}
                  {...form.register('password')}
                />
                <InputError message={passwordError} />
              </div>

              {serverError && (
                <p className="text-sm text-destructive" role="alert">
                  {serverError}
                </p>
              )}

              <Button
                type="submit"
                tabIndex={3}
                loading={form.formState.isSubmitting}
              >
                Sign in
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Taxpayer client?{' '}
            <TextLink href="/client-login" className="text-primary">
              Sign in to your portal
            </TextLink>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
