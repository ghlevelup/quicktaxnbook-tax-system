import type { AppNavGroup } from '@/components/layout/app-sidebar';
import { AreaShell } from '@/components/layout/area-shell';
import { requireClientAccess } from '@/features/auth/rbac/require';
import type { ReactNode } from 'react';

interface ClientLayoutProps {
  children: ReactNode;
  params: Promise<{ clientId: string }>;
}

export default async function ClientPortalLayout({
  children,
  params,
}: ClientLayoutProps) {
  const { clientId } = await params;
  const user = await requireClientAccess(clientId);
  const clientName = user.clients?.find(
    (access) => access.client.id === clientId,
  )?.client.displayName;

  const navGroups: AppNavGroup[] = [
    {
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          href: `/client/${clientId}/dashboard`,
          icon: 'dashboard',
        },
      ],
    },
  ];

  return (
    <AreaShell
      brandHref={`/client/${clientId}/dashboard`}
      navGroups={navGroups}
      profileHref={`/client/${clientId}/profile`}
      contextLabel={clientName}
    >
      {children}
    </AreaShell>
  );
}
