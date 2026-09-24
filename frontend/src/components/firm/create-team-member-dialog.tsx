'use client';

import { Icon } from '@/components/icons/app-icons';
import { CopyReveal } from '@/components/shared/copy-reveal';
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
  createTeamMemberSchema,
  type CreateTeamMemberInput,
} from '@/features/team/schemas/team';
import { useCreateTeamMember } from '@/features/team/hooks/use-team';
import { STAFF_TYPE_LABELS } from '@/features/team/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

export function CreateTeamMemberDialog() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const createTeamMember = useCreateTeamMember();

  const form = useForm<CreateTeamMemberInput>({
    resolver: zodResolver(createTeamMemberSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      staffType: 'PREPARER',
      title: '',
    },
  });

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setResult(null);
      form.reset();
    }
  };

  const onSubmit = form.handleSubmit((values) => {
    createTeamMember.mutate(values, {
      onSuccess: ({ data }) => {
        setResult({ email: values.email, password: data.temporaryPassword });
      },
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Button onClick={() => setOpen(true)}>
        <Icon name="userPlus" className="h-4 w-4" /> Add team member
      </Button>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {result ? 'Team member created' : 'Add team member'}
          </DialogTitle>
          <DialogDescription>
            {result
              ? `${result.email} can now sign in.`
              : "They'll get a generated password you can copy after creating."}
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="flex flex-col gap-4">
            <CopyReveal
              label="Temporary password"
              value={result.password}
              description="Share this with them however you prefer."
            />
            <DialogFooter className="mt-2">
              <Button onClick={() => onOpenChange(false)}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  autoFocus
                  {...form.register('firstName')}
                />
                <InputError
                  message={form.formState.errors.firstName?.message}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" {...form.register('lastName')} />
                <InputError message={form.formState.errors.lastName?.message} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register('email')} />
              <InputError message={form.formState.errors.email?.message} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              <div className="grid gap-2">
                <Label>Role</Label>
                <Controller
                  control={form.control}
                  name="staffType"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STAFF_TYPE_LABELS)
                          .filter(([value]) =>
                            ['PREPARER', 'REVIEWER', 'SUPPORT'].includes(value),
                          )
                          .map(
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
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g. Senior Preparer"
                {...form.register('title')}
              />
            </div>

            <DialogFooter className="mt-2">
              <Button type="submit" loading={createTeamMember.isPending}>
                Create team member
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
