package vn.vht.qtkhcn.web.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import java.util.List;

public final class ActionStudioDtos {
    private ActionStudioDtos() {
    }

    public record ConfigResponse(List<ActionResponse> definitions,
            List<PresentationResponse> presentations,
            List<AvailabilityResponse> availabilityPolicies,
            List<ExceptionResponse> exceptionPolicies,
            List<ProcessRoutingResponse> processes) {
    }

    public record ActionResponse(String actionCode, String actionName, String actionType, String outcome,
            boolean requiresReason, boolean requiresEvidence, boolean requiresConfirm, boolean active,
            long version, String updatedBy, OffsetDateTime updatedAt) {
    }

    public record PresentationResponse(String actionCode, String label, String icon, String uiGroup,
            String tone, int order, String helpText, long version) {
    }

    public record PresentationRequest(@NotBlank String label, @NotBlank String icon,
            @NotBlank String uiGroup, @NotBlank String tone, @Min(0) int order, String helpText) {
    }

    public record StatusRequest(boolean enabled) {
    }

    public record AvailabilityRequest(@NotBlank String id, @NotBlank String actionCode, String surface,
            String processCode, String taskDefinitionKey, String dossierStatus,
            @NotNull List<@NotBlank String> allowedRoleCodes,
            @NotNull List<@NotBlank String> requiredPermissions,
            String formKey, String conditionExpression, @Min(0) int displayOrder, boolean enabled) {
    }

    public record AvailabilityResponse(String id, String actionCode, String surface, String processCode,
            String taskDefinitionKey, String dossierStatus, List<String> allowedRoleCodes,
            List<String> requiredPermissions, String formKey, String conditionExpression,
            int displayOrder, boolean enabled, long version, String updatedBy, OffsetDateTime updatedAt) {
    }

    public record ExceptionRequest(@NotBlank String id, @NotBlank String actionCode,
            @NotBlank String objectType, String processCode, String fromStepKey,
            @NotBlank String targetType, String targetStepKey,
            @NotNull List<@NotBlank String> allowedRoleCodes,
            @NotNull List<@NotBlank String> requiredPermissions,
            boolean requiresApproval, boolean requiresReason, boolean requiresEvidence, boolean enabled) {
    }

    public record ExceptionResponse(String id, String actionCode, String objectType, String processCode,
            String fromStepKey, String targetType, String targetStepKey, List<String> allowedRoleCodes,
            List<String> requiredPermissions, boolean requiresApproval, boolean requiresReason,
            boolean requiresEvidence, boolean enabled, long version, String updatedBy, OffsetDateTime updatedAt) {
    }

    public record ProcessRoutingResponse(String code, String name, List<ProcessStepResponse> steps) {
    }

    public record ProcessStepResponse(String key, String name, String role, List<RouteBranchResponse> branches) {
    }

    public record RouteBranchResponse(String outcome, String label, String target, String kind) {
    }

    public record SimulationRequest(@NotBlank String surface, @NotBlank String processCode,
            @NotBlank String taskDefinitionKey, @NotBlank String dossierStatus,
            @NotNull List<@NotBlank String> roleCodes,
            @NotNull List<@NotBlank String> permissions, boolean isAdmin) {
    }

    public record SimulatedActionResponse(String actionCode, String actionName, String actionType,
            String outcome, boolean requiresReason, boolean requiresEvidence, boolean requiresConfirm,
            boolean active, String label, String icon, String uiGroup, String tone, int order,
            String helpText, boolean visible, boolean enabled, String policyId, List<String> reasons,
            String formKey) {
    }

    public record ReconcileResponse(String processCode, String stepKey, String stepName, String outcome,
            String actionCode, String status, String policyId, String reason) {
    }

    public record ScaffoldResponse(int createdCount, List<AvailabilityResponse> createdPolicies,
            List<ReconcileResponse> rows) {
    }
}
