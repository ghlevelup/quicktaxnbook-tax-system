import httpStatus from 'http-status';

import catchAsync from '@/shared/utils/catch-async';
import zParse from '@/shared/utils/z-parse';
import { AuthActor } from '@/types/response';

import * as teamService from './team.service';
import * as teamSchema from './team.validation';

export const createTeamMember = catchAsync(async (req) => {
  const { body } = await zParse(teamSchema.createTeamMemberSchema, req);
  const actor = req.user as AuthActor;
  const result = await teamService.createTeamMember(actor.firmId as string, actor.userId, body);
  return {
    statusCode: httpStatus.CREATED,
    message: 'Team member created — copy their password now, it will not be shown again',
    data: result,
  };
});

export const listTeamMembers = catchAsync(async (req) => {
  const { query } = await zParse(teamSchema.listTeamMembersSchema, req);
  const actor = req.user as AuthActor;
  const result = await teamService.listTeamMembers(actor.firmId as string, query);
  return {
    statusCode: httpStatus.OK,
    message: 'Team members fetched successfully',
    data: result,
  };
});

export const getTeamMember = catchAsync(async (req) => {
  const {
    params: { memberId },
  } = await zParse(teamSchema.memberIdParamSchema, req);
  const actor = req.user as AuthActor;
  const member = await teamService.getTeamMember(actor.firmId as string, memberId);
  return {
    statusCode: httpStatus.OK,
    message: 'Team member fetched successfully',
    data: member,
  };
});

export const updateTeamMember = catchAsync(async (req) => {
  const {
    params: { memberId },
    body,
  } = await zParse(teamSchema.updateTeamMemberSchema, req);
  const actor = req.user as AuthActor;
  const member = await teamService.updateTeamMember(actor.firmId as string, memberId, body);
  return {
    statusCode: httpStatus.OK,
    message: 'Team member updated successfully',
    data: member,
  };
});

export const updateTeamMemberStatus = catchAsync(async (req) => {
  const {
    params: { memberId },
    body: { status },
  } = await zParse(teamSchema.updateTeamMemberStatusSchema, req);
  const actor = req.user as AuthActor;
  const member = await teamService.setTeamMemberStatus(actor.firmId as string, memberId, status);
  return {
    statusCode: httpStatus.OK,
    message: status === 'ACTIVE' ? 'Team member unbanned' : 'Team member banned',
    data: member,
  };
});

export const resetTeamMemberPassword = catchAsync(async (req) => {
  const {
    params: { memberId },
  } = await zParse(teamSchema.memberIdParamSchema, req);
  const actor = req.user as AuthActor;
  const result = await teamService.resetTeamMemberPassword(actor.firmId as string, memberId);
  return {
    statusCode: httpStatus.OK,
    message: 'Password reset — copy it now, it will not be shown again',
    data: result,
  };
});
