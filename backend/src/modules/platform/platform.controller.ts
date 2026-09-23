import httpStatus from 'http-status';

import catchAsync from '@/shared/utils/catch-async';
import zParse from '@/shared/utils/z-parse';
import { AuthActor } from '@/types/response';

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
