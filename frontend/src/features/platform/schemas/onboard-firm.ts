import { z } from 'zod';

const einPattern = /^\d{2}-?\d{7}$/;
const ssnPattern = /^\d{3}-?\d{2}-?\d{4}$/;

export const onboardFirmSchema = z
  .object({
    firm: z.object({
      legalName: z.string().min(1, 'Legal business name is required'),
      displayName: z.string().optional().or(z.literal('')),
      ein: z
        .string()
        .optional()
        .refine(
          (v) => !v || einPattern.test(v),
          'EIN must look like 12-3456789',
        ),
      licenseNumber: z.string().optional().or(z.literal('')),
      licenseType: z.string().optional().or(z.literal('')),
      website: z
        .string()
        .optional()
        .refine((v) => !v || z.url().safeParse(v).success, 'Enter a valid URL'),
      domain: z.string().optional().or(z.literal('')),
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
        .refine(
          (v) => !v || ssnPattern.test(v),
          'SSN must look like 123-45-6789',
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
  });

export type OnboardFirmInput = z.infer<typeof onboardFirmSchema>;
