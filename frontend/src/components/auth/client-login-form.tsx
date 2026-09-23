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
import { roleHomePath } from '@/features/auth/lib/role-home';
import {
  clientLoginEmailSchema,
  clientLoginOtpSchema,
  clientLoginPasswordSchema,
  type ClientLoginEmailInput,
  type ClientLoginOtpInput,
  type ClientLoginPasswordInput,
} from '@/features/auth/schemas/client-login';
import type { CurrentUser } from '@/features/auth/types';
import { authFetch } from '@/libs/api-client';
import { cn } from '@/libs/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

type Step = 'email' | 'password' | 'otp';

const STEPS: { key: Step; label: string }[] = [
  { key: 'email', label: 'Email' },
  { key: 'password', label: 'Password' },
  { key: 'otp', label: 'Verify' },
];

function StepIndicator({ current }: { current: Step }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);
  return (
    <div className="mb-2 flex items-center gap-2">
      {STEPS.map((step, index) => (
        <div key={step.key} className="flex flex-1 items-center gap-2">
          <div
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              index <= currentIndex ? 'bg-primary' : 'bg-muted',
            )}
          />
        </div>
      ))}
    </div>
  );
}

const ClientLoginForm = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [loginToken, setLoginToken] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);

  const emailForm = useForm<ClientLoginEmailInput>({
    resolver: zodResolver(clientLoginEmailSchema),
    defaultValues: { email: '' },
  });
  const passwordForm = useForm<ClientLoginPasswordInput>({
    resolver: zodResolver(clientLoginPasswordSchema),
    defaultValues: { password: '' },
  });
  const otpForm = useForm<ClientLoginOtpInput>({
    resolver: zodResolver(clientLoginOtpSchema),
    defaultValues: { otp: '' },
  });

  const submitEmail = emailForm.handleSubmit(async (values) => {
    setServerError(null);
    try {
      await authFetch('/client/login/start', { method: 'POST', body: values });
      setEmail(values.email);
      setStep('password');
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : 'Something went wrong',
      );
    }
  });

  const submitPassword = passwordForm.handleSubmit(async (values) => {
    setServerError(null);
    try {
      const { data } = await authFetch<{
        loginToken: string;
        expiresInMinutes: number;
      }>('/client/login/password', {
        method: 'POST',
        body: { email, password: values.password },
      });
      setLoginToken(data.loginToken);
      setStep('otp');
      toast.success(`We sent a 6-digit code to ${email}`);
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : 'Incorrect password',
      );
      passwordForm.setValue('password', '');
    }
  });

  const submitOtp = otpForm.handleSubmit(async (values) => {
    setServerError(null);
    try {
      const { data } = await authFetch<{ user: CurrentUser }>(
        '/client/login/verify-otp',
        {
          method: 'POST',
          body: { loginToken, otp: values.otp },
        },
      );
      queryClient.setQueryData(['auth', 'me'], data.user);
      router.replace(roleHomePath(data.user));
      router.refresh();
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : 'Invalid or expired code',
      );
      otpForm.setValue('otp', '');
    }
  });

  const resetToEmail = () => {
    setServerError(null);
    passwordForm.reset({ password: '' });
    otpForm.reset({ otp: '' });
    setStep('email');
  };

  return (
    <div className="flex w-full items-center justify-center py-4">
      <Card
        flat
        className="w-full max-w-md border-0 bg-transparent pb-10 shadow-none"
      >
        <CardHeader className="px-4">
          <StepIndicator current={step} />
          <CardTitle className="text-2xl">Client portal sign in</CardTitle>
          <CardDescription>
            {step === 'email' && 'Enter your email to get started.'}
            {step === 'password' && `Enter the password for ${email}.`}
            {step === 'otp' && `Enter the 6-digit code we emailed to ${email}.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'email' && (
            <form
              className="flex flex-col gap-6"
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
              {serverError && (
                <p className="text-sm text-destructive" role="alert">
                  {serverError}
                </p>
              )}
              <Button type="submit" loading={emailForm.formState.isSubmitting}>
                Continue
              </Button>
            </form>
          )}

          {step === 'password' && (
            <form
              className="flex flex-col gap-6"
              onSubmit={submitPassword}
              noValidate
            >
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                  id="password"
                  autoComplete="current-password"
                  autoFocus
                  placeholder="Enter your password"
                  aria-invalid={!!passwordForm.formState.errors.password}
                  {...passwordForm.register('password')}
                />
                <InputError
                  message={passwordForm.formState.errors.password?.message}
                />
              </div>
              {serverError && (
                <p className="text-sm text-destructive" role="alert">
                  {serverError}
                </p>
              )}
              <Button
                type="submit"
                loading={passwordForm.formState.isSubmitting}
              >
                Send verification code
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetToEmail}
              >
                <Icon name="left" className="h-4 w-4" /> Use a different email
              </Button>
            </form>
          )}

          {step === 'otp' && (
            <Form {...otpForm}>
              <form
                className="flex flex-col gap-6"
                onSubmit={submitOtp}
                noValidate
              >
                <FormField
                  control={otpForm.control}
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
                {serverError && (
                  <p
                    className="text-center text-sm text-destructive"
                    role="alert"
                  >
                    {serverError}
                  </p>
                )}
                <Button type="submit" loading={otpForm.formState.isSubmitting}>
                  Verify &amp; sign in
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetToEmail}
                >
                  <Icon name="left" className="h-4 w-4" /> Start over
                </Button>
              </form>
            </Form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Firm staff?{' '}
            <TextLink href="/login" className="text-primary">
              Sign in here
            </TextLink>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientLoginForm;
