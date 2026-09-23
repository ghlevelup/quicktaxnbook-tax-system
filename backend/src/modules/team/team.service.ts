import { MemberStatus, StaffType } from '@prisma/client';
import httpStatus from 'http-status';

import prisma from '@/client';
import { revokeAllSessionsForUser } from '@/shared/services/token.service';
import ApiError from '@/shared/utils/api-error';
import { generateRandomPassword, hashSecret } from '@/shared/utils/encryption';

const MEMBER_SELECT = {
  id: true,
  staffType: true,
  title: true,
  status: true,
  isOwner: true,
  joinedAt: true,
  deactivatedAt: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
      status: true,
      lastLoginAt: true,
    },
  },
} as const;

const assertFirmMember = async (firmId: string, memberId: string) => {
  const member = await prisma.firmMember.findFirst({
    where: { id: memberId, firmId },
    select: MEMBER_SELECT,
  });
  if (!member) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Team member not found');
  }
  return member;
};

interface CreateTeamMemberInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  staffType: StaffType;
  title?: string;
}

export const createTeamMember = async (
  firmId: string,
  createdByUserId: string,
  input: CreateTeamMemberInput
) => {
  const email = input.email.toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'That email is already in use');
  }

  const temporaryPassword = generateRandomPassword();
  const passwordHash = await hashSecret(temporaryPassword);

  const member = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        phone: input.phone,
        firstName: input.firstName,
        lastName: input.lastName,
        displayName: `${input.firstName} ${input.lastName}`,
        passwordHash,
        accountRole: 'FIRM_TEAM',
        status: 'ACTIVE',
      },
    });

    const teamRole = await tx.role.upsert({
      where: { firmId_key: { firmId, key: 'team' } },
      update: {},
      create: { firmId, key: 'team', name: 'Team', isSystem: true, permissions: [] },
    });

    const createdMember = await tx.firmMember.create({
      data: {
        firmId,
        userId: user.id,
        staffType: input.staffType,
        title: input.title,
        status: 'ACTIVE',
        joinedAt: new Date(),
      },
      select: MEMBER_SELECT,
    });

    await tx.firmMemberRole.create({
      data: { memberId: createdMember.id, roleId: teamRole.id, grantedById: createdByUserId },
    });

    return createdMember;
  });

  return { member, temporaryPassword };
};

interface ListTeamMembersQuery {
  page?: number;
  limit?: number;
  status?: MemberStatus;
}

export const listTeamMembers = async (firmId: string, query: ListTeamMembersQuery) => {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const where = { firmId, ...(query.status ? { status: query.status } : {}) };

  const [results, totalResults] = await Promise.all([
    prisma.firmMember.findMany({
      where,
      select: MEMBER_SELECT,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.firmMember.count({ where }),
  ]);

  return { results, page, limit, totalPages: Math.ceil(totalResults / limit), totalResults };
};

export const getTeamMember = async (firmId: string, memberId: string) => {
  return assertFirmMember(firmId, memberId);
};

interface UpdateTeamMemberInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  staffType?: StaffType;
  title?: string;
}

export const updateTeamMember = async (
  firmId: string,
  memberId: string,
  input: UpdateTeamMemberInput
) => {
  const member = await assertFirmMember(firmId, memberId);

  await prisma.$transaction([
    prisma.firmMember.update({
      where: { id: member.id },
      data: { staffType: input.staffType, title: input.title },
    }),
    prisma.user.update({
      where: { id: member.user.id },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        displayName:
          input.firstName || input.lastName
            ? [input.firstName ?? member.user.firstName, input.lastName ?? member.user.lastName]
                .filter(Boolean)
                .join(' ')
            : undefined,
      },
    }),
  ]);

  return assertFirmMember(firmId, memberId);
};

export const setTeamMemberStatus = async (
  firmId: string,
  memberId: string,
  status: MemberStatus
) => {
  const member = await assertFirmMember(firmId, memberId);
  if (member.isOwner) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Can't change status of the firm owner");
  }

  await prisma.firmMember.update({
    where: { id: member.id },
    data: { status, deactivatedAt: status === 'DEACTIVATED' ? new Date() : null },
  });

  if (status === 'DEACTIVATED') {
    await revokeAllSessionsForUser(member.user.id);
  }

  return assertFirmMember(firmId, memberId);
};

export const resetTeamMemberPassword = async (firmId: string, memberId: string) => {
  const member = await assertFirmMember(firmId, memberId);

  const temporaryPassword = generateRandomPassword();
  const passwordHash = await hashSecret(temporaryPassword);

  await prisma.user.update({ where: { id: member.user.id }, data: { passwordHash } });
  await revokeAllSessionsForUser(member.user.id);

  return { member, temporaryPassword };
};
