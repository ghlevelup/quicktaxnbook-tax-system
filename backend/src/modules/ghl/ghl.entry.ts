import httpStatus from 'http-status';

import prisma from '@/client';
import logger from '@/config/logger';
import { findOrCreateGhlTeamMember } from '@/modules/team/team.service';
import ApiError from '@/shared/utils/api-error';

import { GhlApiError } from './ghl.client';
import {
  fetchLocation,
  findLinkedFirm,
  hasWorkingCredential,
  listLocationUsers,
  precheckLocation,
  resolveFirmOwner,
} from './ghl.service';
import type { GhlLinkedFirm } from './ghl.service';
import { ghlTokenProvider } from './ghl.tokens';
import type { GhlPrecheckReason, GhlToken, GhlUser } from './ghl.types';

/**
 * Link-based entry for firm owners and team members: the GoHighLevel custom-menu
 * URL carries the sub-account id (and the user's id), and the app verifies both
 * against GoHighLevel before starting a session.
 *
 *   /firms/{locationId}                  -> firm owner
 *   /firms/{locationId}/teams/{userId}   -> team member
 *
 * Every step is checked live, in order: the sub-account must exist under the
 * connected agency, the firm must hold a working sub-account token, and (for
 * team) the user must be a staff member of that sub-account.
 */

const REASON_MESSAGES: Record<GhlPrecheckReason, string> = {
  GHL_DISABLED: 'GoHighLevel is not enabled on this deployment.',
  AGENCY_TOKEN_MISSING: 'The GoHighLevel agency is not connected yet.',
  AGENCY_TOKEN_REJECTED: 'The agency token was rejected by GoHighLevel.',
  LOCATION_NOT_FOUND: 'That sub-account is not part of the connected agency.',
  GHL_UNREACHABLE: 'Could not reach GoHighLevel to verify this sub-account.',
};

/** Step 1: the sub-account must be real and under the connected agency. */
const assertLocationUnderAgency = async (locationId: string): Promise<void> => {
  const precheck = await precheckLocation(locationId);
  if (precheck.checked && precheck.exists) return;

  const reason = precheck.reason;

  // No usable agency credential (never connected, or GoHighLevel rejects the
  // saved one). That must not lock every firm out: fall through, and the next
  // step proves the sub-account with the firm's own token instead.
  if (!precheck.checked && (reason === 'AGENCY_TOKEN_MISSING' || reason === 'AGENCY_TOKEN_REJECTED')) {
    logger.warn(`Agency check skipped for ${locationId} (${reason}); using the firm token`);
    return;
  }

  const message =
    (reason && REASON_MESSAGES[reason]) ?? 'This sub-account could not be verified.';
  const status =
    reason === 'GHL_UNREACHABLE' || reason === 'GHL_DISABLED'
      ? httpStatus.BAD_GATEWAY
      : httpStatus.NOT_FOUND;
  throw new ApiError(status, message);
};

/**
 * Step 2: the firm behind the sub-account and its stored token. `null` means the
 * token is missing or GoHighLevel no longer accepts it, so the caller asks the
 * firm owner for a (new) one. A GoHighLevel outage is an error, not "no token".
 */
const resolveVerifiedFirm = async (
  locationId: string
): Promise<{ firm: GhlLinkedFirm; token: GhlToken } | null> => {
  const firm = await findLinkedFirm(locationId);
  if (!firm) return null;

  // A suspended or cancelled firm stays locked out, whatever GoHighLevel says.
  const record = await prisma.firm.findUnique({ where: { id: firm.id }, select: { status: true } });
  if (record?.status !== 'ACTIVE') {
    throw new ApiError(httpStatus.FORBIDDEN, 'This firm is not active.');
  }

  if (!(await hasWorkingCredential(firm.id))) return null;

  const token = await ghlTokenProvider.forFirm(firm.id);
  try {
    const location = await fetchLocation(token, locationId);
    if (location.id !== locationId) return null;
  } catch (error) {
    if (error instanceof GhlApiError && error.isAuthError) return null;
    if (error instanceof GhlApiError && error.status === 0) {
      throw new ApiError(
        httpStatus.BAD_GATEWAY,
        'Could not reach GoHighLevel to verify this sub-account. Please try again.'
      );
    }
    throw error;
  }
  return { firm, token };
};

export type FirmEntryResult =
  | { outcome: 'OK'; firm: GhlLinkedFirm; user: { id: string; accountRole: 'FIRM_ADMIN' } }
  | { outcome: 'TOKEN_REQUIRED' };

/** Firm owner: `/firms/{locationId}`. */
export const enterFirm = async (locationId: string): Promise<FirmEntryResult> => {
  await assertLocationUnderAgency(locationId);

  const verified = await resolveVerifiedFirm(locationId);
  if (!verified) return { outcome: 'TOKEN_REQUIRED' };

  const owner = await resolveFirmOwner(verified.firm.id);
  if (!owner) {
    throw new ApiError(httpStatus.CONFLICT, 'This firm has no active owner account.');
  }
  return {
    outcome: 'OK',
    firm: verified.firm,
    user: { id: owner.id, accountRole: owner.accountRole as 'FIRM_ADMIN' },
  };
};

export interface TeamEntryResult {
  firm: GhlLinkedFirm;
  user: { id: string; accountRole: 'FIRM_TEAM' };
}

/** Team member: `/firms/{locationId}/teams/{userId}`. */
export const enterTeam = async (locationId: string, userId: string): Promise<TeamEntryResult> => {
  await assertLocationUnderAgency(locationId);

  const verified = await resolveVerifiedFirm(locationId);
  if (!verified) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "This firm's owner has not connected GoHighLevel yet. Ask them to open the firm link first."
    );
  }

  let users: GhlUser[];
  try {
    users = await listLocationUsers(verified.token, { locationId });
  } catch (error) {
    if (error instanceof GhlApiError && error.isAuthError) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'The firm token cannot read GoHighLevel users. Give it the users.readonly scope and reconnect.'
      );
    }
    if (error instanceof GhlApiError && error.status === 0) {
      throw new ApiError(
        httpStatus.BAD_GATEWAY,
        'Could not reach GoHighLevel to verify this team member. Please try again.'
      );
    }
    throw error;
  }

  const ghlUser = users.find((candidate) => candidate.id === userId);
  if (!ghlUser) {
    logger.warn(`Team entry rejected: user ${userId} is not staff of location ${locationId}`);
    throw new ApiError(httpStatus.FORBIDDEN, 'That user is not a member of this sub-account.');
  }

  const owner = await resolveFirmOwner(verified.firm.id);
  const user = await findOrCreateGhlTeamMember(verified.firm.id, ghlUser, owner?.id);
  return { firm: verified.firm, user };
};
