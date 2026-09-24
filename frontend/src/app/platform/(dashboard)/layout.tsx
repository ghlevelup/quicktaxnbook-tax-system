import type { ReactNode } from 'react';

import type { AppNavGroup } from '@/components/layout/app-sidebar';
import { AreaShell } from '@/components/layout/area-shell';
import { GhlConnectGate } from '@/components/platform/ghl-connect-gate';
import { getCurrentUser } from '@/features/auth/server/get-current-user';
import { redirect } from 'next/navigation';

const navGroups: AppNavGroup[] = [
  {
    items: [
      {
        id: 'firms',
        label: 'Firms',
        href: '/platform/firms',
        icon: 'buildings',
      },
    ],
  },
];

/**
 * The platform console. Nobody signed in is sent to `/platform`, where the agency
 * admin enters with the agency token and company id (or the owner uses the
 * password login). If the agency connection later lapses, the connect popup
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
    <AreaShell
      brandHref="/platform/firms"
      navGroups={navGroups}
      profileHref="/platform/profile"
    >
      {children}
      <GhlConnectGate />
    </AreaShell>
  );
}
