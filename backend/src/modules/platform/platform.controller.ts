import httpStatus from 'http-status';

import catchAsync from '@/shared/utils/catch-async';
import zParse from '@/shared/utils/z-parse';
import { AuthActor } from '@/types/response';

import * as agencyService from '@/modules/ghl/agency.service';
import prisma from '@/client';
import ApiError from '@/shared/utils/api-error';
import { createSession } from '@/shared/services/token.service';

import * as platformService from './platform.service';
import * as platformSchema from './platform.validation';

export const onboardFirm = catchAsync(async (req) => {
  const { body } = await zParse(platformSchema.onboardFirmSchema, req);
  const actor = req.user as AuthActor;
  const result = await platformService.onboardFirm(body, actor.userId);
  return {
    statusCode: httpStatus.CREATED,
    message: 'Firm onboarded successfully',
    data: result,
  };
});

// ---------------------------------------------------------------------------
// GoHighLevel agency connection (the /platform popup flow)
// ---------------------------------------------------------------------------

export const getAgencyConnection = catchAsync(async () => {
  const state = await agencyService.getAgencyState();
  return {
    statusCode: httpStatus.OK,
    message: state.connection
      ? 'GoHighLevel agency connection fetched successfully'
      : 'GoHighLevel agency is not connected yet',
    data: state,
  };
});

export const connectAgency = catchAsync(async (req) => {
  const { body } = await zParse(platformSchema.connectAgencySchema, req);
  const actor = req.user as AuthActor;
  const result = await agencyService.connectAgency({ ...body, actorId: actor.userId });

  return {
    statusCode: httpStatus.OK,
    message: 'GoHighLevel agency connected successfully',
    data: result,
  };
});

export const listAgencyLocations = catchAsync(async (req) => {
  const { query } = await zParse(platformSchema.listAgencyLocationsSchema, req);
  const result = await agencyService.listSubAccounts(query);
  return {
    statusCode: httpStatus.OK,
    message: 'GoHighLevel sub-accounts fetched successfully',
    data: result,
  };
});

export const listFirms = catchAsync(async (req) => {
  const { query } = await zParse(platformSchema.listFirmsSchema, req);
  const result = await platformService.listFirms(query);
  return {
    statusCode: httpStatus.OK,
    message: 'Firms fetched successfully',
    data: result,
  };
});

export const getFirm = catchAsync(async (req) => {
  const {
    params: { firmId },
  } = await zParse(platformSchema.firmIdParamSchema, req);
  const firm = await platformService.getFirm(firmId);
  return {
    statusCode: httpStatus.OK,
    message: 'Firm fetched successfully',
    data: firm,
  };
});

export const updateFirmStatus = catchAsync(async (req) => {
  const {
    params: { firmId },
    body: { status },
  } = await zParse(platformSchema.updateFirmStatusSchema, req);
  const firm = await platformService.updateFirmStatus(firmId, status);
  return {
    statusCode: httpStatus.OK,
    message: 'Firm status updated successfully',
    data: firm,
  };
});

/**
 * `/platform` sign-in for the agency admin: the agency token + relationship number (or the
 * relationship number alone, using the saved token) replace the password. On success a
 * normal platform-owner session is issued, so every platform route keeps its one
 * ordinary guard.
 */
export const enterAgency = catchAsync(async (req) => {
  const { body } = await zParse(platformSchema.enterAgencySchema, req);
  const result = await agencyService.enterAgency(body);

  if (result.outcome === 'TOKEN_REQUIRED') {
    return { statusCode: httpStatus.OK, message: 'An agency token is required', data: result };
  }

  const owner = await prisma.user.findFirst({
    where: { accountRole: 'PLATFORM_OWNER', status: 'ACTIVE' },
    orderBy: { createdAt: 'asc' },
    select: { id: true, accountRole: true },
  });
  if (!owner) {
    throw new ApiError(httpStatus.CONFLICT, 'No platform owner account exists. Run the database seed.');
  }

  const tokens = await createSession(owner, {
    ipAddress: req.ip,
    userAgent: req.header('user-agent'),
  });
  return { statusCode: httpStatus.OK, message: 'Signed in', data: { outcome: result.outcome, tokens } };
});
