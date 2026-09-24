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
import {
  connectAgencySchema,
  type ConnectAgencyInput,
} from '@/features/platform/schemas/connect-agency';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { platformEntryFetch } from '@/libs/api-client';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

/**
 * The `/platform` entry for the agency admin. The GoHighLevel agency token plus the
 * relationship number are the credential: a valid token can only be created by an agency
 * admin inside GoHighLevel. Verified live before anything is saved.
 */
export function AgencyEntryForm({
  relationshipNumber,
  error,
}: {
  relationshipNumber?: string;
  error?: string;
}) {
  const router = useRouter();

  const form = useForm<ConnectAgencyInput>({
    resolver: zodResolver(connectAgencySchema),
    defaultValues: {
      privateToken: '',
      relationshipNumber: relationshipNumber ?? '',
    },
  });
  const errors = form.formState.errors;

  const enter = useApiMutation<
    { outcome: string },
    ConnectAgencyInput,
    ConnectAgencyInput
  >({
    mutationFn: (values) =>
      platformEntryFetch('/enter', {
        method: 'POST',
        body: {
          relationshipNumber: values.relationshipNumber.trim(),
          privateToken: values.privateToken,
        },
      }),
    form,
    successMessage: false,
  });

  const onSubmit = form.handleSubmit((values) => {
    enter.mutate(values, {
      onSuccess: () => {
        router.replace('/platform/firms');
        router.refresh();
      },
    });
  });

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/70 px-4 py-10">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="shieldCheck" className="h-4 w-4" />
            Connect GoHighLevel
          </CardTitle>
          <CardDescription>
            Enter your agency relationship number and Private Integration Token to open
            the platform. They are verified with GoHighLevel before anything is
            saved.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error ? (
            <p className="mb-4 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <form className="grid gap-4" onSubmit={onSubmit} noValidate>
            <div className="grid gap-2">
              <Label htmlFor="agency-relationship">Relationship number *</Label>
              <Input
                id="agency-relationship"
                autoComplete="off"
                placeholder="0-933-305"
                {...form.register('relationshipNumber')}
              />
              <InputError message={errors.relationshipNumber?.message} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="agency-token">
                Agency Private Integration Token *
              </Label>
              <Input
                id="agency-token"
                type="password"
                autoComplete="off"
                spellCheck={false}
                placeholder="Paste the token"
                {...form.register('privateToken')}
              />
              <InputError message={errors.privateToken?.message} />
            </div>

            <Button type="submit" loading={enter.isPending}>
              <Icon name="link" className="h-4 w-4" /> Verify and open platform
            </Button>

            <p className="text-xs text-muted-foreground">
              Create the token in GoHighLevel under Settings → Private
              Integrations. It needs permission to read locations.{' '}
              <Link href="/login" className="text-primary">
                Sign in with a password instead
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
