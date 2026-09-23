import { z } from 'zod';

import { password } from '@/modules/auth/auth.validation';

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phone: z.string().min(7).optional(),
    locale: z.string().optional(),
    timezone: z.string().optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string(),
    newPassword: password,
  }),
});
