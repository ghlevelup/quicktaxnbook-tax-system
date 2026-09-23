import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  email: z.email('Enter a valid email').trim(),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .refine(
        (value) => /\d/.test(value) && /[a-zA-Z]/.test(value),
        'Password must contain at least 1 letter and 1 number',
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
