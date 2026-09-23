import { z } from 'zod';

import {
  DOMAIN_PATTERN,
  EIN_PATTERN,
  SSN_PATTERN,
  isValidEinStructure,
  isValidSsnStructure,
  validateUsAddress,
} from '@/shared/utils/validation-patterns';
import { normalizeDigits } from '@/shared/utils/encryption';

export const onboardFirmSchema = z.object({
  body: z
    .object({
      firm: z.object({
        legalName: z.string().min(1, 'Legal business name is required'),
        displayName: z.string().min(1).optional(),
        ein: z
          .string()
          .regex(EIN_PATTERN, 'EIN must look like 12-3456789')
          .refine(
            (v) => isValidEinStructure(normalizeDigits(v)),
            'That EIN is not a valid IRS-issued number'
          )
          .optional(),
        licenseNumber: z.string().optional(),
        licenseType: z.string().optional(),
        website: z.string().url().optional(),
        domain: z
          .string()
          .regex(DOMAIN_PATTERN, 'Enter a valid domain, e.g. acme or portal.acme.com')
          .optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z
          .object({
            line1: z.string().optional(),
            line2: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            postalCode: z.string().optional(),
            country: z.string().default('US').optional(),
          })
          .optional(),
      }),
      owner: z.object({
        firstName: z.string().min(1, "Owner's first name is required"),
        lastName: z.string().min(1, "Owner's last name is required"),
        email: z.string().email(),
        phone: z.string().optional(),
        ssn: z
          .string()
          .regex(SSN_PATTERN, 'SSN must look like 123-45-6789')
          .refine(
            (v) => isValidSsnStructure(normalizeDigits(v)),
            'That SSN is not a valid Social Security number'
          )
          .optional(),
      }),
    })
    .superRefine((data, ctx) => {
      if (!data.firm.ein && !data.owner.ssn) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Provide at least the firm EIN or the owner SSN. One is required to uniquely identify this firm',
          path: ['firm', 'ein'],
        });
      }
      validateUsAddress(data.firm.address, ctx, ['firm', 'address']);
    }),
});

export const listFirmsSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    search: z.string().optional(),
    status: z.enum(['TRIAL', 'ACTIVE', 'PAST_DUE', 'SUSPENDED', 'CANCELLED']).optional(),
  }),
});

export const firmIdParamSchema = z.object({
  params: z.object({ firmId: z.string() }),
});

export const updateFirmStatusSchema = z.object({
  params: z.object({ firmId: z.string() }),
  body: z.object({
    status: z.enum(['TRIAL', 'ACTIVE', 'PAST_DUE', 'SUSPENDED', 'CANCELLED']),
  }),
});
