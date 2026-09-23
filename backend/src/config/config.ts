import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.join(process.cwd(), '.env') });

// Define env vars schema
const envVarsSchema = z.object({
  NODE_ENV: z
    .enum(['production', 'development', 'staging', 'test'])
    .refine((value) => value !== undefined, { message: 'NODE_ENV is required' })
    .default('development'),
  APP_INSTANCES: z.coerce.number().default(1),
  PORT: z.coerce.number().default(8080),
  SENTRY_DSN: z.string().optional().describe('sentry dsn'),
  DATABASE_URL: z.string().describe('database connection string'),

  JWT_SECRET: z.string().min(16).describe('JWT secret key'),
  JWT_ACCESS_EXPIRATION_MINUTES: z.coerce
    .number()
    .default(30)
    .describe('minutes after which access tokens expire'),
  JWT_REFRESH_EXPIRATION_DAYS: z.coerce
    .number()
    .default(30)
    .describe('days after which refresh tokens expire'),
  JWT_RESET_PASSWORD_EXPIRATION_MINUTES: z.coerce
    .number()
    .default(30)
    .describe('minutes after which a password reset link expires'),
  JWT_CLIENT_LOGIN_EXPIRATION_MINUTES: z.coerce
    .number()
    .default(10)
    .describe('minutes the client login (password-verified, pending OTP) token is valid'),
  OTP_EXPIRATION_MINUTES: z.coerce.number().default(5).describe('minutes an OTP code is valid'),
  OTP_MAX_ATTEMPTS: z.coerce.number().default(5).describe('max incorrect OTP attempts allowed'),

  // Email — Gmail SMTP by default (FORM_EMAIL doubles as the SMTP auth user and the From address)
  SMTP_HOST: z.string().default('smtp.gmail.com').describe('server that will send the emails'),
  SMTP_PORT: z.coerce.number().default(587).describe('port to connect to the email server'),
  FORM_EMAIL: z.string().email().describe('gmail address used to send emails'),
  GMAIL_APP_PASSWORD: z.string().describe('gmail app password for FORM_EMAIL'),

  SWAGGER_USERNAME: z.string().default('admin').describe('swagger username'),
  SWAGGER_PASSWORD: z.string().default('admin').describe('swagger password'),
  LOGTAIL_SOURCE_TOKEN: z.string().optional().describe('logtail source token for production'),

  APP_NAME: z.string().default('Qicktaxnbook365').describe('product name used in emails/docs'),
  APP_BASE_URL: z
    .string()
    .default('http://localhost:8000')
    .describe('backend base url, used to build local file URLs'),
  CLIENT_PORTAL_URL: z
    .string()
    .default('http://localhost:3000')
    .describe('frontend base url, used to build onboarding/portal links in emails'),

  ENCRYPTION_KEY: z
    .string()
    .length(64, 'ENCRYPTION_KEY must be a 64-char hex string (32 bytes)')
    .describe('AES-256-GCM key (hex) for encrypting SSN/EIN at rest'),
  BLIND_INDEX_PEPPER: z
    .string()
    .min(32, 'BLIND_INDEX_PEPPER must be at least 32 characters')
    .describe('secret pepper for the HMAC blind index used to dedupe firm identity'),

  BLOB_READ_WRITE_TOKEN: z
    .string()
    .optional()
    .describe(
      'Vercel Blob token for file uploads — create a store in the Vercel dashboard. ' +
        'Optional so the app still boots without it; uploads fail with a clear error until it is set.'
    ),

  CORS_ALLOWED_ORIGINS: z
    .string()
    .default('http://localhost:3000,http://localhost:6767')
    .describe('comma-separated list of frontend origins allowed to call this API'),

  PLATFORM_OWNER_EMAIL: z.string().email().describe('seed: platform owner login email'),
  PLATFORM_OWNER_PASSWORD: z.string().min(8).describe('seed: platform owner initial password'),
  PLATFORM_OWNER_FIRST_NAME: z.string().default('Platform'),
  PLATFORM_OWNER_LAST_NAME: z.string().default('Owner'),
});

// Validate env vars
const envVars = envVarsSchema.safeParse(process.env);

if (!envVars.success) {
  throw new Error(`Config validation error: ${envVars.error.message}`);
}

export default {
  env: envVars.data.NODE_ENV,
  appName: envVars.data.APP_NAME,
  appBaseUrl: envVars.data.APP_BASE_URL,
  clientPortalUrl: envVars.data.CLIENT_PORTAL_URL,
  appInstances: envVars.data.APP_INSTANCES,
  sentryDsn: envVars.data.SENTRY_DSN,
  port: envVars.data.PORT,
  databaseUrl: envVars.data.DATABASE_URL,
  jwt: {
    secret: envVars.data.JWT_SECRET,
    accessExpirationMinutes: envVars.data.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.data.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.data.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    clientLoginExpirationMinutes: envVars.data.JWT_CLIENT_LOGIN_EXPIRATION_MINUTES,
  },
  otp: {
    expirationMinutes: envVars.data.OTP_EXPIRATION_MINUTES,
    maxAttempts: envVars.data.OTP_MAX_ATTEMPTS,
  },
  email: {
    smtp: {
      host: envVars.data.SMTP_HOST,
      port: envVars.data.SMTP_PORT,
      secure: false,
      auth: {
        user: envVars.data.FORM_EMAIL,
        pass: envVars.data.GMAIL_APP_PASSWORD,
      },
    },
    from: `${envVars.data.APP_NAME} <${envVars.data.FORM_EMAIL}>`,
  },
  swagger: {
    username: envVars.data.SWAGGER_USERNAME,
    password: envVars.data.SWAGGER_PASSWORD,
  },
  logtailSourceToken: envVars.data.LOGTAIL_SOURCE_TOKEN,
  security: {
    encryptionKey: envVars.data.ENCRYPTION_KEY,
    blindIndexPepper: envVars.data.BLIND_INDEX_PEPPER,
  },
  storage: {
    blobToken: envVars.data.BLOB_READ_WRITE_TOKEN,
  },
  corsAllowedOrigins: envVars.data.CORS_ALLOWED_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  platformOwner: {
    email: envVars.data.PLATFORM_OWNER_EMAIL,
    password: envVars.data.PLATFORM_OWNER_PASSWORD,
    firstName: envVars.data.PLATFORM_OWNER_FIRST_NAME,
    lastName: envVars.data.PLATFORM_OWNER_LAST_NAME,
  },
};
