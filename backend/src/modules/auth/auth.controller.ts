import httpStatus from 'http-status';

import catchAsync from '@/shared/utils/catch-async';
import zParse from '@/shared/utils/z-parse';

import * as authService from './auth.service';
import * as authSchema from './auth.validation';

const requestMeta = (req: { ip?: string; headers: Record<string, unknown> }) => ({
  ipAddress: req.ip,
  userAgent: (req.headers['user-agent'] as string) ?? undefined,
});

export const login = catchAsync(async (req) => {
  const {
    body: { email, password },
  } = await zParse(authSchema.loginSchema, req);
  const result = await authService.staffLogin(email, password, requestMeta(req));
  return {
    statusCode: httpStatus.OK,
    message: 'Logged in successfully',
    data: result,
  };
});

export const refreshTokens = catchAsync(async (req) => {
  const {
    body: { refreshToken },
  } = await zParse(authSchema.refreshTokensSchema, req);
  const tokens = await authService.refreshTokens(refreshToken, requestMeta(req));
  return {
    statusCode: httpStatus.OK,
    message: 'Tokens refreshed successfully',
    data: tokens,
  };
});

export const logout = catchAsync(async (req) => {
  const {
    body: { refreshToken },
  } = await zParse(authSchema.logoutSchema, req);
  await authService.logout(refreshToken);
  return {
    statusCode: httpStatus.OK,
    message: 'Logged out successfully',
  };
});

export const clientLoginStart = catchAsync(async (req) => {
  const {
    body: { email },
  } = await zParse(authSchema.clientLoginStartSchema, req);
  await authService.clientLoginStart(email);
  return {
    statusCode: httpStatus.OK,
    message: 'Account found, please enter your password',
  };
});

export const clientLoginPassword = catchAsync(async (req) => {
  const {
    body: { email, password },
  } = await zParse(authSchema.clientLoginPasswordSchema, req);
  const result = await authService.clientLoginPassword(email, password, requestMeta(req));
  return {
    statusCode: httpStatus.OK,
    message: 'A verification code has been sent to your email',
    data: result,
  };
});

export const clientLoginVerifyOtp = catchAsync(async (req) => {
  const {
    body: { loginToken, otp },
  } = await zParse(authSchema.clientLoginVerifyOtpSchema, req);
  const result = await authService.clientVerifyOtp(loginToken, otp, requestMeta(req));
  return {
    statusCode: httpStatus.OK,
    message: 'Logged in successfully',
    data: result,
  };
});

export const forgotPassword = catchAsync(async (req) => {
  const {
    body: { email },
  } = await zParse(authSchema.forgotPasswordSchema, req);
  const result = await authService.forgotPassword(email, requestMeta(req));
  return {
    statusCode: httpStatus.OK,
    message: 'If an account exists for this email, a verification code has been sent',
    data: result,
  };
});

export const resetPassword = catchAsync(async (req) => {
  const {
    body: { resetToken, otp, password },
  } = await zParse(authSchema.resetPasswordSchema, req);
  await authService.resetPassword(resetToken, otp, password);
  return {
    statusCode: httpStatus.OK,
    message: 'Password reset successfully',
  };
});
