import { ClientDashboard } from '@/components/client-portal/client-dashboard';

interface ClientDashboardPageProps {
  params: Promise<{ clientId: string }>;
}

export default async function ClientDashboardPage({
  params,
}: ClientDashboardPageProps) {
  const { clientId } = await params;
  return <ClientDashboard clientId={clientId} />;
}
