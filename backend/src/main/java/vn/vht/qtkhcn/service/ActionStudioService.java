package vn.vht.qtkhcn.service;

import jakarta.persistence.EntityNotFoundException;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vht.qtkhcn.domain.ActionAvailabilityPolicy;
import vn.vht.qtkhcn.domain.ActionExceptionPolicy;
import vn.vht.qtkhcn.domain.ActionStudioAction;
import vn.vht.qtkhcn.domain.ActionStudioAudit;
import vn.vht.qtkhcn.repository.ActionAvailabilityPolicyRepository;
import vn.vht.qtkhcn.repository.ActionExceptionPolicyRepository;
import vn.vht.qtkhcn.repository.ActionStudioActionRepository;
import vn.vht.qtkhcn.repository.ActionStudioAuditRepository;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.ActionResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.AvailabilityRequest;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.AvailabilityResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.ConfigResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.ExceptionRequest;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.ExceptionResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.PresentationRequest;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.PresentationResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.ReconcileResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.ScaffoldResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.SimulatedActionResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.SimulationRequest;

@Service
public class ActionStudioService {
    private static final Set<String> ACTION_TYPES = Set.of("STANDARD", "SUPPORT", "EXCEPTION");
    private static final Set<String> UI_GROUPS = Set.of("PRIMARY", "MORE", "EXCEPTION");
    private static final Set<String> TONES = Set.of("primary", "default", "danger", "warning");
    private static final Set<String> SURFACES = Set.of("DOSSIER_DETAIL", "WORKLIST", "MOBILE", "ACTION_STUDIO");
    private static final Set<String> STATUSES = Set.of("draft", "processing", "approved", "rejected");
    private static final Set<String> TARGET_TYPES = Set.of("STEP", "STATUS", "COMPLETE");
    private static final Set<String> OBJECT_TYPES = Set.of("DOSSIER", "MISSION", "PROPOSAL");

    private final ActionStudioActionRepository actionRepository;
    private final ActionAvailabilityPolicyRepository availabilityRepository;
    private final ActionExceptionPolicyRepository exceptionRepository;
    private final ActionStudioAuditRepository auditRepository;
    private final ActionStudioRoutingCatalog routingCatalog;

    public ActionStudioService(ActionStudioActionRepository actionRepository,
            ActionAvailabilityPolicyRepository availabilityRepository,
            ActionExceptionPolicyRepository exceptionRepository,
            ActionStudioAuditRepository auditRepository,
            ActionStudioRoutingCatalog routingCatalog) {
        this.actionRepository = actionRepository;
        this.availabilityRepository = availabilityRepository;
        this.exceptionRepository = exceptionRepository;
        this.auditRepository = auditRepository;
        this.routingCatalog = routingCatalog;
    }

    @Transactional(readOnly = true)
    public ConfigResponse load() {
        List<ActionStudioAction> actions = actionRepository.findAllByOrderByDisplayOrderAsc();
        return new ConfigResponse(actions.stream().map(ActionStudioService::toAction).toList(),
                actions.stream().map(ActionStudioService::toPresentation).toList(),
                availabilityRepository.findAllByOrderByDisplayOrderAscIdAsc().stream().map(ActionStudioService::toAvailability).toList(),
                exceptionRepository.findAllByOrderByIdAsc().stream().map(ActionStudioService::toException).toList(),
                routingCatalog.processes());
    }

    @Transactional
    public PresentationResponse updatePresentation(String code, PresentationRequest request, long expectedVersion,
            String actorHeader) {
        ActionStudioAction action = action(code);
        assertVersion(code, expectedVersion, action.getVersion());
        requireOneOf("nhóm hiển thị", request.uiGroup(), UI_GROUPS);
        requireOneOf("tone", request.tone(), TONES);
        action.setLabel(request.label().trim());
        action.setIcon(request.icon().trim());
        action.setUiGroup(request.uiGroup());
        action.setTone(request.tone());
        action.setDisplayOrder(request.order());
        action.setHelpText(blankToNull(request.helpText()));
        touch(action, actorHeader);
        action = actionRepository.saveAndFlush(action);
        audit("ACTION", code, "UPDATE_PRESENTATION", actorHeader, "Cập nhật cách hiển thị nút.");
        return toPresentation(action);
    }

    @Transactional
    public ActionResponse setActionStatus(String code, boolean active, long expectedVersion, String actorHeader) {
        ActionStudioAction action = action(code);
        assertVersion(code, expectedVersion, action.getVersion());
        action.setActive(active);
        touch(action, actorHeader);
        action = actionRepository.saveAndFlush(action);
        audit("ACTION", code, active ? "ACTIVATE" : "DEACTIVATE", actorHeader,
                active ? "Kích hoạt hành động." : "Khóa hành động.");
        return toAction(action);
    }

    @Transactional
    public AvailabilityResponse createAvailability(AvailabilityRequest request, String actorHeader) {
        if (availabilityRepository.existsById(request.id().trim())) {
            throw new ActionStudioConflictException("Mã luật khả dụng đã tồn tại: " + request.id().trim());
        }
        validateAvailability(request);
        ActionAvailabilityPolicy entity = new ActionAvailabilityPolicy();
        apply(entity, request);
        entity.setVersion(0);
        touch(entity, actorHeader);
        entity = availabilityRepository.saveAndFlush(entity);
        audit("AVAILABILITY", entity.getId(), "CREATE", actorHeader, "Tạo luật hiển thị nút.");
        return toAvailability(entity);
    }

    @Transactional
    public AvailabilityResponse updateAvailability(String id, AvailabilityRequest request, long expectedVersion,
            String actorHeader) {
        if (!id.equals(request.id())) {
            throw new IllegalArgumentException("Không được đổi mã luật khả dụng.");
        }
        validateAvailability(request);
        ActionAvailabilityPolicy entity = availability(id);
        assertVersion(id, expectedVersion, entity.getVersion());
        apply(entity, request);
        touch(entity, actorHeader);
        entity = availabilityRepository.saveAndFlush(entity);
        audit("AVAILABILITY", id, "UPDATE", actorHeader, "Cập nhật luật hiển thị nút.");
        return toAvailability(entity);
    }

    @Transactional
    public void deleteAvailability(String id, long expectedVersion, String actorHeader) {
        ActionAvailabilityPolicy entity = availability(id);
        assertVersion(id, expectedVersion, entity.getVersion());
        availabilityRepository.delete(entity);
        availabilityRepository.flush();
        audit("AVAILABILITY", id, "DELETE", actorHeader, "Xóa luật hiển thị nút.");
    }

    @Transactional
    public ExceptionResponse createException(ExceptionRequest request, String actorHeader) {
        if (exceptionRepository.existsById(request.id().trim())) {
            throw new ActionStudioConflictException("Mã chính sách Chi tiết đã tồn tại: " + request.id().trim());
        }
        validateException(request);
        ActionExceptionPolicy entity = new ActionExceptionPolicy();
        apply(entity, request);
        entity.setVersion(0);
        touch(entity, actorHeader);
        entity = exceptionRepository.saveAndFlush(entity);
        audit("EXCEPTION", entity.getId(), "CREATE", actorHeader, "Tạo chính sách Chi tiết.");
        return toException(entity);
    }

    @Transactional
    public ExceptionResponse updateException(String id, ExceptionRequest request, long expectedVersion,
            String actorHeader) {
        if (!id.equals(request.id())) {
            throw new IllegalArgumentException("Không được đổi mã chính sách Chi tiết.");
        }
        validateException(request);
        ActionExceptionPolicy entity = exceptionPolicy(id);
        assertVersion(id, expectedVersion, entity.getVersion());
        apply(entity, request);
        touch(entity, actorHeader);
        entity = exceptionRepository.saveAndFlush(entity);
        audit("EXCEPTION", id, "UPDATE", actorHeader, "Cập nhật chính sách Chi tiết.");
        return toException(entity);
    }

    @Transactional
    public void deleteException(String id, long expectedVersion, String actorHeader) {
        ActionExceptionPolicy entity = exceptionPolicy(id);
        assertVersion(id, expectedVersion, entity.getVersion());
        exceptionRepository.delete(entity);
        exceptionRepository.flush();
        audit("EXCEPTION", id, "DELETE", actorHeader, "Xóa chính sách Chi tiết.");
    }

    @Transactional(readOnly = true)
    public List<SimulatedActionResponse> simulate(SimulationRequest request) {
        requireOneOf("surface", request.surface(), SURFACES);
        requireOneOf("trạng thái hồ sơ", request.dossierStatus(), STATUSES);
        List<ActionAvailabilityPolicy> policies = availabilityRepository.findAllByOrderByDisplayOrderAscIdAsc();
        return actionRepository.findAllByOrderByDisplayOrderAsc().stream()
                .map(action -> simulate(action, policies, request))
                .sorted(Comparator.comparingInt(SimulatedActionResponse::order))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReconcileResponse> reconcile(String processCode) {
        return reconcile(processCode, availabilityRepository.findAllByOrderByDisplayOrderAscIdAsc());
    }

    @Transactional
    public ScaffoldResponse scaffold(String processCode, String actorHeader) {
        List<ActionAvailabilityPolicy> current = availabilityRepository.findAllByOrderByDisplayOrderAscIdAsc();
        List<ReconcileResponse> missing = reconcile(processCode, current).stream()
                .filter(row -> row.status().equals("missing")).toList();
        List<AvailabilityResponse> created = new ArrayList<>();
        for (ReconcileResponse row : missing) {
            String id = "AP-BPMN-" + processCode + "-" + row.stepKey() + "-" + row.outcome();
            AvailabilityRequest request = new AvailabilityRequest(id, row.actionCode(), "DOSSIER_DETAIL",
                    processCode, row.stepKey(), row.outcome().equals("SUBMIT") ? "draft" : "processing",
                    List.of(), List.of(row.outcome().equals("SUBMIT") ? "SUBMIT_DOSSIER" : "PROCESS_STEP"),
                    row.outcome().equals("SUBMIT") ? "phieu-chu-truong"
                            : Set.of("RETURN", "REJECT").contains(row.outcome()) ? "phieu-y-kien" : "phieu-phe-duyet",
                    row.outcome().equals("SUBMIT") ? "dossier.docsComplete = true"
                            : "user in currentStep.candidateGroups",
                    10, true);
            created.add(createAvailability(request, actorHeader));
        }
        return new ScaffoldResponse(created.size(), created, reconcile(processCode));
    }

    private SimulatedActionResponse simulate(ActionStudioAction action, List<ActionAvailabilityPolicy> policies,
            SimulationRequest request) {
        ActionAvailabilityPolicy policy = policies.stream()
                .filter(ActionAvailabilityPolicy::isEnabled)
                .filter(item -> item.getActionCode().equals(action.getActionCode()))
                .filter(item -> item.getSurface() == null || item.getSurface().equals(request.surface()))
                .filter(item -> item.getProcessCode() == null || item.getProcessCode().equals(request.processCode()))
                .filter(item -> item.getTaskDefinitionKey() == null || item.getTaskDefinitionKey().equals(request.taskDefinitionKey()))
                .filter(item -> item.getDossierStatus() == null || item.getDossierStatus().equals(request.dossierStatus()))
                .max(Comparator.comparingInt(ActionStudioService::specificity)
                        .thenComparing(Comparator.comparingInt(ActionAvailabilityPolicy::getDisplayOrder).reversed()))
                .orElse(null);
        List<String> reasons = new ArrayList<>();
        if (!action.isActive()) reasons.add("Action đang bị khóa trong danh mục.");
        if (policy == null) reasons.add("Không có luật khớp surface/quy trình/bước/trạng thái.");
        boolean roleOk = policy == null || request.isAdmin() || policy.getAllowedRoleCodes().isEmpty()
                || policy.getAllowedRoleCodes().stream().anyMatch(request.roleCodes()::contains);
        if (!roleOk) reasons.add("Người dùng không có vai trò được luật cho phép.");
        List<String> missingPermissions = policy == null ? List.of()
                : policy.getRequiredPermissions().stream().filter(item -> !request.permissions().contains(item)).toList();
        if (!request.isAdmin() && !missingPermissions.isEmpty()) {
            reasons.add("Thiếu quyền: " + String.join(", ", missingPermissions) + ".");
        }
        boolean visible = action.isActive() && policy != null && roleOk;
        if (reasons.isEmpty()) reasons.add("Khớp luật và đủ quyền thực hiện.");
        return new SimulatedActionResponse(action.getActionCode(), action.getActionName(), action.getActionType(),
                action.getOutcome(), action.isRequiresReason(), action.isRequiresEvidence(), action.isRequiresConfirm(),
                action.isActive(), action.getLabel(), action.getIcon(), action.getUiGroup(), action.getTone(),
                action.getDisplayOrder(), action.getHelpText(), visible,
                visible && (request.isAdmin() || missingPermissions.isEmpty()), policy == null ? null : policy.getId(),
                reasons, policy == null ? null : policy.getFormKey());
    }

    private List<ReconcileResponse> reconcile(String processCode, List<ActionAvailabilityPolicy> policies) {
        var process = routingCatalog.require(processCode);
        return process.steps().stream().flatMap(step -> step.branches().stream().map(branch -> {
            String actionCode = outcomeAction(branch.outcome());
            ActionAvailabilityPolicy exact = policies.stream().filter(ActionAvailabilityPolicy::isEnabled)
                    .filter(item -> processCode.equals(item.getProcessCode()))
                    .filter(item -> step.key().equals(item.getTaskDefinitionKey()))
                    .filter(item -> actionCode.equals(item.getActionCode())).findFirst().orElse(null);
            ActionAvailabilityPolicy generic = policies.stream().filter(ActionAvailabilityPolicy::isEnabled)
                    .filter(item -> item.getProcessCode() == null && item.getTaskDefinitionKey() == null)
                    .filter(item -> actionCode.equals(item.getActionCode())).findFirst().orElse(null);
            ActionAvailabilityPolicy matched = exact != null ? exact : generic;
            String status = matched == null ? "missing" : exact == null ? "generic"
                    : matched.getFormKey() == null && isOutcomeAction(actionCode) ? "unfilled" : "ok";
            String reason = switch (status) {
                case "ok" -> "Đã ghim đúng bước và đủ cấu hình.";
                case "generic" -> "Đang được phủ bởi luật chung.";
                case "unfilled" -> "Đã có luật nhưng chưa gắn biểu mẫu.";
                default -> "Chưa có luật hiển thị cho nhánh này.";
            };
            return new ReconcileResponse(processCode, step.key(), step.name(), branch.outcome(), actionCode,
                    status, matched == null ? null : matched.getId(), reason);
        })).toList();
    }

    private void validateAvailability(AvailabilityRequest request) {
        action(request.actionCode());
        if (request.surface() != null) requireOneOf("surface", request.surface(), SURFACES);
        if (request.dossierStatus() != null) requireOneOf("trạng thái hồ sơ", request.dossierStatus(), STATUSES);
        if (request.taskDefinitionKey() != null && request.processCode() == null) {
            throw new IllegalArgumentException("taskDefinitionKey yêu cầu processCode.");
        }
    }

    private void validateException(ExceptionRequest request) {
        ActionStudioAction action = action(request.actionCode());
        if (!ACTION_TYPES.contains(action.getActionType()) || !"EXCEPTION".equals(action.getActionType())) {
            throw new IllegalArgumentException("Chính sách Chi tiết phải tham chiếu action loại EXCEPTION.");
        }
        requireOneOf("objectType", request.objectType(), OBJECT_TYPES);
        requireOneOf("targetType", request.targetType(), TARGET_TYPES);
        if ("STEP".equals(request.targetType()) && blankToNull(request.targetStepKey()) == null) {
            throw new IllegalArgumentException("targetStepKey là bắt buộc khi targetType=STEP.");
        }
    }

    private ActionStudioAction action(String code) {
        return actionRepository.findById(code)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy hành động " + code));
    }

    private ActionAvailabilityPolicy availability(String id) {
        return availabilityRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy luật khả dụng " + id));
    }

    private ActionExceptionPolicy exceptionPolicy(String id) {
        return exceptionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy chính sách Chi tiết " + id));
    }

    private void audit(String type, String id, String event, String actorHeader, String detail) {
        ActionStudioAudit audit = new ActionStudioAudit();
        audit.setId(UUID.randomUUID());
        audit.setEntityType(type);
        audit.setEntityId(id);
        audit.setAction(event);
        audit.setActor(ProcessDefinitionService.normalizeActor(actorHeader));
        audit.setEventAt(now());
        audit.setDetail(detail);
        auditRepository.save(audit);
    }

    private static void apply(ActionAvailabilityPolicy entity, AvailabilityRequest request) {
        entity.setId(request.id().trim());
        entity.setActionCode(request.actionCode());
        entity.setSurface(blankToNull(request.surface()));
        entity.setProcessCode(blankToNull(request.processCode()));
        entity.setTaskDefinitionKey(blankToNull(request.taskDefinitionKey()));
        entity.setDossierStatus(blankToNull(request.dossierStatus()));
        entity.setAllowedRoleCodes(new LinkedHashSet<>(request.allowedRoleCodes()));
        entity.setRequiredPermissions(new LinkedHashSet<>(request.requiredPermissions()));
        entity.setFormKey(blankToNull(request.formKey()));
        entity.setConditionExpression(blankToNull(request.conditionExpression()));
        entity.setDisplayOrder(request.displayOrder());
        entity.setEnabled(request.enabled());
    }

    private static void apply(ActionExceptionPolicy entity, ExceptionRequest request) {
        entity.setId(request.id().trim());
        entity.setActionCode(request.actionCode());
        entity.setObjectType(request.objectType());
        entity.setProcessCode(blankToNull(request.processCode()));
        entity.setFromStepKey(blankToNull(request.fromStepKey()));
        entity.setTargetType(request.targetType());
        entity.setTargetStepKey(blankToNull(request.targetStepKey()));
        entity.setAllowedRoleCodes(new LinkedHashSet<>(request.allowedRoleCodes()));
        entity.setRequiredPermissions(new LinkedHashSet<>(request.requiredPermissions()));
        entity.setRequiresApproval(request.requiresApproval());
        entity.setRequiresReason(request.requiresReason());
        entity.setRequiresEvidence(request.requiresEvidence());
        entity.setEnabled(request.enabled());
    }

    private static void touch(ActionStudioAction entity, String actorHeader) {
        entity.setUpdatedBy(ProcessDefinitionService.normalizeActor(actorHeader));
        entity.setUpdatedAt(now());
    }

    private static void touch(ActionAvailabilityPolicy entity, String actorHeader) {
        entity.setUpdatedBy(ProcessDefinitionService.normalizeActor(actorHeader));
        entity.setUpdatedAt(now());
    }

    private static void touch(ActionExceptionPolicy entity, String actorHeader) {
        entity.setUpdatedBy(ProcessDefinitionService.normalizeActor(actorHeader));
        entity.setUpdatedAt(now());
    }

    private static ActionResponse toAction(ActionStudioAction item) {
        return new ActionResponse(item.getActionCode(), item.getActionName(), item.getActionType(), item.getOutcome(),
                item.isRequiresReason(), item.isRequiresEvidence(), item.isRequiresConfirm(), item.isActive(),
                item.getVersion(), item.getUpdatedBy(), item.getUpdatedAt());
    }

    private static PresentationResponse toPresentation(ActionStudioAction item) {
        return new PresentationResponse(item.getActionCode(), item.getLabel(), item.getIcon(), item.getUiGroup(),
                item.getTone(), item.getDisplayOrder(), item.getHelpText(), item.getVersion());
    }

    private static AvailabilityResponse toAvailability(ActionAvailabilityPolicy item) {
        return new AvailabilityResponse(item.getId(), item.getActionCode(), item.getSurface(), item.getProcessCode(),
                item.getTaskDefinitionKey(), item.getDossierStatus(), List.copyOf(item.getAllowedRoleCodes()),
                List.copyOf(item.getRequiredPermissions()), item.getFormKey(), item.getConditionExpression(),
                item.getDisplayOrder(), item.isEnabled(), item.getVersion(), item.getUpdatedBy(), item.getUpdatedAt());
    }

    private static ExceptionResponse toException(ActionExceptionPolicy item) {
        return new ExceptionResponse(item.getId(), item.getActionCode(), item.getObjectType(), item.getProcessCode(),
                item.getFromStepKey(), item.getTargetType(), item.getTargetStepKey(),
                List.copyOf(item.getAllowedRoleCodes()), List.copyOf(item.getRequiredPermissions()),
                item.isRequiresApproval(), item.isRequiresReason(), item.isRequiresEvidence(), item.isEnabled(),
                item.getVersion(), item.getUpdatedBy(), item.getUpdatedAt());
    }

    private static int specificity(ActionAvailabilityPolicy item) {
        return (item.getSurface() == null ? 0 : 1) + (item.getProcessCode() == null ? 0 : 1)
                + (item.getTaskDefinitionKey() == null ? 0 : 1) + (item.getDossierStatus() == null ? 0 : 1);
    }

    private static String outcomeAction(String outcome) {
        return switch (outcome) {
            case "SUBMIT" -> "SUBMIT";
            case "APPROVE" -> "APPROVE_STEP";
            case "RETURN" -> "RETURN_STEP";
            case "REJECT" -> "REJECT_STEP";
            default -> throw new IllegalArgumentException("Outcome không hỗ trợ: " + outcome);
        };
    }

    private static boolean isOutcomeAction(String actionCode) {
        return Set.of("SUBMIT", "APPROVE_STEP", "RETURN_STEP", "REJECT_STEP").contains(actionCode);
    }

    private static void requireOneOf(String field, String value, Set<String> allowed) {
        if (!allowed.contains(value)) {
            throw new IllegalArgumentException(field + " không hợp lệ: " + value);
        }
    }

    private static void assertVersion(String id, long expected, long actual) {
        if (expected != actual) throw ActionStudioConflictException.stale(id, expected, actual);
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static OffsetDateTime now() {
        return OffsetDateTime.now(ZoneOffset.UTC);
    }
}
