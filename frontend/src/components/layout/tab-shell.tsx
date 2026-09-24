'use client';

import { ThemeToggle } from '@/components/shared/theme-toggle';
import { UserDropdown } from '@/components/shared/user-dropdown';
import { useAuth } from '@/features/auth/hooks/auth-provider';
import { cn } from '@/libs/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

export interface TabNavItem {
  id: string;
  label: string;
  href: string;
}

interface TabShellProps {
  children: ReactNode;
  /** Label at the start of the tab strip, e.g. the firm name. */
  title: string;
  tabs: TabNavItem[];
  profileHref: string;
}

/**
 * GoHighLevel-style chrome: no sidebar, a single row of tabs at the top. Built to
 * sit inside a GoHighLevel custom-menu iframe, where a second sidebar next to
 * GoHighLevel's own would waste the space.
 */
export function TabShell({ children, title, tabs, profileHref }: TabShellProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (tab: TabNavItem) =>
    pathname === tab.href || pathname.startsWith(`${tab.href}/`);

  return (
    <div className="flex min-h-svh w-full flex-col bg-muted/70 dark:bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-muted/70 backdrop-blur dark:bg-background">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <nav
            aria-label="Main"
            className="flex min-w-0 items-stretch overflow-x-auto rounded-lg border border-border/70 bg-card shadow-xs"
          >
            <span className="flex shrink-0 items-center px-4 text-sm font-semibold text-foreground">
              {title}
            </span>
            {tabs.map((tab) => {
              const active = isActive(tab);
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex shrink-0 items-center border-b-2 px-4 py-2 text-sm whitespace-nowrap transition-colors',
                    active
                      ? 'border-primary bg-primary/10 font-medium text-primary'
                      : 'border-transparent text-foreground/80 hover:bg-accent/40 hover:text-foreground',
                  )}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            {user && <UserDropdown hideEmailOnMobile profileHref={profileHref} />}
          </div>
        </div>
      </header>

      <main className="w-full flex-1">
        <div className="w-full min-w-0 px-4 py-6 sm:px-6">{children}</div>
      </main>
    </div>
  );
}
