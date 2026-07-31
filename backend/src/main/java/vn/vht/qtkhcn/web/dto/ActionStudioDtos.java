package vn.vht.qtkhcn.web.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

public final class ActionStudioDtos {
    private ActionStudioDtos() {
    }

    public record ConfigResponse(List<ActionResponse> definitions,
            List<PresentationResponse> presentations,
            List<AvailabilityResponse> availabilityPolicies,
            List<ExceptionResponse> exceptionPolicies,
            List<ProcessRoutingResponse> processes,
            ReferenceDataResponse referenceData) {
    }

    public record ReferenceDataResponse(List<CatalogOptionResponse> surfaces,
            List<CatalogOptionResponse> statuses,
            List<CatalogOptionResponse> roles,
            List<CatalogOptionResponse> permissions,
            List<CatalogOptionResponse> forms) {
    }

    public record CatalogOptionResponse(String value, String label) {
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

    public record AvailabilityRequest(
            @NotBlank @Size(max = 128) @Pattern(regexp = "[A-Za-z0-9._-]+") String id,
            @NotBlank @Size(max = 64) String actionCode,
            @Size(max = 32) String surface,
            @Size(max = 64) String processCode,
            @Size(max = 128) String taskDefinitionKey,
            @Size(max = 32) String dossierStatus,
            @NotNull List<@NotBlank @Size(max = 64) String> allowedRoleCodes,
            @Size(max = 128) String formKey,
            @Size(max = 1000) String conditionExpression,
            @Min(0) int displayOrder, @NotBlank String lifecycleStatus,
            Integer processVersion, String displayLabel, String displayIcon, String uiGroup, String tone,
            String helpText, FormBundleRequest formBundle) {
        public AvailabilityRequest(String id, String actionCode, String surface, String processCode,
                String taskDefinitionKey, String dossierStatus, List<String> allowedRoleCodes, String formKey,
                String conditionExpression, int displayOrder, String lifecycleStatus) {
            this(id, actionCode, surface, processCode, taskDefinitionKey, dossierStatus, allowedRoleCodes, formKey,
                    conditionExpression, displayOrder, lifecycleStatus, null, null, null, null, null, null, null);
        }
    }

    public record AvailabilityResponse(String id, String actionCode, String surface, String processCode,
            String taskDefinitionKey, String dossierStatus, List<String> allowedRoleCodes,
            String formKey, String conditionExpression, int displayOrder, String lifecycleStatus,
            long version, String updatedBy, OffsetDateTime updatedAt, Integer processVersion,
            String displayLabel, String displayIcon, String uiGroup, String tone, String helpText,
            FormBundleResponse formBundle) {
    }

    public record BulkDeleteAvailabilityRequest(@NotEmpty List<@NotNull BulkDeleteAvailabilityItem> items) {}
    public record BulkDeleteAvailabilityItem(@NotBlank String id, @Min(0) long version) {}
    public record BulkDeleteAvailabilityResponse(int deletedCount, List<String> deletedIds) {}
    public record BulkStatusAvailabilityRequest(boolean enabled,
            @NotEmpty List<@NotNull BulkDeleteAvailabilityItem> items) {}
    public record BulkStatusAvailabilityResponse(int updatedCount, List<AvailabilityResponse> updatedPolicies) {}

    public record FormBundleRequest(String displayMode, boolean allowDraft, String completionPolicy,
            Long version, @NotNull List<FormBundleItemRequest> items) {}
    public record FormBundleItemRequest(@NotBlank String formKey, Long formVersion, @Min(0) int displayOrder,
            String displayTitle, boolean required, @NotBlank String mode, boolean skippable,
            String conditionExpression, @NotBlank String outputNamespace) {}
    public record FormBundleResponse(String displayMode, boolean allowDraft, String completionPolicy,
            Long version, List<FormBundleItemResponse> items) {}
    public record FormBundleItemResponse(String formKey, Long formVersion, int displayOrder, String displayTitle,
            boolean required, String mode, boolean skippable, String conditionExpression, String outputNamespace) {}

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

    public record ProcessRoutingResponse(String code, String name, List<ProcessStepResponse> steps, Integer processVersion) {
        public ProcessRoutingResponse(String code, String name, List<ProcessStepResponse> steps) {
            this(code, name, steps, null);
        }
    }

    public record ProcessStepResponse(String key, String name, String role, String formKey,
            List<RouteBranchResponse> branches) {
    }

    /**
     * @param variable tên biến Zeebe mà nhánh này rẽ theo, đọc từ conditionExpression
     *                 ({@code = ketQuaThamDinh = "dong_y"} → {@code ketQuaThamDinh}). {@code null} khi
     *                 nhánh không phải dạng "biến = chuỗi" — khi đó hệ thống KHÔNG suy ra biến điều
     *                 khiển cho nhánh đó thay vì đoán bừa.
     */
    public record RouteBranchResponse(String outcome, String label, String target, String kind,
            String variable) {
    }

    public record SimulationRequest(@NotBlank String surface, @NotBlank String processCode,
            @NotBlank String taskDefinitionKey, @NotBlank String dossierStatus,
            @NotNull List<@NotBlank String> roleCodes,
            @NotNull List<@NotBlank String> permissions, boolean isAdmin, Integer processVersion,
            Map<String, Object> businessContext) {
        public SimulationRequest(String surface, String processCode, String taskDefinitionKey, String dossierStatus,
                List<String> roleCodes, List<String> permissions, boolean isAdmin) {
            this(surface, processCode, taskDefinitionKey, dossierStatus, roleCodes, permissions, isAdmin, null, Map.of());
        }
    }

    public record SimulatedActionResponse(String actionCode, String actionName, String actionType,
            String outcome, boolean requiresReason, boolean requiresEvidence, boolean requiresConfirm,
            boolean active, String label, String icon, String uiGroup, String tone, int order,
            String helpText, boolean visible, boolean enabled, String policyId, List<String> reasons,
            String formKey, Long policyVersion, FormBundleResponse formBundle) {
        public SimulatedActionResponse(String actionCode, String actionName, String actionType, String outcome,
                boolean requiresReason, boolean requiresEvidence, boolean requiresConfirm, boolean active,
                String label, String icon, String uiGroup, String tone, int order, String helpText, boolean visible,
                boolean enabled, String policyId, List<String> reasons, String formKey, Long policyVersion) {
            this(actionCode, actionName, actionType, outcome, requiresReason, requiresEvidence, requiresConfirm,
                    active, label, icon, uiGroup, tone, order, helpText, visible, enabled, policyId, reasons,
                    formKey, policyVersion, null);
        }
    }

    public record ReconcileResponse(String processCode, String stepKey, String stepName, String outcome,
            String actionCode, String status, String policyId, String reason) {
    }

    public record ScaffoldResponse(int createdCount, List<AvailabilityResponse> createdPolicies,
            List<ReconcileResponse> rows) {
    }

    public record AuditResponse(String entityType, String entityId, String action, String actor,
            OffsetDateTime eventAt, String detail) {
    }
}
