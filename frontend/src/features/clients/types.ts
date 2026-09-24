export type ClientType =
  | 'INDIVIDUAL'
  | 'BUSINESS'
  | 'TRUST_ESTATE'
  | 'NONPROFIT';
export type ClientStatus =
  | 'PROSPECT'
  | 'ONBOARDING'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'ARCHIVED';

export interface ClientRecord {
  id: string;
  firmId: string;
  clientNumber: string | null;
  type: ClientType;
  status: ClientStatus;
  displayName: string;
  email: string | null;
  phone: string | null;
  onboardedAt: string | null;
  createdAt: string;
}

export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  INDIVIDUAL: 'Individual',
  BUSINESS: 'Business',
  TRUST_ESTATE: 'Trust / Estate',
  NONPROFIT: 'Nonprofit',
};

/** Result of mirroring GoHighLevel contacts tagged as clients. */
export interface GhlClientSyncResult {
  tag: string;
  fetched: number;
  created: number;
  updated: number;
  total: number;
  truncated: boolean;
}

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  PROSPECT: 'Prospect',
  ONBOARDING: 'Onboarding',
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  ARCHIVED: 'Archived',
};
