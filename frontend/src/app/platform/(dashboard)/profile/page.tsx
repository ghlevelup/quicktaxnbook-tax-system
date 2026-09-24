import { ProfileView } from '@/components/profile/profile-view';
import { PageHeader, PageLayout } from '@/components/shared/page-header';

export default function PlatformProfilePage() {
  return (
    <PageLayout>
      <PageHeader
        title="Your profile"
        subtitle="Manage your platform owner account."
      />
      <ProfileView />
    </PageLayout>
  );
}
