import type { AppNavGroup } from '@/components/layout/app-sidebar';
import { AreaShell } from '@/components/layout/area-shell';
import { requireRole } from '@/features/auth/rbac/require';
import type { ReactNode } from 'react';

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

export default async function PlatformLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRole(['PLATFORM_OWNER']);

  return (
    <AreaShell
      brandHref="/platform/firms"
      navGroups={navGroups}
      profileHref="/platform/profile"
    >
      {children}
    </AreaShell>
  );
}
