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
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from '@/features/auth/schemas/password-reset';
import { authFetch } from '@/libs/api-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const emailError = form.formState.errors.email?.message;

  const onSubmit = form.handleSubmit(async (values) => {
    await authFetch('/forgot-password', { method: 'POST', body: values });
    setSubmitted(true);
  });

  return (
    <div className="flex w-full items-center justify-center py-4">
      <Card
        flat
        className="w-full max-w-md border-0 bg-transparent pb-10 shadow-none"
      >
        <CardHeader className="px-4">
          <CardTitle className="text-2xl">Forgot password</CardTitle>
          <CardDescription>
            Available for Platform Owner and Firm Admin accounts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="flex flex-col items-start gap-3">
              <div className="flex items-center gap-2 text-success">
                <Icon name="checkCircle" weight="fill" className="h-5 w-5" />
                <p className="text-sm font-medium">Check your email</p>
              </div>
              <p className="text-sm text-muted-foreground">
                If an account exists for that email, we&apos;ve sent a link to
                reset your password.
              </p>
            </div>
          ) : (
            <form
              className="flex flex-col gap-4 sm:gap-6"
              onSubmit={onSubmit}
              noValidate
            >
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="you@example.com"
                  aria-invalid={!!emailError}
                  {...form.register('email')}
                />
                <InputError message={emailError} />
              </div>

              <Button type="submit" loading={form.formState.isSubmitting}>
                Send reset link
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <TextLink href="/login" className="text-primary">
              Back to sign in
            </TextLink>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
