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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from '@/features/auth/schemas/password-reset';
import { authFetch } from '@/libs/api-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

type Step = 'email' | 'reset' | 'done';

export default function ForgotPasswordForm() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);

  const emailForm = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const resetForm = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { otp: '', password: '', confirmPassword: '' },
  });

  const submitEmail = emailForm.handleSubmit(async (values) => {
    setServerError(null);
    const { data } = await authFetch<{
      resetToken: string;
      expiresInMinutes: number;
    }>('/forgot-password', { method: 'POST', body: values });
    setEmail(values.email);
    setResetToken(data.resetToken);
    setStep('reset');
  });

  const submitReset = resetForm.handleSubmit(async (values) => {
    setServerError(null);
    try {
      await authFetch('/reset-password', {
        method: 'POST',
        body: { resetToken, otp: values.otp, password: values.password },
      });
      setStep('done');
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : 'Something went wrong',
      );
      resetForm.setValue('otp', '');
    }
  });

  return (
    <div className="flex w-full items-center justify-center py-4">
      <Card
        flat
        className="w-full max-w-md border-0 bg-transparent pb-10 shadow-none"
      >
        <CardHeader className="px-4">
          <CardTitle className="text-2xl">
            {step === 'done' ? 'Password reset' : 'Forgot password'}
          </CardTitle>
          <CardDescription>
            {step === 'email' &&
              'Available for Platform Owner, Firm Admin, and Client accounts.'}
            {step === 'reset' &&
              `Enter the 6-digit code we emailed to ${email}.`}
            {step === 'done' && 'You can now sign in with your new password.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'email' && (
            <form
              className="flex flex-col gap-4 sm:gap-6"
              onSubmit={submitEmail}
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
                  aria-invalid={!!emailForm.formState.errors.email}
                  {...emailForm.register('email')}
                />
                <InputError
                  message={emailForm.formState.errors.email?.message}
                />
              </div>
              <Button type="submit" loading={emailForm.formState.isSubmitting}>
                Send reset code
              </Button>
            </form>
          )}

          {step === 'reset' && (
            <Form {...resetForm}>
              <form
                className="flex flex-col gap-4 sm:gap-6"
                onSubmit={submitReset}
                noValidate
              >
                <FormField
                  control={resetForm.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem className="items-center">
                      <FormControl>
                        <InputOTP
                          maxLength={6}
                          value={field.value}
                          onChange={field.onChange}
                          autoFocus
                        >
                          <InputOTPGroup>
                            {[0, 1, 2, 3, 4, 5].map((i) => (
                              <InputOTPSlot
                                key={i}
                                index={i}
                                className="h-11 w-11 text-base"
                              />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-2">
                  <Label htmlFor="password">New password</Label>
                  <PasswordInput
                    id="password"
                    autoComplete="new-password"
                    {...resetForm.register('password')}
                  />
                  <InputError
                    message={resetForm.formState.errors.password?.message}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm new password</Label>
                  <PasswordInput
                    id="confirmPassword"
                    autoComplete="new-password"
                    {...resetForm.register('confirmPassword')}
                  />
                  <InputError
                    message={
                      resetForm.formState.errors.confirmPassword?.message
                    }
                  />
                </div>

                {serverError && (
                  <p className="text-sm text-destructive" role="alert">
                    {serverError}
                  </p>
                )}

                <Button
                  type="submit"
                  loading={resetForm.formState.isSubmitting}
                >
                  Reset password
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep('email')}
                >
                  <Icon name="left" className="h-4 w-4" /> Use a different email
                </Button>
              </form>
            </Form>
          )}

          {step === 'done' && (
            <div className="flex flex-col items-start gap-3">
              <div className="flex items-center gap-2 text-success">
                <Icon name="checkCircle" weight="fill" className="h-5 w-5" />
                <p className="text-sm font-medium">
                  Your password has been reset.
                </p>
              </div>
              <div className="flex gap-3 text-sm">
                <TextLink href="/login" className="text-primary">
                  Sign in as staff
                </TextLink>
                <TextLink href="/client-login" className="text-primary">
                  Sign in to client portal
                </TextLink>
              </div>
            </div>
          )}

          {step !== 'done' && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              <TextLink href="/login" className="text-primary">
                Back to sign in
              </TextLink>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
