import { TeamList } from '@/components/firm/team-list';
import { requireRole } from '@/features/auth/rbac/require';

export default async function TeamPage() {
  await requireRole(['FIRM_ADMIN']);
  return <TeamList />;
}
