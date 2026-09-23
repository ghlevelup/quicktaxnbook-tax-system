'use client';

import { Icon } from '@/components/icons/app-icons';
import { FirmStatusBadge } from '@/components/platform/firm-status-badge';
import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useFirm,
  useUpdateFirmStatus,
} from '@/features/platform/hooks/use-platform';
import type { FirmStatus } from '@/features/platform/types';
import { useState } from 'react';

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-2.5 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value || '—'}</span>
    </div>
  );
}

export function FirmDetail({ firmId }: { firmId: string }) {
  const { data: firm, isPending } = useFirm(firmId);
  const updateStatus = useUpdateFirmStatus(firmId);
  const [pendingStatus, setPendingStatus] = useState<FirmStatus | null>(null);

  if (isPending || !firm) {
    return (
      <PageLayout>
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </PageLayout>
    );
  }

  const allStatusActions: {
    label: string;
    status: FirmStatus;
    variant: 'default' | 'outline' | 'destructive';
  }[] = [
    { label: 'Activate', status: 'ACTIVE', variant: 'default' },
    { label: 'Suspend', status: 'SUSPENDED', variant: 'outline' },
    { label: 'Cancel', status: 'CANCELLED', variant: 'destructive' },
  ];
  const statusActions = allStatusActions.filter(
    (action) => action.status !== firm.status,
  );

  const confirmChange = () => {
    if (!pendingStatus) return;
    updateStatus.mutate(
      { status: pendingStatus },
      { onSuccess: () => setPendingStatus(null) },
    );
  };

  return (
    <PageLayout>
      <PageHeader
        title={firm.name}
        subtitle={firm.legalName ?? undefined}
        actions={<FirmStatusBadge status={firm.status} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Business details</CardTitle>
          </CardHeader>
          <CardContent>
            <DetailRow label="Slug" value={`/${firm.slug}`} />
            <DetailRow
              label="EIN"
              value={firm.einLast4 ? `••• ${firm.einLast4}` : null}
            />
            <DetailRow
              label="Owner SSN"
              value={firm.ownerSsnLast4 ? `••• ${firm.ownerSsnLast4}` : null}
            />
            <DetailRow
              label="License"
              value={
                [firm.licenseType, firm.licenseNumber]
                  .filter(Boolean)
                  .join(' · ') || null
              }
            />
            <DetailRow label="Website" value={firm.website} />
            <DetailRow label="Domain" value={firm.domain} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact & location</CardTitle>
          </CardHeader>
          <CardContent>
            <DetailRow label="Email" value={firm.email} />
            <DetailRow label="Phone" value={firm.phone} />
            <DetailRow
              label="Address"
              value={
                [firm.addressLine1, firm.city, firm.state, firm.postalCode]
                  .filter(Boolean)
                  .join(', ') || null
              }
            />
            <DetailRow
              label="Team members"
              value={String(firm._count?.members ?? 0)}
            />
            <DetailRow
              label="Clients"
              value={String(firm._count?.clients ?? 0)}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Firm status</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {statusActions.map((action) => (
            <Button
              key={action.status}
              variant={action.variant}
              size="sm"
              onClick={() => setPendingStatus(action.status)}
            >
              {action.label}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Dialog
        open={!!pendingStatus}
        onOpenChange={(open) => !open && setPendingStatus(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon
                name="warning"
                weight="fill"
                className="h-5 w-5 text-warning"
              />
              Confirm status change
            </DialogTitle>
            <DialogDescription>
              Set {firm.name} to {pendingStatus?.toLowerCase()}?
              {pendingStatus === 'SUSPENDED' || pendingStatus === 'CANCELLED'
                ? ' This immediately signs out everyone at this firm.'
                : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2 flex-row justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button
              size="sm"
              loading={updateStatus.isPending}
              onClick={confirmChange}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
