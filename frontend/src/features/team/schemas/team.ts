import { z } from 'zod';

const staffTypeEnum = z.enum([
  'PREPARER',
  'REVIEWER',
  'SUPPORT',
  'MANAGER',
  'OWNER',
]);

export const createTeamMemberSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.email('Enter a valid email').trim(),
  phone: z.string().optional().or(z.literal('')),
  staffType: staffTypeEnum,
  title: z.string().optional().or(z.literal('')),
});
export type CreateTeamMemberInput = z.infer<typeof createTeamMemberSchema>;
