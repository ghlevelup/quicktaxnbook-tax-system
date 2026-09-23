import { z } from 'zod';

export const createClientSchema = z.object({
  displayName: z.string().min(1, 'Name is required'),
  type: z.enum(['INDIVIDUAL', 'BUSINESS', 'TRUST_ESTATE', 'NONPROFIT']),
  email: z.email('Enter a valid email').trim().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
});
export type CreateClientInput = z.infer<typeof createClientSchema>;
