import { FirmDetail } from '@/components/platform/firm-detail';

interface FirmDetailPageProps {
  params: Promise<{ firmId: string }>;
}

export default async function FirmDetailPage({ params }: FirmDetailPageProps) {
  const { firmId } = await params;
  return <FirmDetail firmId={firmId} />;
}
