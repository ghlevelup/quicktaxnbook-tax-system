'use client';

import { Icon } from '@/components/icons/app-icons';
import { Button } from '@/components/ui/button';
import { useSyncTeamFromGhl } from '@/features/team/hooks/use-team';

/**
 * Mirrors the staff of the firm's GoHighLevel sub-account into the team list.
 * Idempotent: matched by email, so existing members are never duplicated.
 */
export function SyncTeamButton() {
  const sync = useSyncTeamFromGhl();

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
