'use client';

import { Icon } from '@/components/icons/app-icons';
import { Button } from '@/components/ui/button';
import { useSyncClientsFromGhl } from '@/features/clients/hooks/use-clients';

/**
 * Mirrors the firm's GoHighLevel contacts tagged "new-client" into the client list.
 *
 * Idempotent: contacts are matched by email/phone, so running it again updates
 * nothing that already exists rather than creating duplicates. Requires the firm
 * to be connected to a GoHighLevel sub-account.
 */
export function SyncClientsButton() {
  const sync = useSyncClientsFromGhl();

  return (
    <Button
      variant="outline"
      loading={sync.isPending}
      onClick={() => sync.mutate()}
    >
      <Icon name="link" className="h-4 w-4" /> Refresh
    </Button>
  );
}
