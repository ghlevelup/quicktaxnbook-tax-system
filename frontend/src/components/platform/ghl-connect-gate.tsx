'use client';

import { Icon } from '@/components/icons/app-icons';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import {
  useConnectGhlAgency,
  useGhlAgencyState,
} from '@/features/platform/hooks/use-ghl-agency';
import {
  connectAgencySchema,
  type ConnectAgencyInput,
} from '@/features/platform/schemas/connect-agency';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

/**
 * Shown over the platform area (after the owner has signed in) while the
 * GoHighLevel agency is not connected. It cannot be dismissed: the platform is
 * scoped to the agency, so there is nothing to do until it is connected. Once
 * the token and relationship number are stored, it never appears again.
 */
export function GhlConnectGate() {
  const { data, isPending } = useGhlAgencyState();

  const form = useForm<ConnectAgencyInput>({
    resolver: zodResolver(connectAgencySchema),
    defaultValues: { privateToken: '', relationshipNumber: '' },
  });
  const connect = useConnectGhlAgency(form);
  const errors = form.formState.errors;

  const onSubmit = form.handleSubmit((values) => {
    connect.mutate(values, { onSuccess: () => form.reset() });
  });

  const previous = data?.previous ?? null;

  // The agency was connected before and only its token stopped working, so the
  // relationship number is already known: prefill it.
  useEffect(() => {
    if (previous?.relationshipNumber && !form.getValues('relationshipNumber')) {
      form.setValue('relationshipNumber', previous.relationshipNumber);
    }
  }, [previous, form]);

  const open = !isPending && data !== undefined && data.connection === null;

  return (
    <Dialog open={open}>
      <DialogContent
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <form onSubmit={onSubmit} noValidate className="grid gap-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="shieldCheck" className="h-4 w-4" />
              Connect GoHighLevel
            </DialogTitle>
            <DialogDescription>
              {previous
                ? `The saved token for ${previous.companyName ?? 'this agency'} was rejected by GoHighLevel. Paste a new agency Private Integration Token; the relationship number is filled in.`
                : 'Enter your agency relationship number and Private Integration Token. They are verified with GoHighLevel before anything is saved.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label htmlFor="ghl-gate-token">
              Agency Private Integration Token *
            </Label>
            <Input
              id="ghl-gate-token"
              type="password"
              autoComplete="off"
              spellCheck={false}
              placeholder="Paste the token"
              {...form.register('privateToken')}
            />
            <InputError message={errors.privateToken?.message} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ghl-gate-relationship">Relationship number *</Label>
            <Input
              id="ghl-gate-relationship"
              autoComplete="off"
              placeholder="0-933-305"
              {...form.register('relationshipNumber')}
            />
            <InputError message={errors.relationshipNumber?.message} />
          </div>

          <Button type="submit" loading={connect.isPending}>
            <Icon name="link" className="h-4 w-4" /> Verify and connect
          </Button>

          <p className="text-xs text-muted-foreground">
            Create the token in GoHighLevel under Settings → Private
            Integrations. It needs permission to read locations.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
