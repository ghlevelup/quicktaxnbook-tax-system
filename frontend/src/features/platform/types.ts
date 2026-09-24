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

export type GhlIntegrationStatus =
  | 'CONNECTED'
  | 'DISCONNECTED'
  | 'ERROR'
  | 'PENDING';

/** Agency-scope GoHighLevel connection (the `/platform` connect flow). */
export interface GhlAgencyConnectionRecord {
  id: string;
  companyId: string | null;
  companyName: string | null;
  relationshipNumber: string | null;
  status: GhlIntegrationStatus;
  lastVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** A GoHighLevel sub-account (formerly "location"). */
export interface GhlLocationSummary {
  locationId: string;
  name: string | null;
  companyId: string | null;
  email: string | null;
  phone: string | null;
}

export interface GhlAgencyLocationList {
  locations: GhlLocationSummary[];
  page: number;
  limit: number;
  hasMore: boolean;
}

/** The agency connection, or `connection: null` when the connect popup should show. */
export interface GhlAgencyState {
  connection: GhlAgencyConnectionRecord | null;
  /** The agency we knew before its token was rejected, to prefill the popup. */
  previous?: {
    companyName: string | null;
    relationshipNumber: string | null;
  } | null;
}

export interface ConnectAgencyResult {
  connection: GhlAgencyConnectionRecord | null;
  /** What GoHighLevel reported back, so the UI can confirm which agency connected. */
  verification: {
    companyId: string | null;
    companyName: string | null;
    sampleLocation: GhlLocationSummary | null;
  };
}
