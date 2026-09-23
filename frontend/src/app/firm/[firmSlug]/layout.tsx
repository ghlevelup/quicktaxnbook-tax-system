import type { AppNavGroup } from '@/components/layout/app-sidebar';
import { AreaShell } from '@/components/layout/area-shell';
import { requireFirmMember } from '@/features/auth/rbac/require';
import type { ReactNode } from 'react';

interface FirmLayoutProps {
  children: ReactNode;
  params: Promise<{ firmSlug: string }>;
}

export default async function FirmLayout({
  children,
  params,
}: FirmLayoutProps) {
  const { firmSlug } = await params;
  const user = await requireFirmMember(firmSlug);

  const navGroups: AppNavGroup[] = [
    {
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          href: `/firm/${firmSlug}/dashboard`,
          icon: 'dashboard',
        },
      ],
    },
    {
      label: 'Manage',
      items: [
        ...(user.accountRole === 'FIRM_ADMIN'
          ? [
              {
                id: 'team',
                label: 'Team',
                href: `/firm/${firmSlug}/team`,
                icon: 'users' as const,
              },
            ]
          : []),
        {
          id: 'clients',
          label: 'Clients',
          href: `/firm/${firmSlug}/clients`,
          icon: 'briefcase' as const,
        },
      ],
    },
  ];

  return (
    <AreaShell
      brandHref={`/firm/${firmSlug}/dashboard`}
      navGroups={navGroups}
      profileHref={`/firm/${firmSlug}/profile`}
      contextSlot={
        user.membership?.firm.name ? (
          <p className="truncate px-2 pt-1 text-xs font-medium text-muted-foreground group-data-[state=collapsed]:hidden">
            {user.membership.firm.name}
          </p>
        ) : undefined
      }
    >
      {children}
    </AreaShell>
  );
}
