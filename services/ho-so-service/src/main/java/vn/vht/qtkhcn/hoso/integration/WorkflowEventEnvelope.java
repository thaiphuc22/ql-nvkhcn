package vn.vht.qtkhcn.hoso.integration;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

public record WorkflowEventEnvelope(
        @NotNull UUID eventId,
        @NotNull EventType eventType,
        @NotNull OffsetDateTime occurredAt,
        @NotBlank String correlationId,
        @NotBlank String hoSoId,
        @NotBlank String processInstanceId,
        @NotNull Map<String, Object> payload) {
    public enum EventType {
        TASK_CREATED, TASK_COMPLETED, TASK_ACTION_APPLIED,
        PROCESS_COMPLETED, PROCESS_REJECTED, PROCESS_CANCELLED, INCIDENT_CREATED
    }
}
