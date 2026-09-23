'use client';

import { Icon } from '@/components/icons/app-icons';
import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CLIENT_TYPE_LABELS } from '@/features/clients/types';
import { useMyProfile } from '@/features/profile/hooks/use-profile';

export function ClientDashboard({ clientId }: { clientId: string }) {
  const { data: profile, isPending } = useMyProfile();
  const access = profile?.clients?.find((c) => c.client.id === clientId);

  if (isPending) {
    return (
      <PageLayout>
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title={`Welcome, ${profile?.firstName ?? ''}`}
        subtitle="Your client portal. More will show up here as your firm gets started on your return."
      />

      <Card>
        <CardContent className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon name="briefcase" weight="fill" className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {access
                ? CLIENT_TYPE_LABELS[
                    access.client.type as keyof typeof CLIENT_TYPE_LABELS
                  ]
                : 'Entity'}
            </p>
            <p className="text-lg font-semibold text-foreground">
              {access?.client.displayName ?? 'Your account'}
            </p>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
