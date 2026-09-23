import { z } from 'zod';

import {
  DOMAIN_PATTERN,
  EIN_PATTERN,
  SSN_PATTERN,
  isValidEinStructure,
  isValidSsnStructure,
  validateUsAddress,
} from '@/libs/validation-patterns';

export const onboardFirmSchema = z
  .object({
    firm: z.object({
      legalName: z.string().min(1, 'Legal business name is required'),
      displayName: z.string().optional().or(z.literal('')),
      ein: z
        .string()
        .optional()
        .refine((v) => !v || EIN_PATTERN.test(v), 'EIN must look like 12-3456789')
        .refine(
          (v) => !v || isValidEinStructure(v),
          'That EIN is not a valid IRS-issued number',
        ),
      licenseNumber: z.string().optional().or(z.literal('')),
      licenseType: z.string().optional().or(z.literal('')),
      website: z
        .string()
        .optional()
        .refine((v) => !v || z.url().safeParse(v).success, 'Enter a valid URL'),
      domain: z
        .string()
        .optional()
        .refine(
          (v) => !v || DOMAIN_PATTERN.test(v),
          'Enter a valid domain, e.g. acme or portal.acme.com',
        ),
      email: z.email('Enter a valid email').optional().or(z.literal('')),
      phone: z.string().optional().or(z.literal('')),
      address: z.object({
        line1: z.string().optional().or(z.literal('')),
        line2: z.string().optional().or(z.literal('')),
        city: z.string().optional().or(z.literal('')),
        state: z.string().optional().or(z.literal('')),
        postalCode: z.string().optional().or(z.literal('')),
        country: z.string().optional().or(z.literal('')),
      }),
    }),
    owner: z.object({
      firstName: z.string().min(1, "Owner's first name is required"),
      lastName: z.string().min(1, "Owner's last name is required"),
      email: z.email('Enter a valid email').trim(),
      phone: z.string().optional().or(z.literal('')),
      ssn: z
        .string()
        .optional()
        .refine((v) => !v || SSN_PATTERN.test(v), 'SSN must look like 123-45-6789')
        .refine(
          (v) => !v || isValidSsnStructure(v),
          'That SSN is not a valid Social Security number',
        ),
    }),
  })
  .superRefine((data, ctx) => {
    if (!data.firm.ein && !data.owner.ssn) {
      ctx.addIssue({
        code: 'custom',
        message:
          'Provide at least the firm EIN or the owner SSN to uniquely identify this firm',
        path: ['firm', 'ein'],
      });
    }
    validateUsAddress(data.firm.address, ctx, ['firm', 'address']);
  });

export type OnboardFirmInput = z.infer<typeof onboardFirmSchema>;
