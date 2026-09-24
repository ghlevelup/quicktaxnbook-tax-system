import { MyDocuments } from '@/components/client-portal/my-documents';
import { requireClientAccess } from '@/features/auth/rbac/require';

export default async function ClientDocumentsPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  // Proves this signed-in client actually has access to this entity.
  await requireClientAccess(clientId);
  return <MyDocuments clientId={clientId} />;
}
