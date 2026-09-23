import { AccountRole, Prisma } from '@prisma/client';
import httpStatus from 'http-status';

import prisma from '@/client';
import { createSession, revokeAllSessionsForUser } from '@/shared/services/token.service';
import { fileUrl, saveFile } from '@/shared/services/storage.service';
import ApiError from '@/shared/utils/api-error';
import { compareSecret, hashSecret } from '@/shared/utils/encryption';
import { AuthActor, AuthTokensResponse } from '@/types/response';

const SELF_PASSWORD_CHANGE_ROLES: AccountRole[] = [
  AccountRole.PLATFORM_OWNER,
  AccountRole.FIRM_ADMIN,
  AccountRole.FIRM_CLIENT,
];

export const getMyProfile = async (actor: AuthActor) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: actor.userId },
    include: {
      avatar: true,
      memberships:
        actor.accountRole === 'FIRM_ADMIN' || actor.accountRole === 'FIRM_TEAM'
          ? {
              where: { firmId: actor.firmId },
              include: { firm: { select: { id: true, name: true, slug: true, status: true } } },
            }
          : false,
      clientAccess:
        actor.accountRole === 'FIRM_CLIENT'
          ? {
              where: { revokedAt: null },
              include: {
                client: { select: { id: true, displayName: true, type: true, status: true } },
              },
            }
          : false,
    },
  });

  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: user.displayName,
    accountRole: user.accountRole,
    status: user.status,
    locale: user.locale,
    timezone: user.timezone,
    emailVerifiedAt: user.emailVerifiedAt,
    lastLoginAt: user.lastLoginAt,
    avatarUrl: user.avatar ? fileUrl(user.avatar) : null,
    canChangePassword: SELF_PASSWORD_CHANGE_ROLES.includes(user.accountRole),
    membership: 'memberships' in user ? ((user.memberships as any)?.[0] ?? null) : null,
    clients: 'clientAccess' in user ? ((user.clientAccess as any) ?? null) : null,
  };
};

export const updateMyProfile = async (
  actor: AuthActor,
  data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    locale?: string;
    timezone?: string;
  }
) => {
  try {
    await prisma.user.update({
      where: { id: actor.userId },
      data: {
        ...data,
        displayName:
          data.firstName || data.lastName
            ? [data.firstName, data.lastName].filter(Boolean).join(' ')
            : undefined,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'That phone number is already in use');
    }
    throw error;
  }

  return getMyProfile(actor);
};

export const changeMyPassword = async (
  actor: AuthActor,
  currentPassword: string,
  newPassword: string
): Promise<AuthTokensResponse> => {
  if (!SELF_PASSWORD_CHANGE_ROLES.includes(actor.accountRole)) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'Team members cannot change their own password. Ask your firm admin.'
    );
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: actor.userId } });
  if (!user.passwordHash || !(await compareSecret(currentPassword, user.passwordHash))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Current password is incorrect');
  }

  const passwordHash = await hashSecret(newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  await revokeAllSessionsForUser(user.id);

  return createSession({ id: user.id, accountRole: user.accountRole }, { firmId: actor.firmId });
};

export const uploadMyAvatar = async (actor: AuthActor, file: Express.Multer.File) => {
  const storedFile = await saveFile({
    firmId: actor.firmId,
    uploadedById: actor.userId,
    subDir: 'avatars',
    originalName: file.originalname,
    mimeType: file.mimetype,
    buffer: file.buffer,
  });

  await prisma.user.update({
    where: { id: actor.userId },
    data: { avatarFileId: storedFile.id },
  });

  return { avatarUrl: fileUrl(storedFile) };
};
