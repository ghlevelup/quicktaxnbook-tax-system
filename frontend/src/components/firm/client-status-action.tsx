'use client';

import { Icon } from '@/components/icons/app-icons';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSetClientStatus } from '@/features/clients/hooks/use-clients';
import type { ClientRecord } from '@/features/clients/types';
import { useState } from 'react';

export function ClientStatusAction({ client }: { client: ClientRecord }) {
  const [open, setOpen] = useState(false);
  const setStatus = useSetClientStatus();

  const isActive = client.status === 'ACTIVE';
  const nextStatus = isActive ? 'INACTIVE' : 'ACTIVE';

  const confirm = () => {
    setStatus.mutate(
      { clientId: client.id, status: nextStatus },
      { onSuccess: () => setOpen(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Icon name="ban" className="h-4 w-4" />
        {isActive ? 'Deactivate' : 'Activate'}
      </Button>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isActive ? 'Deactivate this client?' : 'Activate this client?'}
          </DialogTitle>
          <DialogDescription>
            {isActive
              ? `${client.displayName} will no longer be able to log in to the client portal.`
              : `${client.displayName} will be able to log in to the client portal again.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-2 flex-row justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant={isActive ? 'destructive' : 'default'}
            size="sm"
            loading={setStatus.isPending}
            onClick={confirm}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
