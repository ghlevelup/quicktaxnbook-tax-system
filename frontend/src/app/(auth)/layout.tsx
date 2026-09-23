import { AuthTopbar } from '@/components/auth/auth-topbar';
import { Icon } from '@/components/icons/app-icons';
import { roleHomePath } from '@/features/auth/lib/role-home';
import { getCurrentUser } from '@/features/auth/server/get-current-user';
import { siteConfig } from '@/features/site/config';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

const AuthLayout = async ({ children }: { children: ReactNode }) => {
  const user = await getCurrentUser();
  if (user) redirect(roleHomePath(user));

  return (
    <main
      id="main-content"
      className="relative flex min-h-svh bg-background md:m-4 md:min-h-[calc(100svh-2rem)]"
    >
      <section className="relative hidden overflow-hidden rounded-xl bg-primary p-10 md:flex md:w-1/2 md:flex-col md:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.16),_transparent_55%)]" />
        <div className="relative z-10 flex items-center gap-2.5 text-primary-foreground">
          <Icon name="buildings" weight="fill" className="h-8 w-8" />
          <span className="text-xl font-bold">{siteConfig.appName}</span>
        </div>
        <div className="relative z-10 max-w-sm space-y-3 text-primary-foreground">
          <h2 className="text-3xl leading-tight font-semibold text-balance">
            Run your tax practice from one place
          </h2>
          <p className="text-sm text-primary-foreground/85">
            Onboard your firm, manage your team, and give clients a secure
            self-serve portal, all in one platform.
          </p>
        </div>
      </section>

      <section className="flex w-full flex-col p-4 pt-0 md:w-1/2 md:p-10">
        <AuthTopbar />
        <div className="flex flex-1 items-center justify-center py-8">
          {children}
        </div>
      </section>
    </main>
  );
};

export default AuthLayout;
