package vn.vht.qtkhcn.web.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import vn.vht.qtkhcn.domain.BpmnTestStatus;

public record BpmnTestSessionResponse(
        UUID id, UUID draftId, long draftRevision, String correlationId, String actor,
        BpmnTestStatus status, Long processDefinitionKey, Long processInstanceKey,
        OffsetDateTime createdAt, OffsetDateTime expiresAt, OffsetDateTime endedAt,
        String failureMessage, List<Element> currentElements, List<Task> tasks,
        Map<String, Object> variables, List<Incident> incidents, List<BlockedJob> blockedJobs) {
    public record Element(long key, String elementId, String name, String type, String state) {}
    public record Task(long key, String elementId, String name, String state, List<String> candidateGroups) {}
    public record Incident(long key, String elementId, String type, String message, String state) {}
    public record BlockedJob(long key, String elementId, String type, String explanation) {}
}
