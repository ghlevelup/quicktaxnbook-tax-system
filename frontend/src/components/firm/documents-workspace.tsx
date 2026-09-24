'use client';

import { useState } from 'react';

import { ClientDocumentsPanel } from '@/components/firm/client-documents-panel';
import { OpportunityBoard } from '@/components/firm/opportunity-board';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useClients } from '@/features/clients/hooks/use-clients';
import { cn } from '@/libs/utils';

type Tab = 'requests' | 'pipeline';

/**
 * Staff documents workspace.
 *
 * Two views over the same work: the per-client checklist (request a document,
 * accept or reject what came back) and the drag-and-drop pipeline board that
 * mirrors GoHighLevel.
 */
export function DocumentsWorkspace() {
  const [tab, setTab] = useState<Tab>('requests');
  const { data, isPending } = useClients();
  const clients = data?.results ?? [];
  const [clientId, setClientId] = useState<string | undefined>();

  const selected = clientId ?? clients[0]?.id;

  return (
    <PageLayout>
      <PageHeader
        title="Documents"
        subtitle="Request documents from clients and track them through to completion."
      />

      <div className="mb-4 flex gap-1 border-b border-border">
        {(
          [
            ['requests', 'Client requests'],
            ['pipeline', 'Pipeline board'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              'relative px-3 py-2 text-sm font-medium transition-colors',
              tab === key
                ? 'text-foreground after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'pipeline' ? (
        // The board brings its own header/layout, so it is rendered standalone.
        <OpportunityBoard embedded />
      ) : isPending ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : clients.length === 0 ? (
        <Card flat className="overflow-hidden py-0">
          <EmptyState
            icon="users"
            title="No clients yet"
            description="Add a client before requesting documents."
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Client</span>
            <Select value={selected} onValueChange={setClientId}>
              <SelectTrigger className="w-72">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selected && <ClientDocumentsPanel clientId={selected} />}
        </div>
      )}
    </PageLayout>
  );
}
