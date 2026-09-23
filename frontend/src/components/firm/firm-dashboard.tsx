'use client';

import { Icon, type IconName } from '@/components/icons/app-icons';
import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useClients } from '@/features/clients/hooks/use-clients';
import { useMyProfile } from '@/features/profile/hooks/use-profile';
import { useTeamMembers } from '@/features/team/hooks/use-team';
import Link from 'next/link';

function StatCard({
  icon,
  label,
  value,
  href,
  loading,
}: {
  icon: IconName;
  label: string;
  value: number | string;
  href: string;
  loading?: boolean;
}) {
  return (
    <Link href={href}>
      <Card className="transition-colors hover:border-primary/40">
        <CardContent className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon name={icon} weight="fill" className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            {loading ? (
              <Skeleton className="mt-1 h-6 w-10" />
            ) : (
              <p className="text-2xl font-semibold text-foreground">{value}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function FirmDashboard({ firmSlug }: { firmSlug: string }) {
  const { data: profile } = useMyProfile();
  const isAdmin = profile?.accountRole === 'FIRM_ADMIN';

  const team = useTeamMembers({ enabled: isAdmin });
  const clients = useClients();

  return (
    <PageLayout>
      <PageHeader
        title={
          profile?.membership?.firm.name
            ? `Welcome to ${profile.membership.firm.name}`
            : 'Dashboard'
        }
        subtitle="Here's a quick look at your firm."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isAdmin && (
          <StatCard
            icon="users"
            label="Team members"
            value={team.data?.totalResults ?? 0}
            loading={team.isPending}
            href={`/firm/${firmSlug}/team`}
          />
        )}
        <StatCard
          icon="briefcase"
          label="Clients"
          value={clients.data?.totalResults ?? 0}
          loading={clients.isPending}
          href={`/firm/${firmSlug}/clients`}
        />
      </div>
    </PageLayout>
  );
}
