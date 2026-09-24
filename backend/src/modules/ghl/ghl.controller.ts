import httpStatus from 'http-status';

import { createSession } from '@/shared/services/token.service';
import catchAsync from '@/shared/utils/catch-async';
import zParse from '@/shared/utils/z-parse';

import * as ghlEntry from './ghl.entry';
import * as ghlService from './ghl.service';
import * as ghlSchema from './ghl.validation';

/**
 * State for the public `/firms/:locationId` page: does this sub-account exist
 * under the connected agency, is it linked to a firm, and is that firm already
 * holding a working token. Always answers with the same shape so the page can
 * render a specific message instead of a generic error.
 */
export const getFirmLocationState = catchAsync(async (req) => {
  const {
    params: { locationId },
  } = await zParse(ghlSchema.firmLocationParamSchema, req);

  const state = await ghlService.getFirmLocationState(locationId);

  return {
    statusCode: httpStatus.OK,
    message: state.exists
      ? 'GoHighLevel sub-account found'
      : 'GoHighLevel sub-account not found under this agency',
    data: state,
  };
});

/**
 * Verifies the pasted sub-account PIT and signs in the linked firm's owner.
 *
 * The token *is* the credential here, for the same reason it is on the agency
 * side: a valid sub-account Private Integration Token can only be minted by an
 * admin of that sub-account, so proving possession of one authenticates the
 * caller. The token itself is never returned.
 */
export const connectFirmGhl = catchAsync(async (req) => {
  const { body } = await zParse(ghlSchema.connectFirmSchema, req);

  const result = await ghlService.connectFirmByLocation(body);

  const tokens = await createSession(result.owner, {
    firmId: result.firm.id,
    ipAddress: req.ip,
    userAgent: req.header('user-agent'),
  });

  return {
    statusCode: httpStatus.OK,
    message: 'GoHighLevel sub-account connected successfully',
    data: { firm: result.firm, location: result.location, tokens },
  };
});

/** Links a verified sub-account to an existing firm. Agency session required. */
export const linkFirmLocation = catchAsync(async (req) => {
  const { body } = await zParse(ghlSchema.linkFirmLocationSchema, req);

  const result = await ghlService.linkLocationToFirm(body);

  return {
    statusCode: httpStatus.OK,
    message: 'GoHighLevel sub-account linked to firm successfully',
    data: result,
  };
});

/**
 * `/firms/{locationId}`: verifies the sub-account and the firm's stored token,
 * then signs in the firm owner. `TOKEN_REQUIRED` tells the page to ask for one.
 */
export const enterFirm = catchAsync(async (req) => {
  const { body } = await zParse(ghlSchema.enterFirmSchema, req);
  const result = await ghlEntry.enterFirm(body.locationId);

  if (result.outcome === 'TOKEN_REQUIRED') {
    return { statusCode: httpStatus.OK, message: 'A sub-account token is required', data: result };
  }

  const tokens = await createSession(result.user, {
    firmId: result.firm.id,
    ipAddress: req.ip,
    userAgent: req.header('user-agent'),
  });
  return {
    statusCode: httpStatus.OK,
    message: 'Signed in',
    data: { outcome: result.outcome, firm: result.firm, tokens },
  };
});

/** `/firms/{locationId}/teams/{userId}`: verifies the staff member, then signs them in. */
export const enterTeam = catchAsync(async (req) => {
  const { body } = await zParse(ghlSchema.enterTeamSchema, req);
  const result = await ghlEntry.enterTeam(body.locationId, body.userId);

  const tokens = await createSession(result.user, {
    firmId: result.firm.id,
    ipAddress: req.ip,
    userAgent: req.header('user-agent'),
  });
  return {
    statusCode: httpStatus.OK,
    message: 'Signed in',
    data: { firm: result.firm, tokens },
  };
});
