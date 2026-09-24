import prisma from '@/client';
import config from '@/config/config';
import logger from '@/config/logger';

/**
 * Client emails are sent by GoHighLevel workflows, not by this app. For each
 * event we POST the event name plus all the data the workflow needs to an
 * "Inbound Webhook" trigger URL (one URL per event, from env). The workflow then
 * finds the contact and sends the email.
 */
export type CrmWebhookEvent =
  | 'client.onboarding_invite'
  | 'client.onboarded'
  | 'client.login_otp';

const WEBHOOK_URLS: Record<CrmWebhookEvent, string | undefined> = {
  'client.onboarding_invite': config.ghl.webhooks.onboardingInvite,
  'client.onboarded': config.ghl.webhooks.clientOnboarded,
  'client.login_otp': config.ghl.webhooks.clientLoginOtp,
};

const TIMEOUT_MS = 10_000;

/**
 * Never throws: a CRM outage must not break onboarding or login. Failures are
 * logged. The payload may hold a login code, so it is only logged in development.
 */
export const postCrmWebhook = async (
  event: CrmWebhookEvent,
  payload: Record<string, unknown>
): Promise<void> => {
  const url = WEBHOOK_URLS[event];
  const body = { event, sentAt: new Date().toISOString(), ...payload };

  if (config.env === 'development') {
    logger.debug(`CRM webhook ${event} payload: ${JSON.stringify(body)}`);
  }
  if (!url) {
    logger.warn(`CRM webhook ${event} skipped: no URL configured`);
    return;
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      logger.warn(`CRM webhook ${event} returned ${res.status}`);
      return;
    }
    logger.info(`CRM webhook ${event} delivered`);
  } catch (error) {
    logger.warn(`CRM webhook ${event} failed: ${(error as Error).message}`);
  }
};

export interface ClientWebhookContext {
  firm: { id: string; name: string; ghlLocationId: string | null };
  client: {
    id: string;
    type: string;
    status: string;
    displayName: string;
    email: string | null;
    phone: string | null;
    ghlContactId: string | null;
  };
}

/** The GoHighLevel contact id stored on a client, when it came from (or was pushed to) GHL. */
export const ghlContactIdOf = (metadata: unknown): string | null => {
  const value = (metadata as { ghlContactId?: unknown } | null)?.ghlContactId;
  return typeof value === 'string' && value ? value : null;
};

/** Firm + client identifiers every client event carries. */
export const loadClientWebhookContext = async (
  clientId: string
): Promise<ClientWebhookContext> => {
  const client = await prisma.client.findUniqueOrThrow({
    where: { id: clientId },
    select: {
      id: true,
      type: true,
      status: true,
      displayName: true,
      email: true,
      phone: true,
      metadata: true,
      firm: { select: { id: true, name: true, ghlLocationId: true } },
    },
  });

  return {
    firm: client.firm,
    client: {
      id: client.id,
      type: client.type,
      status: client.status,
      displayName: client.displayName,
      email: client.email,
      phone: client.phone,
      ghlContactId: ghlContactIdOf(client.metadata),
    },
  };
};
