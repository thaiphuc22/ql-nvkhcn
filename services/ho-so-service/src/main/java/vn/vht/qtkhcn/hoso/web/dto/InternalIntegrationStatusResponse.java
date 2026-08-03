package vn.vht.qtkhcn.hoso.web.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record InternalIntegrationStatusResponse(
        long outboxPending,
        long outboxFailed,
        OutboxEventSummary latestSent,
        List<InboxEventSummary> latestInboxByType,
        List<StartFailedDossier> startFailedDossiers) {

    public record OutboxEventSummary(
            UUID id,
            String hoSoId,
            String eventType,
            OffsetDateTime createdAt,
            OffsetDateTime sentAt) {}

    public record InboxEventSummary(
            UUID eventId,
            String eventType,
            String hoSoId,
            String processInstanceId,
            OffsetDateTime occurredAt,
            OffsetDateTime receivedAt) {}

    public record StartFailedDossier(String hoSoId, String reason) {}
}
