'use client';

import { Icon } from '@/components/icons/app-icons';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  createClientSchema,
  type CreateClientInput,
} from '@/features/clients/schemas/client';
import { useCreateClient } from '@/features/clients/hooks/use-clients';
import { CLIENT_TYPE_LABELS } from '@/features/clients/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

export function CreateClientDialog() {
  const [open, setOpen] = useState(false);
  const createClient = useCreateClient();

  const form = useForm<CreateClientInput>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      displayName: '',
      type: 'INDIVIDUAL',
      email: '',
      phone: '',
    },
  });

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) form.reset();
  };

  const onSubmit = form.handleSubmit((values) => {
    createClient.mutate(values, { onSuccess: () => onOpenChange(false) });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Button onClick={() => setOpen(true)}>
        <Icon name="plus" className="h-4 w-4" /> Add client
      </Button>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add client</DialogTitle>
          <DialogDescription>
            Create the client, then generate an onboarding link for them to
            finish setup.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
          <div className="grid gap-2">
            <Label htmlFor="displayName">Name</Label>
            <Input
              id="displayName"
              autoFocus
              {...form.register('displayName')}
            />
            <InputError message={form.formState.errors.displayName?.message} />
          </div>
          <div className="grid gap-2">
            <Label>Type</Label>
            <Controller
              control={form.control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CLIENT_TYPE_LABELS).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="email">
                Email{form.watch('type') === 'INDIVIDUAL' ? ' *' : ''}
              </Label>
              <Input id="email" type="email" {...form.register('email')} />
              <InputError message={form.formState.errors.email?.message} />
              {form.watch('type') === 'INDIVIDUAL' ? (
                <p className="text-xs text-muted-foreground">
                  Used to prefill their onboarding, so they won&apos;t need to
                  re-enter it.
                </p>
              ) : null}
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
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button type="submit" loading={createClient.isPending}>
              Create client
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
