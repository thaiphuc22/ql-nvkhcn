package vn.vht.qtkhcn.integration;

import java.util.Map;
import java.util.UUID;
import vn.vht.qtkhcn.workflow.WorkflowRuntimeEvent;

public record WorkflowEventEnvelope(
        UUID eventId,
        WorkflowRuntimeEvent.EventType eventType,
        String occurredAt,
        String correlationId,
        String hoSoId,
        String processInstanceId,
        Map<String, Object> payload) {
}
