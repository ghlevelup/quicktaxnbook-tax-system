import httpStatus from 'http-status';

import ApiError from '@/shared/utils/api-error';
import catchAsync from '@/shared/utils/catch-async';
import zParse from '@/shared/utils/z-parse';
import { AuthActor } from '@/types/response';

import * as profileService from './profile.service';
import * as profileSchema from './profile.validation';

export const getMe = catchAsync(async (req) => {
  const profile = await profileService.getMyProfile(req.user as AuthActor);
  return {
    statusCode: httpStatus.OK,
    message: 'Profile fetched successfully',
    data: profile,
  };
});

export const updateMe = catchAsync(async (req) => {
  const { body } = await zParse(profileSchema.updateProfileSchema, req);
  const profile = await profileService.updateMyProfile(req.user as AuthActor, body);
  return {
    statusCode: httpStatus.OK,
    message: 'Profile updated successfully',
    data: profile,
  };
});

export const changeMyPassword = catchAsync(async (req) => {
  const {
    body: { currentPassword, newPassword },
  } = await zParse(profileSchema.changePasswordSchema, req);
  const tokens = await profileService.changeMyPassword(
    req.user as AuthActor,
    currentPassword,
    newPassword
  );
  return {
    statusCode: httpStatus.OK,
    message: 'Password changed successfully',
    data: { tokens },
  };
});

export const uploadMyAvatar = catchAsync(async (req) => {
  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No file uploaded');
  }
  const result = await profileService.uploadMyAvatar(req.user as AuthActor, req.file);
  return {
    statusCode: httpStatus.OK,
    message: 'Avatar uploaded successfully',
    data: result,
  };
});
