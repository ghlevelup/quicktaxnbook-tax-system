import { OtpChannel, OtpPurpose } from '@prisma/client';
import { add } from 'date-fns';
import httpStatus from 'http-status';

import prisma from '@/client';
import config from '@/config/config';
import logger from '@/config/logger';
import ApiError from '@/shared/utils/api-error';
import { compareSecret, generateOtpCode, hashSecret } from '@/shared/utils/encryption';

interface CreateOtpParams {
  userId?: string;
  firmId?: string;
  destination: string;
  channel: OtpChannel;
  purpose: OtpPurpose;
  ipAddress?: string;
}

export const createOtpChallenge = async (
  params: CreateOtpParams
): Promise<{ challengeId: string; code: string; expiresInMinutes: number }> => {
  const code = generateOtpCode(6);
  const codeHash = await hashSecret(code);
  const expiresAt = add(new Date(), { minutes: config.otp.expirationMinutes });

  const challenge = await prisma.otpChallenge.create({
    data: {
      userId: params.userId,
      firmId: params.firmId,
      destination: params.destination,
      channel: params.channel,
      purpose: params.purpose,
      codeHash,
      maxAttempts: config.otp.maxAttempts,
      ipAddress: params.ipAddress,
      expiresAt,
    },
  });

  if (config.env !== 'production') {
    logger.debug(`[dev-only] OTP for ${params.destination}: ${code}`);
  }

  return { challengeId: challenge.id, code, expiresInMinutes: config.otp.expirationMinutes };
};

export const verifyOtpChallenge = async (challengeId: string, code: string): Promise<void> => {
  const challenge = await prisma.otpChallenge.findUnique({ where: { id: challengeId } });

  if (!challenge || challenge.consumedAt) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or already used code');
  }
  if (challenge.expiresAt < new Date()) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This code has expired, please request a new one');
  }
  if (challenge.attempts >= challenge.maxAttempts) {
    throw new ApiError(
      httpStatus.TOO_MANY_REQUESTS,
      'Too many incorrect attempts, please request a new code'
    );
  }

  const isMatch = await compareSecret(code, challenge.codeHash);
  if (!isMatch) {
    await prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { attempts: { increment: 1 } },
    });
    throw new ApiError(httpStatus.BAD_REQUEST, 'Incorrect code');
  }

  await prisma.otpChallenge.update({
    where: { id: challenge.id },
    data: { consumedAt: new Date() },
  });
};
