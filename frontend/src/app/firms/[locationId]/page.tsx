import { redirect } from 'next/navigation';

import { GhlFirmConnectGate } from '@/components/firm/ghl-firm-connect-gate';
import { LinkEntryNotice } from '@/components/firm/link-entry-notice';
import type { GhlFirmLocationState } from '@/features/firm/types';
import { backendFetch } from '@/libs/backend';

interface FirmConnectPageProps {
  params: Promise<{ locationId: string }>;
  searchParams: Promise<{ error?: string; connect?: string }>;
}

/**
 * The page a GoHighLevel custom-menu link opens for the firm owner:
 * `/firms/{locationId}`.
 *
 * Visiting it first runs the entry route, which checks the sub-account against
 * the agency and the firm's stored token against GoHighLevel, then signs the
 * owner in and opens the dashboard. This page only renders when that could not
 * finish: `?connect=1` (no working token on file, so ask for one) or `?error=`.
 */
export default async function FirmConnectPage({
  params,
  searchParams,
}: FirmConnectPageProps) {
  const { locationId } = await params;
  const { error, connect } = await searchParams;

  if (error) {
    return (
      <LinkEntryNotice title="Could not open this sub-account" description={error} />
    );
  }

  if (!connect) {
    redirect(`/api/firms/enter?locationId=${encodeURIComponent(locationId)}`);
  }

  const { body } = await backendFetch<GhlFirmLocationState>(
    `/ghl/firm/${encodeURIComponent(locationId)}`,
  );
  const state = body.success ? (body.data ?? null) : null;

  return <GhlFirmConnectGate locationId={locationId} initialState={state} />;
}
