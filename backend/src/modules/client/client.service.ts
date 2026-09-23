import { ClientStatus, ClientType } from '@prisma/client';
import { add } from 'date-fns';
import httpStatus from 'http-status';

import prisma, { TX_OPTIONS } from '@/client';
import config from '@/config/config';
import logger from '@/config/logger';
import { sendOnboardingLinkEmail } from '@/shared/services/email.service';
import { createSession } from '@/shared/services/token.service';
import ApiError from '@/shared/utils/api-error';
import {
  encryptPII,
  generateSecureToken,
  hashSecret,
  hashToken,
  lastDigits,
  normalizeDigits,
} from '@/shared/utils/encryption';

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

export const updateClientStatus = async (
  firmId: string,
  clientId: string,
  status: Extract<ClientStatus, 'ACTIVE' | 'INACTIVE'>
) => {
  const client = await assertClient(firmId, clientId);
  if (client.status !== 'ACTIVE' && client.status !== 'INACTIVE') {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Can't change status while the client is ${client.status.toLowerCase()}`
    );
  }
  return prisma.client.update({ where: { id: clientId }, data: { status } });
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
    // Fire-and-forget: the onboarding link is already persisted, so a slow
    // or unreachable SMTP server must not stall this request.
    sendOnboardingLinkEmail(client.email, firm.name, onboardingUrl).catch((error) => {
      logger.error('Failed to send onboarding link email: %s', (error as Error).message);
    });
  }

  return { onboardingUrl, expiresAt };
};

export const getOnboardingLinkInfo = async (token: string) => {
  const tokenHash = hashToken(token);
  const link = await prisma.onboardingLink.findUnique({
    where: { tokenHash },
    include: {
      firm: { select: { name: true } },
      client: { select: { displayName: true, status: true, type: true, email: true, phone: true } },
    },
  });

  if (!link || link.revokedAt || link.completedAt || link.expiresAt < new Date()) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This onboarding link is invalid or has expired');
  }

  if (!link.openedAt) {
    await prisma.onboardingLink.update({ where: { id: link.id }, data: { openedAt: new Date() } });
  }

  // Best-effort split of the name the admin typed at creation, so the client
  // sees it pre-filled on the onboarding form instead of starting from blank
  // fields that don't match what the firm already has on file.
  const [prefillFirstName, ...rest] = link.client.displayName.trim().split(/\s+/);
  const prefillLastName = rest.join(' ') || undefined;

  return {
    firmName: link.firm.name,
    clientDisplayName: link.client.displayName,
    clientType: link.client.type,
    prefillFirstName: prefillFirstName || undefined,
    prefillLastName,
    prefillEmail: link.client.email,
    prefillPhone: link.client.phone,
    expiresAt: link.expiresAt,
  };
};

interface OnboardingAddressInput {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

interface CompleteOnboardingInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  business?: {
    legalName: string;
    ein?: string;
    website?: string;
    phone?: string;
    address?: OnboardingAddressInput;
  };
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
  const link = await prisma.onboardingLink.findUnique({
    where: { tokenHash },
    include: { client: { select: { id: true, firmId: true, type: true } } },
  });

  if (!link || link.revokedAt || link.completedAt || link.expiresAt < new Date()) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This onboarding link is invalid or has expired');
  }

  const isBusiness = link.client.type !== 'INDIVIDUAL';
  if (isBusiness && !input.business?.legalName) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Business legal name is required');
  }

  const email = input.email.toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'That email is already in use');
  }

  const passwordHash = await hashSecret(input.password);
  const einDigits = input.business?.ein ? normalizeDigits(input.business.ein) : undefined;

  const businessAddress = isBusiness ? input.business?.address : undefined;
  const hasAddress = !!businessAddress && Object.values(businessAddress).some(Boolean);

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

    // None of these depend on each other's result — only on createdUser.id
    // (clientAccess) or values already known before the transaction started
    // — so run them concurrently instead of as 4 sequential round trips.
    await Promise.all([
      tx.clientAccess.create({
        data: {
          clientId: link.clientId,
          userId: createdUser.id,
          accessLevel: 'OWNER',
          isPrimary: true,
          invitedAt: link.createdAt,
          acceptedAt: new Date(),
        },
      }),
      tx.client.update({
        where: { id: link.clientId },
        data: {
          status: 'ACTIVE',
          onboardedAt: new Date(),
          ...(isBusiness
            ? {
                legalName: input.business?.legalName,
                website: input.business?.website,
                phone: input.business?.phone,
                email: undefined, // business email stays whatever the admin set at creation
                einEncrypted: einDigits ? encryptPII(einDigits) : undefined,
                einLast4: einDigits ? lastDigits(einDigits) : undefined,
              }
            : { email, phone: input.phone }),
        },
      }),
      hasAddress
        ? tx.address.create({
            data: {
              clientId: link.clientId,
              type: 'BUSINESS',
              line1: businessAddress?.line1 || '',
              line2: businessAddress?.line2,
              city: businessAddress?.city || '',
              state: businessAddress?.state,
              postalCode: businessAddress?.postalCode,
              country: businessAddress?.country || 'US',
              isPrimary: true,
            },
          })
        : Promise.resolve(),
      tx.onboardingLink.update({
        where: { id: link.id },
        data: { completedAt: new Date() },
      }),
    ]);

    return { user: createdUser };
  }, TX_OPTIONS);

  const tokens = await createSession(user, {
    firmId: link.client.firmId,
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
