import { AccountRole } from '@prisma/client';
import { add } from 'date-fns';
import httpStatus from 'http-status';

import prisma from '@/client';
import config from '@/config/config';
import { sendOtpEmail, sendPasswordResetEmail } from '@/shared/services/email.service';
import { createOtpChallenge, verifyOtpChallenge } from '@/shared/services/otp.service';
import {
  createSession,
  revokeAllSessionsForUser,
  revokeSessionByRefreshToken,
  rotateSession,
  signPurposeToken,
  verifyPurposeToken,
} from '@/shared/services/token.service';
import ApiError from '@/shared/utils/api-error';
import {
  compareSecret,
  generateSecureToken,
  hashSecret,
  hashToken,
} from '@/shared/utils/encryption';
import { AuthTokensResponse } from '@/types/response';

const STAFF_ROLES: AccountRole[] = [
  AccountRole.PLATFORM_OWNER,
  AccountRole.FIRM_ADMIN,
  AccountRole.FIRM_TEAM,
];

const SELF_PASSWORD_RESET_ROLES: AccountRole[] = [
  AccountRole.PLATFORM_OWNER,
  AccountRole.FIRM_ADMIN,
];

interface RequestMeta {
  ipAddress?: string;
  userAgent?: string;
}

const publicUser = (user: {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  accountRole: AccountRole;
}) => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  accountRole: user.accountRole,
});

// ---------------------------------------------------------------------------
// Staff login (Platform Owner / Firm Admin / Firm Team) — shared endpoint
// ---------------------------------------------------------------------------

export const staffLogin = async (email: string, password: string, meta: RequestMeta) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      memberships: { select: { id: true, firmId: true, isOwner: true, status: true } },
    },
  });

  if (
    !user ||
    !STAFF_ROLES.includes(user.accountRole) ||
    !user.passwordHash ||
    !(await compareSecret(password, user.passwordHash))
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }

  if (user.status !== 'ACTIVE') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Your account has been deactivated');
  }

  const membership = user.memberships[0];
  if (user.accountRole !== 'PLATFORM_OWNER') {
    if (!membership || membership.status !== 'ACTIVE') {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        'Your account has been deactivated. Contact your firm admin.'
      );
    }
  }

  const tokens = await createSession(user, {
    firmId: membership?.firmId,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  return { user: publicUser(user), tokens };
};

export const refreshTokens = async (
  refreshToken: string,
  meta: RequestMeta
): Promise<AuthTokensResponse> => {
  return rotateSession(refreshToken, meta);
};

export const logout = async (refreshToken: string): Promise<void> => {
  await revokeSessionByRefreshToken(refreshToken);
};

// ---------------------------------------------------------------------------
// Client login — 3 steps: email -> password -> emailed OTP
// ---------------------------------------------------------------------------

const CLIENT_LOGIN_PURPOSE = 'client_login';

export const clientLoginStart = async (email: string): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true, accountRole: true, status: true },
  });

  if (!user || user.accountRole !== 'FIRM_CLIENT') {
    throw new ApiError(httpStatus.NOT_FOUND, 'No account found with this email');
  }
  if (user.status !== 'ACTIVE') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Your account has been deactivated');
  }
};

export const clientLoginPassword = async (
  email: string,
  password: string,
  meta: RequestMeta
): Promise<{ loginToken: string; expiresInMinutes: number }> => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (
    !user ||
    user.accountRole !== 'FIRM_CLIENT' ||
    !user.passwordHash ||
    !(await compareSecret(password, user.passwordHash))
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  if (user.status !== 'ACTIVE') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Your account has been deactivated');
  }

  const { challengeId, code, expiresInMinutes } = await createOtpChallenge({
    userId: user.id,
    destination: user.email as string,
    channel: 'EMAIL',
    purpose: 'LOGIN',
    ipAddress: meta.ipAddress,
  });

  await sendOtpEmail(user.email as string, code, expiresInMinutes);

  const loginToken = signPurposeToken(
    { sub: user.id, purpose: CLIENT_LOGIN_PURPOSE, challengeId },
    config.jwt.clientLoginExpirationMinutes
  );

  return { loginToken, expiresInMinutes: config.jwt.clientLoginExpirationMinutes };
};

export const clientVerifyOtp = async (loginToken: string, otp: string, meta: RequestMeta) => {
  const decoded = verifyPurposeToken(loginToken, CLIENT_LOGIN_PURPOSE);
  const challengeId = decoded.challengeId as string;

  await verifyOtpChallenge(challengeId, otp);

  const user = await prisma.user.findUnique({
    where: { id: decoded.sub },
    include: {
      clientAccess: {
        where: { revokedAt: null },
        include: { client: { select: { firmId: true } } },
        take: 1,
      },
    },
  });

  if (!user || user.accountRole !== 'FIRM_CLIENT' || user.status !== 'ACTIVE') {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }

  const firmId = user.clientAccess[0]?.client.firmId;

  const tokens = await createSession(user, {
    firmId,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date(), emailVerifiedAt: user.emailVerifiedAt ?? new Date() },
  });

  return { user: publicUser(user), tokens };
};

// ---------------------------------------------------------------------------
// Forgot / reset password — Platform Owner & Firm Admin self-service only
// (Team cannot self-reset by design; Client uses OTP login, not a password reset)
// ---------------------------------------------------------------------------

export const forgotPassword = async (email: string): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true, email: true, accountRole: true, status: true },
  });

  if (!user || !SELF_PASSWORD_RESET_ROLES.includes(user.accountRole) || user.status !== 'ACTIVE') {
    // Do not reveal whether the account exists.
    return;
  }

  const rawToken = generateSecureToken(32);
  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      type: 'PASSWORD_RESET',
      tokenHash: hashToken(rawToken),
      expiresAt: add(new Date(), { minutes: config.jwt.resetPasswordExpirationMinutes }),
    },
  });

  const resetUrl = `${config.clientPortalUrl}/reset-password?token=${rawToken}`;
  await sendPasswordResetEmail(user.email as string, resetUrl);
};

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  const tokenHash = hashToken(token);
  const verification = await prisma.verificationToken.findUnique({ where: { tokenHash } });

  if (
    !verification ||
    verification.consumedAt ||
    verification.type !== 'PASSWORD_RESET' ||
    verification.expiresAt < new Date()
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This reset link is invalid or has expired');
  }

  const passwordHash = await hashSecret(newPassword);

  await prisma.$transaction([
    prisma.user.update({ where: { id: verification.userId }, data: { passwordHash } }),
    prisma.verificationToken.update({
      where: { id: verification.id },
      data: { consumedAt: new Date() },
    }),
  ]);

  await revokeAllSessionsForUser(verification.userId);
};
