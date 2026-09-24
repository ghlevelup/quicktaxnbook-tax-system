import { z } from 'zod';

/**
 * GoHighLevel location ids are opaque 20-char alphanumeric strings. We only
 * assert a sane minimum length here; whether the id is real is decided by the
 * live agency pre-check, never by shape.
 */
const locationId = z.string().trim().min(10, 'A GoHighLevel location id is required');

export const firmLocationParamSchema = z.object({
  params: z.object({ locationId }),
});

export const connectFirmSchema = z.object({
  body: z.object({
    locationId,
    privateToken: z.string().trim().min(20, 'Paste the full GoHighLevel sub-account token'),
  }),
});

export const enterFirmSchema = z.object({
  body: z.object({ locationId }),
});

export const enterTeamSchema = z.object({
  body: z.object({
    locationId,
    userId: z.string().trim().min(5, 'A GoHighLevel user id is required'),
  }),
});

export const linkFirmLocationSchema = z.object({
  body: z.object({
    firmId: z.string().min(1, 'A firm id is required'),
    locationId,
  }),
});
