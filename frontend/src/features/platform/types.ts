export type FirmStatus =
  | 'TRIAL'
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'SUSPENDED'
  | 'CANCELLED';

export interface FirmRecord {
  id: string;
  name: string;
  legalName: string | null;
  slug: string;
  einLast4: string | null;
  ownerSsnLast4: string | null;
  licenseNumber: string | null;
  licenseType: string | null;
  website: string | null;
  domain: string | null;
  email: string | null;
  phone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string;
  status: FirmStatus;
  createdAt: string;
  updatedAt: string;
  _count?: { members: number; clients: number };
}

export const FIRM_STATUS_LABELS: Record<FirmStatus, string> = {
  TRIAL: 'Trial',
  ACTIVE: 'Active',
  PAST_DUE: 'Past due',
  SUSPENDED: 'Suspended',
  CANCELLED: 'Cancelled',
};
