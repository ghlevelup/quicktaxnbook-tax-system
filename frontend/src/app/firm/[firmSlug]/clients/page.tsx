'use client';

import { ClientStatusAction } from '@/components/firm/client-status-action';
import { ClientStatusBadge } from '@/components/firm/client-status-badge';
import { CreateClientDialog } from '@/components/firm/create-client-dialog';
import { OnboardingLinkAction } from '@/components/firm/onboarding-link-action';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useClients } from '@/features/clients/hooks/use-clients';
import { CLIENT_TYPE_LABELS } from '@/features/clients/types';

export default function ClientsPage() {
  const { data, isPending } = useClients();
  const clients = data?.results ?? [];

  return (
    <PageLayout>
      <PageHeader
        title="Clients"
        subtitle="Taxpayers your firm works with."
        actions={<CreateClientDialog />}
      />

      <Card flat className="overflow-hidden py-0">
        {isPending ? (
          <div className="space-y-3 p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : clients.length === 0 ? (
          <EmptyState
            icon="briefcase"
            title="No clients yet"
            description="Add your first client, then send them an onboarding link."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium text-foreground">
                    {client.displayName}
                  </TableCell>
                  <TableCell>{CLIENT_TYPE_LABELS[client.type]}</TableCell>
                  <TableCell className="text-muted-foreground">
                    <div>{client.email || 'N/A'}</div>
                    {client.phone ? (
                      <div className="text-xs">{client.phone}</div>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <ClientStatusBadge status={client.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {client.status === 'ONBOARDING' ? (
                      <OnboardingLinkAction
                        clientId={client.id}
                        clientName={client.displayName}
                      />
                    ) : null}
                    {client.status === 'ACTIVE' ||
                    client.status === 'INACTIVE' ? (
                      <ClientStatusAction client={client} />
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </PageLayout>
  );
}
