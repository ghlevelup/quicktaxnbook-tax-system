import { Badge } from '@/components/ui/badge';
import { FIRM_STATUS_LABELS, type FirmStatus } from '@/features/platform/types';

const VARIANT: Record<
  FirmStatus,
  'success' | 'secondary' | 'warning' | 'destructive'
> = {
  TRIAL: 'secondary',
  ACTIVE: 'success',
  PAST_DUE: 'warning',
  SUSPENDED: 'destructive',
  CANCELLED: 'destructive',
};

export function FirmStatusBadge({ status }: { status: FirmStatus }) {
  return <Badge variant={VARIANT[status]}>{FIRM_STATUS_LABELS[status]}</Badge>;
}
