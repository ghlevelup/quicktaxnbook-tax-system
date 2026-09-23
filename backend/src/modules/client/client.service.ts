import { ClientType } from '@prisma/client';
import { add } from 'date-fns';
import httpStatus from 'http-status';

import prisma from '@/client';
import config from '@/config/config';
import { sendOnboardingLinkEmail } from '@/shared/services/email.service';
import { createSession } from '@/shared/services/token.service';
import ApiError from '@/shared/utils/api-error';
import { generateSecureToken, hashSecret, hashToken } from '@/shared/utils/encryption';

interface CreateClientInput {
  displayName: string;
  type: ClientType;
  email?: string;
  phone?: string;
}

export const createClient = async (firmId: string, input: CreateClientInput) => {
  return prisma.client.create({
    data: {
      firmId,
      displayName: input.displayName,
      type: input.type,
      email: input.email?.toLowerCase(),
      phone: input.phone,
      status: 'ONBOARDING',
    },
  });
};

interface ListClientsQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export const listClients = async (firmId: string, query: ListClientsQuery) => {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const where = {
    firmId,
    deletedAt: null,
    ...(query.search
      ? { displayName: { contains: query.search, mode: 'insensitive' as const } }
      : {}),
  };

  const [results, totalResults] = await Promise.all([
    prisma.client.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.client.count({ where }),
  ]);

  return { results, page, limit, totalPages: Math.ceil(totalResults / limit), totalResults };
};

const assertClient = async (firmId: string, clientId: string) => {
  const client = await prisma.client.findFirst({
    where: { id: clientId, firmId, deletedAt: null },
  });
  if (!client) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Client not found');
  }
  return client;
};

export const getClient = async (firmId: string, clientId: string) => {
  return assertClient(firmId, clientId);
};

export const createOnboardingLink = async (
  firmId: string,
  clientId: string,
  createdById: string
) => {
  const client = await assertClient(firmId, clientId);
  const firm = await prisma.firm.findUniqueOrThrow({
    where: { id: firmId },
    select: { name: true },
  });

  const rawToken = generateSecureToken(32);
  const expiresAt = add(new Date(), { days: 7 });

  await prisma.onboardingLink.create({
    data: {
      firmId,
      clientId: client.id,
      type: 'NEW_CLIENT',
      tokenHash: hashToken(rawToken),
      sentTo: client.email,
      sentVia: client.email ? 'EMAIL' : undefined,
      createdById,
      expiresAt,
    },
  });

  const onboardingUrl = `${config.clientPortalUrl}/onboard/${rawToken}`;

  if (client.email) {
    await sendOnboardingLinkEmail(client.email, firm.name, onboardingUrl);
  }

  return { onboardingUrl, expiresAt };
};

export const getOnboardingLinkInfo = async (token: string) => {
  const tokenHash = hashToken(token);
  const link = await prisma.onboardingLink.findUnique({
    where: { tokenHash },
    include: {
      firm: { select: { name: true } },
      client: { select: { displayName: true, status: true } },
    },
  });

  if (!link || link.revokedAt || link.completedAt || link.expiresAt < new Date()) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This onboarding link is invalid or has expired');
  }

  if (!link.openedAt) {
    await prisma.onboardingLink.update({ where: { id: link.id }, data: { openedAt: new Date() } });
  }

  return {
    firmName: link.firm.name,
    clientDisplayName: link.client.displayName,
    expiresAt: link.expiresAt,
  };
};

interface CompleteOnboardingInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

interface RequestMeta {
  ipAddress?: string;
  userAgent?: string;
}

export const completeOnboarding = async (
  token: string,
  input: CompleteOnboardingInput,
  meta: RequestMeta
) => {
  const tokenHash = hashToken(token);
  const link = await prisma.onboardingLink.findUnique({ where: { tokenHash } });

  if (!link || link.revokedAt || link.completedAt || link.expiresAt < new Date()) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This onboarding link is invalid or has expired');
  }

  const email = input.email.toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'That email is already in use');
  }

  const passwordHash = await hashSecret(input.password);

  const { user } = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        email,
        phone: input.phone,
        firstName: input.firstName,
        lastName: input.lastName,
        displayName: `${input.firstName} ${input.lastName}`,
        passwordHash,
        accountRole: 'FIRM_CLIENT',
        status: 'ACTIVE',
        emailVerifiedAt: new Date(),
      },
    });

    await tx.clientAccess.create({
      data: {
        clientId: link.clientId,
        userId: createdUser.id,
        accessLevel: 'OWNER',
        isPrimary: true,
        invitedAt: link.createdAt,
        acceptedAt: new Date(),
      },
    });

    await tx.client.update({
      where: { id: link.clientId },
      data: {
        email,
        phone: input.phone,
        status: 'ACTIVE',
        onboardedAt: new Date(),
      },
    });

    await tx.onboardingLink.update({
      where: { id: link.id },
      data: { completedAt: new Date() },
    });

    return { user: createdUser };
  });

  const client = await prisma.client.findUniqueOrThrow({
    where: { id: link.clientId },
    select: { firmId: true },
  });

  const tokens = await createSession(user, {
    firmId: client.firmId,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      accountRole: user.accountRole,
    },
    tokens,
  };
};
