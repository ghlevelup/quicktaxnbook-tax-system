import { z } from 'zod';

export const password = z
  .string()
  .min(8, 'password must be at least 8 characters')
  .refine(
    (value) => value.match(/\d/) && value.match(/[a-zA-Z]/),
    'Password must contain at least 1 letter and 1 number'
  );

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

export const refreshTokensSchema = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});

export const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});

export const clientLoginStartSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const clientLoginPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

export const clientLoginVerifyOtpSchema = z.object({
  body: z.object({
    loginToken: z.string(),
    otp: z.string().length(6),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    resetToken: z.string(),
    otp: z.string().length(6),
    password,
  }),
});
