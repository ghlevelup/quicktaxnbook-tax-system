import { redirect } from 'next/navigation';

import { LinkEntryNotice } from '@/components/firm/link-entry-notice';

interface TeamEntryPageProps {
  params: Promise<{ locationId: string; userId: string }>;
  searchParams: Promise<{ error?: string }>;
}

/**
 * The page a GoHighLevel custom-menu link opens for staff:
 * `/firms/{location.id}/teams/{user.id}`.
 *
 * The ids in the URL are never trusted on their own. The entry route checks the
 * sub-account against the agency, then that the user is staff of it, and signs
 * them in. This page only renders when that check refused (`?error=`).
 */
export default async function TeamEntryPage({
  params,
  searchParams,
}: TeamEntryPageProps) {
  const { locationId, userId } = await params;
  const { error } = await searchParams;

  if (!error) {
    redirect(
      `/api/firms/team-enter?locationId=${encodeURIComponent(locationId)}&userId=${encodeURIComponent(userId)}`,
    );
  }

  return <LinkEntryNotice title="Could not sign you in" description={error} />;
}
