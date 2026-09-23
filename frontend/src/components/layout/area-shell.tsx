import { AppShell } from '@/components/layout/app-shell';
import { AppSidebar, type AppNavGroup } from '@/components/layout/app-sidebar';
import { Topbar } from '@/components/layout/topbar';
import type { ReactNode } from 'react';

interface AreaShellProps {
  children: ReactNode;
  brandHref: string;
  navGroups: AppNavGroup[];
  profileHref: string;
  contextLabel?: string;
}

/** Shared chrome (sidebar + topbar + content well) for the platform/firm/client areas. */
export function AreaShell({
  children,
  brandHref,
  navGroups,
  profileHref,
  contextLabel,
}: AreaShellProps) {
  return (
    <AppShell variant="sidebar">
      <AppSidebar
        brandHref={brandHref}
        navGroups={navGroups}
        profileHref={profileHref}
        contextLabel={contextLabel}
      />
      <div className="relative flex h-svh max-h-svh w-full min-w-0 flex-1 overflow-hidden bg-background">
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pt-app-header md:pt-0">
          <Topbar profileHref={profileHref} />
          <main className="relative z-10 min-h-0 flex-1 overflow-x-hidden overflow-y-auto bg-muted/70 dark:bg-background">
            <div className="ms-0 me-auto w-full max-w-7xl min-w-0 px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AppShell>
  );
}
