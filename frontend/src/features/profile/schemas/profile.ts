import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .optional()
    .or(z.literal('')),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .optional()
    .or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .refine(
        (value) => /\d/.test(value) && /[a-zA-Z]/.test(value),
        'Password must contain at least 1 letter and 1 number',
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
