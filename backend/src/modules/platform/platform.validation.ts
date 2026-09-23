import { z } from 'zod';

const einPattern = /^\d{2}-?\d{7}$/;
const ssnPattern = /^\d{3}-?\d{2}-?\d{4}$/;

export const onboardFirmSchema = z.object({
  body: z
    .object({
      firm: z.object({
        legalName: z.string().min(1, 'Legal business name is required'),
        displayName: z.string().min(1).optional(),
        ein: z.string().regex(einPattern, 'EIN must look like 12-3456789').optional(),
        licenseNumber: z.string().optional(),
        licenseType: z.string().optional(),
        website: z.string().url().optional(),
        domain: z.string().optional(),
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
        ssn: z.string().regex(ssnPattern, 'SSN must look like 123-45-6789').optional(),
      }),
    })
    .superRefine((data, ctx) => {
      if (!data.firm.ein && !data.owner.ssn) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Provide at least the firm EIN or the owner SSN — one is required to uniquely identify this firm',
          path: ['firm', 'ein'],
        });
      }
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
