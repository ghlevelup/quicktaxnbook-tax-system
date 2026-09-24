import { z } from 'zod';

const staffTypeEnum = z.enum(['PREPARER', 'REVIEWER', 'SUPPORT', 'MANAGER', 'OWNER']);
const memberStatusEnum = z.enum(['ACTIVE', 'DEACTIVATED']);

export const createTeamMemberSchema = z.object({
  body: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    // Owner/Manager can't be picked when adding a member, so nobody is created
    // with admin-level standing (in GoHighLevel they are always a plain user).
    staffType: z.enum(['PREPARER', 'REVIEWER', 'SUPPORT']).default('PREPARER'),
    title: z.string().optional(),
  }),
});

export const memberIdParamSchema = z.object({
  params: z.object({ memberId: z.string() }),
});

export const updateTeamMemberSchema = z.object({
  params: z.object({ memberId: z.string() }),
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phone: z.string().optional(),
    staffType: staffTypeEnum.optional(),
    title: z.string().optional(),
  }),
});

export const updateTeamMemberStatusSchema = z.object({
  params: z.object({ memberId: z.string() }),
  body: z.object({ status: memberStatusEnum }),
});

export const listTeamMembersSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    status: memberStatusEnum.optional(),
  }),
});
