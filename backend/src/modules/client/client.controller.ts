import httpStatus from 'http-status';

import catchAsync from '@/shared/utils/catch-async';
import zParse from '@/shared/utils/z-parse';
import { AuthActor } from '@/types/response';

import * as clientService from './client.service';
import * as clientSchema from './client.validation';

const requestMeta = (req: { ip?: string; headers: Record<string, unknown> }) => ({
  ipAddress: req.ip,
  userAgent: (req.headers['user-agent'] as string) ?? undefined,
});

export const createClient = catchAsync(async (req) => {
  const { body } = await zParse(clientSchema.createClientSchema, req);
  const actor = req.user as AuthActor;
  const client = await clientService.createClient(actor.firmId as string, body);
  return {
    statusCode: httpStatus.CREATED,
    message: 'Client created successfully',
    data: client,
  };
});

export const listClients = catchAsync(async (req) => {
  const { query } = await zParse(clientSchema.listClientsSchema, req);
  const actor = req.user as AuthActor;
  const result = await clientService.listClients(actor.firmId as string, query);
  return {
    statusCode: httpStatus.OK,
    message: 'Clients fetched successfully',
    data: result,
  };
});

export const getClient = catchAsync(async (req) => {
  const {
    params: { clientId },
  } = await zParse(clientSchema.clientIdParamSchema, req);
  const actor = req.user as AuthActor;
  const client = await clientService.getClient(actor.firmId as string, clientId);
  return {
    statusCode: httpStatus.OK,
    message: 'Client fetched successfully',
    data: client,
  };
});

export const updateClientStatus = catchAsync(async (req) => {
  const {
    params: { clientId },
    body: { status },
  } = await zParse(clientSchema.updateClientStatusSchema, req);
  const actor = req.user as AuthActor;
  const client = await clientService.updateClientStatus(actor.firmId as string, clientId, status);
  return {
    statusCode: httpStatus.OK,
    message: status === 'ACTIVE' ? 'Client activated' : 'Client deactivated',
    data: client,
  };
});

export const createOnboardingLink = catchAsync(async (req) => {
  const {
    params: { clientId },
  } = await zParse(clientSchema.clientIdParamSchema, req);
  const actor = req.user as AuthActor;
  const result = await clientService.createOnboardingLink(
    actor.firmId as string,
    clientId,
    actor.userId
  );
  return {
    statusCode: httpStatus.CREATED,
    message: 'Onboarding link created successfully',
    data: result,
  };
});

// --- Public onboarding endpoints ---

export const getOnboardingLinkInfo = catchAsync(async (req) => {
  const {
    params: { token },
  } = await zParse(clientSchema.onboardingTokenParamSchema, req);
  const info = await clientService.getOnboardingLinkInfo(token);
  return {
    statusCode: httpStatus.OK,
    message: 'Onboarding link is valid',
    data: info,
  };
});

export const completeOnboarding = catchAsync(async (req) => {
  const {
    params: { token },
    body,
  } = await zParse(clientSchema.completeOnboardingSchema, req);
  const result = await clientService.completeOnboarding(token, body, requestMeta(req));
  return {
    statusCode: httpStatus.OK,
    message: 'Onboarding complete. You are now logged in',
    data: result,
  };
});
