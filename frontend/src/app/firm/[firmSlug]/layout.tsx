import { TabShell, type TabNavItem } from '@/components/layout/tab-shell';
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

  const tabs: TabNavItem[] = [
    { id: 'dashboard', label: 'Dashboard', href: `/firm/${firmSlug}/dashboard` },
    { id: 'clients', label: 'Clients', href: `/firm/${firmSlug}/clients` },
    ...(user.accountRole === 'FIRM_ADMIN'
      ? [{ id: 'team', label: 'Team', href: `/firm/${firmSlug}/team` }]
      : []),
  ];

  return (
    <TabShell
      title={user.membership?.firm.name ?? 'Workspace'}
      tabs={tabs}
      profileHref={`/firm/${firmSlug}/profile`}
    >
      {children}
    </TabShell>
  );
}
