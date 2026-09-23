import { FirmDashboard } from '@/components/firm/firm-dashboard';

interface FirmDashboardPageProps {
  params: Promise<{ firmSlug: string }>;
}

export default async function FirmDashboardPage({
  params,
}: FirmDashboardPageProps) {
  const { firmSlug } = await params;
  return <FirmDashboard firmSlug={firmSlug} />;
}
