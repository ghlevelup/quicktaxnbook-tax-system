import type { ReactNode } from 'react';

import { TabShell, type TabNavItem } from '@/components/layout/tab-shell';
import { GhlConnectGate } from '@/components/platform/ghl-connect-gate';
import { getCurrentUser } from '@/features/auth/server/get-current-user';
import { redirect } from 'next/navigation';

const tabs: TabNavItem[] = [
  { id: 'firms', label: 'Firms', href: '/platform/firms' },
];

/**
 * The platform console. Nobody signed in is sent to `/platform`, where the agency
 * admin enters with the agency token and relationship number (or the owner uses
 * the password login). If the agency connection later lapses, the connect popup
 * covers the console until a fresh token is entered.
 */
export default async function PlatformLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/platform');
  if (user.accountRole !== 'PLATFORM_OWNER') redirect('/unauthorized');

  return (
    <TabShell title="Platform" tabs={tabs} profileHref="/platform/profile">
      {children}
      <GhlConnectGate />
    </TabShell>
  );
}
