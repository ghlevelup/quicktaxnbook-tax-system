import { AccountRole } from '@prisma/client';
import { add } from 'date-fns';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';

import prisma from '@/client';
import config from '@/config/config';
import ApiError from '@/shared/utils/api-error';
import { generateSecureToken, hashToken } from '@/shared/utils/encryption';
import { AuthTokensResponse } from '@/types/response';

export interface AccessTokenPayload {
  sub: string;
  sid: string;
  role: AccountRole;
  firmId?: string;
}

interface PurposeTokenPayload {
  sub: string;
  purpose: string;
  [key: string]: unknown;
}

export const signAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: `${config.jwt.accessExpirationMinutes}m`,
  });
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  try {
    return jwt.verify(token, config.jwt.secret) as unknown as AccessTokenPayload;
  } catch {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/** Sign a short-lived, single-purpose JWT (e.g. pending client-login, password reset). */
export const signPurposeToken = (
  payload: Omit<PurposeTokenPayload, 'sub'> & { sub: string },
  expiresInMinutes: number
): string => {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: `${expiresInMinutes}m` });
};

export const verifyPurposeToken = (token: string, purpose: string): PurposeTokenPayload => {
  let decoded: PurposeTokenPayload;
  try {
    decoded = jwt.verify(token, config.jwt.secret) as unknown as PurposeTokenPayload;
  } catch {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'This link/code has expired, please start again');
  }
  if (decoded.purpose !== purpose) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token');
  }
  return decoded;
};

interface SessionMeta {
  ipAddress?: string;
  userAgent?: string;
  firmId?: string;
}

interface SessionUser {
  id: string;
  accountRole: AccountRole;
}

export const createSession = async (
  user: SessionUser,
  meta: SessionMeta = {}
): Promise<AuthTokensResponse> => {
  const refreshToken = generateSecureToken(40);
  const refreshExpires = add(new Date(), { days: config.jwt.refreshExpirationDays });

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      firmId: meta.firmId,
      tokenHash: hashToken(refreshToken),
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      expiresAt: refreshExpires,
    },
  });

  const accessExpires = add(new Date(), { minutes: config.jwt.accessExpirationMinutes });
  const accessToken = signAccessToken({
    sub: user.id,
    sid: session.id,
    role: user.accountRole,
    firmId: meta.firmId,
  });

  return {
    access: { token: accessToken, expires: accessExpires },
    refresh: { token: refreshToken, expires: refreshExpires },
  };
};

export const rotateSession = async (
  refreshToken: string,
  meta: SessionMeta = {}
): Promise<AuthTokensResponse> => {
  const tokenHash = hashToken(refreshToken);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!session || session.revokedAt || session.expiresAt < new Date()) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
  if (session.user.status !== 'ACTIVE') {
    throw new ApiError(httpStatus.FORBIDDEN, 'This account is not active');
  }

  await prisma.session.update({
    where: { id: session.id },
    data: { revokedAt: new Date() },
  });

  return createSession(
    { id: session.user.id, accountRole: session.user.accountRole },
    {
      ipAddress: meta.ipAddress ?? session.ipAddress ?? undefined,
      userAgent: meta.userAgent ?? session.userAgent ?? undefined,
      firmId: session.firmId ?? undefined,
    }
  );
};

export const revokeSessionByRefreshToken = async (refreshToken: string): Promise<void> => {
  const tokenHash = hashToken(refreshToken);
  await prisma.session.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

export const revokeAllSessionsForUser = async (userId: string): Promise<void> => {
  await prisma.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

export const revokeSessionById = async (sessionId: string): Promise<void> => {
  await prisma.session.updateMany({
    where: { id: sessionId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};
