'use client';

import { Icon } from '@/components/icons/app-icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CLIENT_TYPE_LABELS, type ClientType } from '@/features/clients/types';
import { cn } from '@/libs/utils';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';

export interface SwitchableEntity {
  id: string;
  displayName: string;
  type: ClientType;
  active: boolean;
}

interface EntitySwitcherProps {
  currentClientId: string;
  entities: SwitchableEntity[];
}

/** Swaps the /client/<id>/... segment for another entity, keeping the rest
 * of the path (dashboard stays on dashboard, profile stays on profile). */
function pathForEntity(
  pathname: string,
  currentClientId: string,
  nextClientId: string,
): string {
  return pathname.replace(
    `/client/${currentClientId}`,
    `/client/${nextClientId}`,
  );
}

export function EntitySwitcher({
  currentClientId,
  entities,
}: EntitySwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  const current = entities.find((entity) => entity.id === currentClientId);

  if (entities.length <= 1) {
    return (
      <p className="truncate px-2 pt-1 text-xs font-medium text-muted-foreground group-data-[state=collapsed]:hidden">
        {current?.displayName}
      </p>
    );
  }

  const onSelect = (entity: SwitchableEntity) => {
    if (entity.id === currentClientId) return;
    if (!entity.active) {
      toast.error(`${entity.displayName} has been deactivated by your firm`);
      return;
    }
    router.push(pathForEntity(pathname, currentClientId, entity.id));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full min-w-0 items-center justify-between gap-1 rounded-md px-2 py-1 text-left text-xs font-medium text-muted-foreground transition-colors group-data-[state=collapsed]:hidden hover:bg-accent hover:text-foreground"
        >
          <span className="truncate">
            {current?.displayName ?? 'Select entity'}
          </span>
          <Icon name="down" className="h-3 w-3 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Switch entity
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {entities.map((entity) => (
          <DropdownMenuItem
            key={entity.id}
            onClick={() => onSelect(entity)}
            className={cn(
              'flex items-center justify-between gap-2',
              !entity.active && 'opacity-60',
            )}
          >
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-medium text-foreground">
                {entity.displayName}
              </span>
              <span className="text-xs text-muted-foreground">
                {CLIENT_TYPE_LABELS[entity.type]}
                {!entity.active ? ' · Deactivated' : ''}
              </span>
            </div>
            {entity.id === currentClientId ? (
              <Icon name="check" className="h-4 w-4 shrink-0 text-primary" />
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
