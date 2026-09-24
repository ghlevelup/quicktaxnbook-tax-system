/** Client-facing status buckets. Mirrors the backend `ClientDocStage` enum. */
export type ClientDocStage =
  | 'REQUESTED'
  | 'RECEIVED'
  | 'IN_PROGRESS'
  | 'READY_FOR_REVIEW'
  | 'AWAITING_SIGNATURE'
  | 'AWAITING_PAYMENT'
  | 'COMPLETED';

export const CLIENT_STAGE_LABELS: Record<ClientDocStage, string> = {
  REQUESTED: 'Requested',
  RECEIVED: 'Received',
  IN_PROGRESS: 'Preparing',
  READY_FOR_REVIEW: 'Ready for your review',
  AWAITING_SIGNATURE: 'Awaiting e-signature',
  AWAITING_PAYMENT: 'Awaiting payment',
  COMPLETED: 'Completed',
};

export const CLIENT_STAGE_ORDER: ClientDocStage[] = [
  'REQUESTED',
  'RECEIVED',
  'IN_PROGRESS',
  'READY_FOR_REVIEW',
  'AWAITING_SIGNATURE',
  'AWAITING_PAYMENT',
  'COMPLETED',
];

/** Badge styling per bucket. Tailwind classes, light + dark. */
export const CLIENT_STAGE_STYLES: Record<ClientDocStage, string> = {
  REQUESTED:
    'bg-muted text-muted-foreground border-border',
  RECEIVED:
    'bg-blue-500/10 text-blue-700 border-blue-500/30 dark:text-blue-300',
  IN_PROGRESS:
    'bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-300',
  READY_FOR_REVIEW:
    'bg-violet-500/10 text-violet-700 border-violet-500/30 dark:text-violet-300',
  AWAITING_SIGNATURE:
    'bg-orange-500/10 text-orange-700 border-orange-500/30 dark:text-orange-300',
  AWAITING_PAYMENT:
    'bg-pink-500/10 text-pink-700 border-pink-500/30 dark:text-pink-300',
  COMPLETED:
    'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-300',
};

export interface OpportunityStage {
  id: string;
  name: string;
  position: number;
  clientStage: ClientDocStage;
  /** Client-friendly label for `clientStage`, resolved by the backend. */
  clientLabel: string;
}

export interface OpportunityPipelineRef {
  id: string;
  name: string;
  ghlPipelineId: string;
  isDocumentPipeline: boolean;
}

export interface Opportunity {
  id: string;
  ghlOpportunityId: string;
  name: string;
  status: string;
  clientId: string | null;
  ghlContactId: string | null;
  pipeline: OpportunityPipelineRef;
  stage: OpportunityStage | null;
  createdAt: string | null;
  updatedAt: string | null;
  lastSyncedAt: string;
}

export interface PipelineWithStages {
  id: string;
  ghlPipelineId: string;
  name: string;
  isDocumentPipeline: boolean;
  lastSyncedAt: string;
  stages: Array<{
    id: string;
    ghlStageId: string;
    name: string;
    position: number;
    clientStage: ClientDocStage;
  }>;
}

/** Sync metadata the UI shows so users can tell fresh data from cached. */
export interface SyncInfo {
  ranAt: string;
  synced: boolean;
  /** True when GoHighLevel was unreachable and these rows came from cache. */
  degraded: boolean;
  message?: string;
}

export interface OpportunityListResult {
  results: Opportunity[];
  sync: SyncInfo;
}
