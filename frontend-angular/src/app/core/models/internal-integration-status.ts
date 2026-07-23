export interface InternalOutboxEventSummary {
  id: string;
  hoSoId: string;
  eventType: string;
  createdAt: string;
  sentAt: string;
}

export interface InternalInboxEventSummary {
  eventId: string;
  eventType: string;
  hoSoId: string;
  processInstanceId: string;
  occurredAt: string;
  receivedAt: string;
}

export interface StartFailedDossier {
  hoSoId: string;
  reason: string;
}

export interface InternalIntegrationStatus {
  outboxPending: number;
  outboxFailed: number;
  latestSent: InternalOutboxEventSummary | null;
  latestInboxByType: InternalInboxEventSummary[];
  startFailedDossiers: StartFailedDossier[];
}
