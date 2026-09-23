import { Badge } from '@/components/ui/badge';
import {
  CLIENT_STATUS_LABELS,
  type ClientStatus,
} from '@/features/clients/types';

const VARIANT: Record<
  ClientStatus,
  'success' | 'secondary' | 'warning' | 'destructive'
> = {
  PROSPECT: 'secondary',
  ONBOARDING: 'warning',
  ACTIVE: 'success',
  INACTIVE: 'secondary',
  ARCHIVED: 'destructive',
};

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  return (
    <Badge variant={VARIANT[status]}>{CLIENT_STATUS_LABELS[status]}</Badge>
  );
}
