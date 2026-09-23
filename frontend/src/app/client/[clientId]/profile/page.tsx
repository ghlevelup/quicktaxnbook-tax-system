import { ProfileView } from '@/components/profile/profile-view';
import { PageHeader, PageLayout } from '@/components/shared/page-header';

export default function ClientProfilePage() {
  return (
    <PageLayout>
      <PageHeader
        title="Your profile"
        subtitle="Manage your account information."
      />
      <ProfileView />
    </PageLayout>
  );
}
