export type AccountRole =
  | 'PLATFORM_OWNER'
  | 'FIRM_ADMIN'
  | 'FIRM_TEAM'
  | 'FIRM_CLIENT';

export interface FirmSummary {
  id: string;
  name: string;
  slug: string;
  status: string;
}

export interface FirmMembership {
  id: string;
  staffType: string;
  title: string | null;
  status: string;
  isOwner: boolean;
  firm: FirmSummary;
}

export interface ClientSummary {
  id: string;
  displayName: string;
  type: string;
  status: string;
}

export interface ClientAccessSummary {
  id: string;
  accessLevel: string;
  isPrimary: boolean;
  client: ClientSummary;
}

export interface CurrentUser {
  id: string;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  accountRole: AccountRole;
  status: string;
  locale: string | null;
  timezone: string | null;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  avatarUrl: string | null;
  canChangePassword: boolean;
  membership: FirmMembership | null;
  clients: ClientAccessSummary[] | null;
}

export const ROLE_LABELS: Record<AccountRole, string> = {
  PLATFORM_OWNER: 'Platform Owner',
  FIRM_ADMIN: 'Firm Admin',
  FIRM_TEAM: 'Team Member',
  FIRM_CLIENT: 'Client',
};
