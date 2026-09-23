import { z } from 'zod';

export const clientLoginEmailSchema = z.object({
  email: z.email('Enter a valid email').trim(),
});
export type ClientLoginEmailInput = z.infer<typeof clientLoginEmailSchema>;

export const clientLoginPasswordSchema = z.object({
  password: z.string().min(1, 'Enter your password'),
});
export type ClientLoginPasswordInput = z.infer<
  typeof clientLoginPasswordSchema
>;

export const clientLoginOtpSchema = z.object({
  otp: z.string().length(6, 'Enter the 6-digit code'),
});
export type ClientLoginOtpInput = z.infer<typeof clientLoginOtpSchema>;
