'use client';

import { Icon } from '@/components/icons/app-icons';
import { FirmStatusBadge } from '@/components/platform/firm-status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
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
import { useFirms } from '@/features/platform/hooks/use-platform';
import Link from 'next/link';

export default function FirmsPage() {
  const { data, isPending } = useFirms();
  const firms = data?.results ?? [];

  return (
    <PageLayout>
      <PageHeader
        title="Firms"
        subtitle="Tax agencies onboarded onto the platform."
        actions={
          <Button asChild>
            <Link href="/platform/firms/new">
              <Icon name="plus" className="h-4 w-4" /> Onboard firm
            </Link>
          </Button>
        }
      />

      <Card flat className="overflow-hidden py-0">
        {isPending ? (
          <div className="space-y-3 p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : firms.length === 0 ? (
          <EmptyState
            icon="buildings"
            title="No firms yet"
            description="Onboard your first tax agency to get started."
            action={
              <Button asChild size="sm">
                <Link href="/platform/firms/new">
                  <Icon name="plus" className="h-4 w-4" /> Onboard firm
                </Link>
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Firm</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Clients</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {firms.map((firm) => (
                <TableRow key={firm.id} className="cursor-pointer">
                  <TableCell>
                    <Link
                      href={`/platform/firms/${firm.id}`}
                      className="hover:underline"
                    >
                      <div className="font-medium text-foreground">
                        {firm.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        /{firm.slug}
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {firm.email || 'N/A'}
                  </TableCell>
                  <TableCell>{firm._count?.members ?? 'N/A'}</TableCell>
                  <TableCell>{firm._count?.clients ?? 'N/A'}</TableCell>
                  <TableCell>
                    <FirmStatusBadge status={firm.status} />
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {new Date(firm.createdAt).toLocaleDateString()}
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
