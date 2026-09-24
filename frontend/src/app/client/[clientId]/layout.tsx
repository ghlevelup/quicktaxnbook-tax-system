import type { AppNavGroup } from '@/components/layout/app-sidebar';
import { AreaShell } from '@/components/layout/area-shell';
import { EntitySwitcher } from '@/components/client-portal/entity-switcher';
import { requireClientAccess } from '@/features/auth/rbac/require';
import type { ClientType } from '@/features/clients/types';
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

  const entities = (user.clients ?? []).map((access) => ({
    id: access.client.id,
    displayName: access.client.displayName,
    type: access.client.type as ClientType,
    active: access.client.status === 'ACTIVE',
  }));

  const navGroups: AppNavGroup[] = [
    {
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          href: `/client/${clientId}/dashboard`,
          icon: 'dashboard',
        },
        {
          id: 'documents',
          label: 'My documents',
          href: `/client/${clientId}/documents`,
          icon: 'folder',
        },
      ],
    },
  ];

  return (
    <AreaShell
      brandHref={`/client/${clientId}/dashboard`}
      navGroups={navGroups}
      profileHref={`/client/${clientId}/profile`}
      contextSlot={
        <EntitySwitcher currentClientId={clientId} entities={entities} />
      }
    >
      {children}
    </AreaShell>
  );
}
