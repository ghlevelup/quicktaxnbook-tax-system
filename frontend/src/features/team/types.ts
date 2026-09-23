export type StaffType =
  | 'PREPARER'
  | 'REVIEWER'
  | 'SUPPORT'
  | 'MANAGER'
  | 'OWNER';
export type MemberStatus = 'INVITED' | 'ACTIVE' | 'DEACTIVATED';

export interface TeamMember {
  id: string;
  staffType: StaffType;
  title: string | null;
  status: MemberStatus;
  isOwner: boolean;
  joinedAt: string | null;
  deactivatedAt: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    firstName: string | null;
    lastName: string | null;
    status: string;
    lastLoginAt: string | null;
  };
}

export const STAFF_TYPE_LABELS: Record<StaffType, string> = {
  PREPARER: 'Preparer',
  REVIEWER: 'Reviewer',
  SUPPORT: 'Support',
  MANAGER: 'Manager',
  OWNER: 'Owner',
};
