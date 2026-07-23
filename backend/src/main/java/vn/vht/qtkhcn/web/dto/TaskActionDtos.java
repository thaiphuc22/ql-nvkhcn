package vn.vht.qtkhcn.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public final class TaskActionDtos {
    private TaskActionDtos() {}

    public record AvailableActionResponse(
            String actionCode,
            String label,
            String tone,
            boolean requiresReason,
            boolean requiresEvidence,
            boolean requiresConfirm,
            String formKey) {}

    public record ExecuteActionRequest(
            @NotNull UUID requestId,
            @NotBlank String taskKey,
            @NotBlank String actionCode,
            String comment,
            @NotNull Map<String, Object> formData,
            @NotBlank String expectedTaskState) {}

    public record ExecuteActionResponse(
            UUID requestId,
            String taskKey,
            String processInstanceKey,
            String status) {}

    public record AvailableActionsResponse(
            String taskKey,
            String processInstanceKey,
            String taskDefinitionKey,
            List<AvailableActionResponse> actions) {}
}
