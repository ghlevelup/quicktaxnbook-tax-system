import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { roleHomePath } from '@/features/auth/lib/role-home';
import { getCurrentUser } from '@/features/auth/server/get-current-user';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

const UnauthorizedPage = async () => {
  const [t, user] = await Promise.all([
    getTranslations('errors'),
    getCurrentUser(),
  ]);
  const homeHref = user ? roleHomePath(user) : '/login';

  return (
    <PageLayout centered className="mx-auto max-w-sm px-4 text-center">
      <PageHeader title={t('403')} subtitle={t('unauthorizedDescription')} />
      <Button asChild className="w-full">
        <Link href={homeHref}>{t('goToDashboard')}</Link>
      </Button>
    </PageLayout>
  );
};

export default UnauthorizedPage;
