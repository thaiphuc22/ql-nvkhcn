package vn.vht.qtkhcn.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.time.OffsetDateTime;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.FormBundleResponse;

public final class TaskActionDtos {
    private TaskActionDtos() {}

    public record AvailableActionResponse(
            String actionCode,
            String label,
            String icon,
            String uiGroup,
            String tone,
            int displayOrder,
            String helpText,
            boolean requiresReason,
            boolean requiresEvidence,
            boolean requiresConfirm,
            String formKey,
            String policyId,
            long policyVersion,
            FormBundleResponse formBundle) {
        public AvailableActionResponse(String actionCode, String label, String icon, String uiGroup, String tone,
                int displayOrder, String helpText, boolean requiresReason, boolean requiresEvidence,
                boolean requiresConfirm, String formKey, String policyId, long policyVersion) {
            this(actionCode, label, icon, uiGroup, tone, displayOrder, helpText, requiresReason, requiresEvidence,
                    requiresConfirm, formKey, policyId, policyVersion, null);
        }
    }

    public record ExecuteActionRequest(
            @NotNull UUID requestId,
            @NotBlank String taskKey,
            @NotBlank String actionCode,
            @NotBlank String expectedPolicyId,
            @NotNull Long expectedPolicyVersion,
            String comment,
            @NotNull Map<String, Object> formData,
            @NotBlank String expectedTaskState) {}

    public record ExecuteActionResponse(
            UUID requestId,
            String taskKey,
            String processInstanceKey,
            String status) {}

    public record SaveFormDraftRequest(
            @NotBlank String actionCode,
            @NotBlank String expectedPolicyId,
            @NotNull Long expectedPolicyVersion,
            @NotBlank String outputNamespace,
            @NotNull Object data) {}

    public record FormSubmissionResponse(
            UUID id, String taskKey, String taskDefinitionKey, String policyId, long bundleVersion,
            String formKey, Long formVersion, String outputNamespace, String actionCode,
            Object data, String status, OffsetDateTime createdAt, OffsetDateTime completedAt) {}

    public record AvailableActionsResponse(
            String taskKey,
            String processInstanceKey,
            String taskDefinitionKey,
            List<AvailableActionResponse> actions) {}
}
