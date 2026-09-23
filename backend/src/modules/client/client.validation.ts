import { z } from 'zod';

import { password } from '@/modules/auth/auth.validation';

export const createClientSchema = z.object({
  body: z.object({
    displayName: z.string().min(1),
    type: z.enum(['INDIVIDUAL', 'BUSINESS', 'TRUST_ESTATE', 'NONPROFIT']).default('INDIVIDUAL'),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }),
});

export const clientIdParamSchema = z.object({
  params: z.object({ clientId: z.string() }),
});

export const listClientsSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    search: z.string().optional(),
  }),
});

export const onboardingTokenParamSchema = z.object({
  params: z.object({ token: z.string() }),
});

export const completeOnboardingSchema = z.object({
  params: z.object({ token: z.string() }),
  body: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(7),
    password,
  }),
});
