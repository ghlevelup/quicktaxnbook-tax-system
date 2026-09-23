'use client';

import { Icon } from '@/components/icons/app-icons';
import { CopyReveal } from '@/components/shared/copy-reveal';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCreateOnboardingLink } from '@/features/clients/hooks/use-clients';
import { useState } from 'react';

export function OnboardingLinkAction({
  clientId,
  clientName,
}: {
  clientId: string;
  clientName: string;
}) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const createLink = useCreateOnboardingLink();

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setUrl(null);
      return;
    }
    createLink.mutate(
      { clientId },
      { onSuccess: ({ data }) => setUrl(data.onboardingUrl) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Button variant="outline" size="sm" onClick={() => onOpenChange(true)}>
        <Icon name="link" className="h-4 w-4" /> Onboarding link
      </Button>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Onboarding link for {clientName}</DialogTitle>
          <DialogDescription>
            Send this link to your client so they can set up their portal
            account. Valid for 7 days.
          </DialogDescription>
        </DialogHeader>
        {createLink.isPending && (
          <p className="text-sm text-muted-foreground">Generating…</p>
        )}
        {url ? <CopyReveal label="Onboarding link" value={url} /> : null}
      </DialogContent>
    </Dialog>
  );
}
