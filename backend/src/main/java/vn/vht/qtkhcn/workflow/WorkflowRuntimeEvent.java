package vn.vht.qtkhcn.workflow;

import java.time.OffsetDateTime;
import java.util.Map;

public record WorkflowRuntimeEvent(
        String sourceKey,
        EventType eventType,
        OffsetDateTime occurredAt,
        Map<String, Object> payload) {
    public enum EventType {
        TASK_CREATED, TASK_COMPLETED, TASK_ACTION_APPLIED,
        PROCESS_COMPLETED, PROCESS_REJECTED, PROCESS_CANCELLED, INCIDENT_CREATED
    }
}
