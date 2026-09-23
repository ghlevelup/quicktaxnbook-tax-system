import { z } from 'zod';

export const completeOnboardingSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.email('Enter a valid email').trim(),
  phone: z.string().min(7, 'Enter a valid phone number'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .refine(
      (value) => /\d/.test(value) && /[a-zA-Z]/.test(value),
      'Password must contain at least 1 letter and 1 number',
    ),
});
export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>;
