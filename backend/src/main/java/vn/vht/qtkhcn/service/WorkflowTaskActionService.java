package vn.vht.qtkhcn.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Collection;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;
import vn.vht.qtkhcn.camunda.CamundaWorkflowTaskRuntime;
import vn.vht.qtkhcn.camunda.CamundaWorkflowTaskRuntime.TaskSnapshot;
import vn.vht.qtkhcn.camunda.HoiDongMembershipGateway;
import vn.vht.qtkhcn.camunda.WorkflowTaskActionRouting;
import vn.vht.qtkhcn.domain.WorkflowActionInbox;
import vn.vht.qtkhcn.domain.ActionFormSubmission;
import vn.vht.qtkhcn.domain.WorkflowEventOutbox;
import vn.vht.qtkhcn.domain.WorkflowProcessMapping;
import vn.vht.qtkhcn.integration.WorkflowEventEnvelope;
import vn.vht.qtkhcn.repository.WorkflowActionInboxRepository;
import vn.vht.qtkhcn.repository.ActionFormSubmissionRepository;
import vn.vht.qtkhcn.repository.WorkflowEventOutboxRepository;
import vn.vht.qtkhcn.repository.WorkflowProcessMappingRepository;
import vn.vht.qtkhcn.security.WorkflowDemoIdentity;
import vn.vht.qtkhcn.security.WorkflowDemoIdentityProvider;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.SimulatedActionResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.SimulationRequest;
import vn.vht.qtkhcn.web.dto.TaskActionDtos.AvailableActionResponse;
import vn.vht.qtkhcn.web.dto.TaskActionDtos.AvailableActionsResponse;
import vn.vht.qtkhcn.web.dto.TaskActionDtos.ExecuteActionRequest;
import vn.vht.qtkhcn.web.dto.TaskActionDtos.ExecuteActionResponse;
import vn.vht.qtkhcn.web.dto.TaskActionDtos.SaveFormDraftRequest;
import vn.vht.qtkhcn.web.dto.TaskActionDtos.FormSubmissionResponse;
import vn.vht.qtkhcn.workflow.WorkflowRuntimeEvent;

@Service
public class WorkflowTaskActionService {
    private static final Set<String> RUNTIME_ACTIONS = Set.of(
            "APPROVE_STEP", "RETURN_STEP", "REJECT_STEP");

    private final WorkflowActionInboxRepository inbox;
    private final ActionFormSubmissionRepository submissions;
    private final WorkflowProcessMappingRepository mappings;
    private final WorkflowEventOutboxRepository eventOutbox;
    private final CamundaWorkflowTaskRuntime runtime;
    private final WorkflowTaskActionRouting routing;
    private final HoiDongMembershipGateway hoiDong;
    private final WorkflowDemoIdentityProvider identities;
    private final ActionStudioService actionStudio;
    private final ObjectMapper json;
    private final TransactionTemplate transactions;

    public WorkflowTaskActionService(WorkflowActionInboxRepository inbox, ActionFormSubmissionRepository submissions,
            WorkflowProcessMappingRepository mappings, WorkflowEventOutboxRepository eventOutbox,
            CamundaWorkflowTaskRuntime runtime, WorkflowTaskActionRouting routing,
            HoiDongMembershipGateway hoiDong,
            WorkflowDemoIdentityProvider identities, ActionStudioService actionStudio,
            ObjectMapper json, TransactionTemplate transactions) {
        this.inbox = inbox;
        this.submissions = submissions;
        this.mappings = mappings;
        this.eventOutbox = eventOutbox;
        this.runtime = runtime;
        this.routing = routing;
        this.hoiDong = hoiDong;
        this.identities = identities;
        this.actionStudio = actionStudio;
        this.json = json;
        this.transactions = transactions;
    }

    public AvailableActionsResponse available(String taskKey, String userIdHeader) {
        WorkflowDemoIdentity identity = identities.resolve(userIdHeader);
        TaskSnapshot task = runtime.requireActive(taskKey);
        WorkflowProcessMapping mapping = mapping(task.processInstanceId());
        authorizeFeatureAccess(identity);
        authorize(identity, task, mapping);
        List<AvailableActionResponse> actions = available(task, mapping, identity).stream()
                .map(action -> new AvailableActionResponse(action.actionCode(), action.label(), action.icon(),
                        action.uiGroup(), action.tone(), action.order(), action.helpText(), action.requiresReason(),
                        action.requiresEvidence(), action.requiresConfirm(), action.formKey(), action.policyId(),
                        action.policyVersion(), action.formBundle()))
                .sorted(java.util.Comparator.comparingInt(AvailableActionResponse::displayOrder))
                .toList();
        return new AvailableActionsResponse(task.taskKey(), task.processInstanceId(),
                task.taskDefinitionKey(), actions);
    }

    public FormSubmissionResponse saveDraft(String taskKey, SaveFormDraftRequest request, String userIdHeader) {
        WorkflowDemoIdentity identity = identities.resolve(userIdHeader);
        TaskSnapshot task = runtime.requireActive(taskKey);
        WorkflowProcessMapping mapping = mapping(task.processInstanceId());
        authorizeFeatureAccess(identity);
        authorize(identity, task, mapping);
        SimulatedActionResponse action = available(task, mapping, identity).stream()
                .filter(item -> item.actionCode().equals(request.actionCode())).findFirst()
                .orElseThrow(() -> new TaskActionException("ACTION_FORBIDDEN", HttpStatus.FORBIDDEN,
                        "Action không khả dụng cho user/task hiện tại."));
        assertPolicySnapshot(request.expectedPolicyId(), request.expectedPolicyVersion(),
                action.policyId(), action.policyVersion());
        if (action.formBundle() == null || !action.formBundle().allowDraft()) {
            throw new TaskActionException("FORM_DRAFT_DISABLED", HttpStatus.CONFLICT,
                    "Form Bundle không cho phép lưu nháp.");
        }
        var item = action.formBundle().items().stream()
                .filter(candidate -> candidate.outputNamespace().equals(request.outputNamespace())).findFirst()
                .orElseThrow(() -> new TaskActionException("FORM_BUNDLE_ITEM_NOT_FOUND", HttpStatus.BAD_REQUEST,
                        "Không tìm thấy Bundle Item theo outputNamespace."));
        if (!"EDIT".equals(item.mode())) {
            throw new TaskActionException("FORM_READ_ONLY", HttpStatus.CONFLICT,
                    "Biểu mẫu VIEW không được lưu dữ liệu.");
        }
        UUID id = UUID.nameUUIDFromBytes((taskKey + "\u0000" + action.policyId() + "\u0000"
                + request.outputNamespace() + "\u0000" + identity.userId()).getBytes(StandardCharsets.UTF_8));
        ActionFormSubmission saved = transactions.execute(status -> {
            ActionFormSubmission draft = submissions.findById(id).orElseGet(ActionFormSubmission::new);
            draft.setId(id);
            draft.setRequestId(id);
            draft.setDossierId(mapping.getHoSoId());
            draft.setTaskKey(taskKey);
            draft.setTaskDefinitionKey(task.taskDefinitionKey());
            draft.setPolicyId(action.policyId());
            draft.setBundleVersion(action.formBundle().version() == null ? 1 : action.formBundle().version());
            draft.setFormKey(item.formKey());
            draft.setFormVersion(item.formVersion());
            draft.setOutputNamespace(item.outputNamespace());
            draft.setActionCode(action.actionCode());
            draft.setActorId(identity.userId());
            draft.setDataJson(write(request.data()));
            draft.setStatus(ActionFormSubmission.Status.DRAFT);
            draft.setCompletedAt(null);
            draft.setCreatedAt(now());
            return submissions.saveAndFlush(draft);
        });
        return toSubmission(saved);
    }

    public List<FormSubmissionResponse> submissions(String taskKey, String userIdHeader) {
        WorkflowDemoIdentity identity = identities.resolve(userIdHeader);
        TaskSnapshot task = runtime.requireActive(taskKey);
        WorkflowProcessMapping mapping = mapping(task.processInstanceId());
        authorizeFeatureAccess(identity);
        authorize(identity, task, mapping);
        return submissions.findByTaskKeyAndActorIdOrderByCreatedAtDesc(taskKey, identity.userId()).stream()
                .map(this::toSubmission).toList();
    }

    public ExecuteActionResponse execute(String pathTaskKey, ExecuteActionRequest request, String userIdHeader) {
        validateRequest(pathTaskKey, request);
        WorkflowDemoIdentity identity = identities.resolve(userIdHeader);
        String canonical = canonical(request, identity.userId());
        String hash = sha256(canonical);
        WorkflowActionInbox row = register(request, identity.userId(), canonical, hash);
        verifyHash(row, hash);

        if (row.getStatus() == WorkflowActionInbox.Status.COMPLETED) return response(row);
        if (row.getStatus() == WorkflowActionInbox.Status.FAILED) {
            throw new TaskActionException(row.getErrorCode(), HttpStatus.UNPROCESSABLE_ENTITY,
                    row.getErrorMessage());
        }
        if (row.getStatus() == WorkflowActionInbox.Status.UNKNOWN) return reconcile(row);

        try {
            TaskSnapshot task = runtime.requireActive(pathTaskKey);
            WorkflowProcessMapping mapping = mapping(task.processInstanceId());
            authorizeFeatureAccess(identity);
            authorize(identity, task, mapping);
            SimulatedActionResponse action = available(task, mapping, identity).stream()
                    .filter(item -> item.actionCode().equals(request.actionCode())).findFirst()
                    .orElseThrow(() -> new TaskActionException("ACTION_FORBIDDEN", HttpStatus.FORBIDDEN,
                            "Action không khả dụng cho user/task hiện tại."));
            assertPolicySnapshot(request.expectedPolicyId(), request.expectedPolicyVersion(),
                    action.policyId(), action.policyVersion());
            validateActionInput(action, request, actionContext(mapping, identity));
            if (inbox.existsByTaskKeyAndStatusIn(pathTaskKey, List.of(WorkflowActionInbox.Status.UNKNOWN))) {
                throw new TaskActionException("TASK_ACTION_IN_PROGRESS", HttpStatus.CONFLICT,
                        "Task đang có một action chưa xác định kết quả.");
            }
            markUnknown(row.getRequestId(), task, mapping, action, request, identity.userId());
            Map<String, Object> variables = routing.variables(mapping.getProcessDefinitionId(),
                    task.taskDefinitionKey(), request.actionCode(), request.requestId().toString(), identity.userId());
            variables = withDiemSoForT24(task.taskDefinitionKey(), request.actionCode(), variables, request.formData());
            runtime.apply(task, request.actionCode(), variables);
            return complete(row.getRequestId());
        } catch (TaskActionException validation) {
            failIfReceived(row.getRequestId(), validation.getCode(), validation.getMessage());
            throw validation;
        } catch (Exception uncertain) {
            throw new TaskActionException("ACTION_RESULT_UNKNOWN", HttpStatus.SERVICE_UNAVAILABLE,
                    "Camunda chưa xác nhận chắc chắn kết quả; request được giữ để reconcile, không thực hiện lại mù.");
        }
    }

    @Scheduled(fixedDelayString = "${qtkhcn.workflow-actions.reconcile-ms:5000}")
    public void reconcileUnknown() {
        inbox.findTop50ByStatusOrderByCreatedAtAsc(WorkflowActionInbox.Status.UNKNOWN).forEach(row -> {
            try { reconcile(row); }
            catch (TaskActionException ignored) { /* still active or temporarily unavailable */ }
        });
    }

    private ExecuteActionResponse reconcile(WorkflowActionInbox row) {
        try {
            var task = runtime.find(row.getTaskKey());
            if (task.isPresent() && task.get().active()) {
                throw new TaskActionException("ACTION_RESULT_UNKNOWN", HttpStatus.SERVICE_UNAVAILABLE,
                        "Action vẫn đang đối soát; task còn ACTIVE nên hệ thống không retry mù.");
            }
            return complete(row.getRequestId());
        } catch (TaskActionException e) {
            throw e;
        } catch (Exception unavailable) {
            throw new TaskActionException("ACTION_RESULT_UNKNOWN", HttpStatus.SERVICE_UNAVAILABLE,
                    "Chưa thể đối soát action với Camunda.");
        }
    }

    private List<SimulatedActionResponse> available(TaskSnapshot task, WorkflowProcessMapping mapping,
            WorkflowDemoIdentity identity) {
        String processCode = mapping.getProcessDefinitionId().replace('_', '.');
        SimulationRequest simulation = new SimulationRequest("DOSSIER_DETAIL", processCode,
                task.taskDefinitionKey(), "processing", List.copyOf(identity.roleCodes()),
                List.copyOf(identity.permissions()), identity.administrator(), mapping.getProcessVersion(),
                actionContext(mapping, identity));
        return actionStudio.simulate(simulation).stream()
                .filter(item -> RUNTIME_ACTIONS.contains(item.actionCode()))
                .filter(SimulatedActionResponse::visible)
                .filter(SimulatedActionResponse::enabled)
                .filter(item -> routing.supports(mapping.getProcessDefinitionId(),
                        task.taskDefinitionKey(), item.actionCode()))
                .toList();
    }

    /**
     * {@code assignee}/{@code candidateUsers} THU HẸP {@code candidateGroups}, không cộng dồn với nó.
     *
     * <p>Trước đây ba vế nối bằng OR thuần. Với các bước họp Hội đồng xét duyệt (T07/T10 cấp Cơ sở,
     * T21/T24 cấp Tập đoàn) chỉ khai {@code candidateGroups="HDXD"/"HDXD_TD"}, hệ quả là <b>bất kỳ ai
     * giữ vai trò đó cũng thao tác được task của MỌI hồ sơ</b>, kể cả hồ sơ họ không nằm trong hội
     * đồng. Vai trò là danh mục tĩnh ("đủ tư cách được chọn"); tư cách thành viên hội đồng là dữ liệu
     * động theo từng hồ sơ và chỉ biểu diễn được bằng danh sách người cụ thể. Vì vậy: task đã xác
     * định được người cụ thể thì chỉ những người đó (và admin) được thao tác.</p>
     *
     * <p>Danh sách người cụ thể có hai nguồn, hợp lại: {@code candidateUsers} do chính engine trả về,
     * và thành viên hội đồng của hồ sơ này do ho-so-service dịch từ candidateGroups. Nguồn thứ hai cần
     * thiết vì các bước hội đồng của RD02.02 là job-backed user task — metadata của chúng đọc từ BPMN
     * tĩnh nên không bao giờ chứa được danh sách động.</p>
     *
     * <p>Khi KHÔNG xác định được người cụ thể nào, luật cũ theo vai trò giữ nguyên — điều kiện sống
     * còn để hồ sơ cũ, hoặc hội đồng chỉ ghi họ tên (chưa gắn tài khoản), không bị kẹt.</p>
     */
    private void authorize(WorkflowDemoIdentity identity, TaskSnapshot task, WorkflowProcessMapping mapping) {
        if (identity.administrator()) return;
        boolean assigned = task.assignee() != null && !task.assignee().isBlank();
        boolean assignee = assigned && task.assignee().equalsIgnoreCase(identity.userId());

        Set<String> namedUsers = new java.util.LinkedHashSet<>(task.candidateUsers());
        namedUsers.addAll(hoiDong.candidateUsers(mapping.getHoSoId(), task.candidateGroups()));
        boolean candidateUser = namedUsers.stream().anyMatch(user -> user.equalsIgnoreCase(identity.userId()));

        boolean narrowed = assigned || !namedUsers.isEmpty();
        boolean candidateGroup = !narrowed
                && task.candidateGroups().stream().anyMatch(identity.roleCodes()::contains);
        if (!assignee && !candidateUser && !candidateGroup) {
            throw new TaskActionException("TASK_FORBIDDEN", HttpStatus.FORBIDDEN, narrowed
                    ? "Task đã xác định người xử lý cụ thể; vai trò không đủ để thao tác."
                    : "User không phải assignee/candidate của task.");
        }
    }

    private static void authorizeFeatureAccess(WorkflowDemoIdentity identity) {
        if (identity.administrator()) return;
        if (!identity.apps().contains("qlnvkhcn")) {
            throw new TaskActionException("APP_ACCESS_FORBIDDEN", HttpStatus.FORBIDDEN,
                    "User không được truy cập ứng dụng Quản lý NV KHCN.");
        }
        if (!identity.hasFeaturePermission("DOSSIER", "VIEW_DETAIL")) {
            throw new TaskActionException("FEATURE_ACCESS_FORBIDDEN", HttpStatus.FORBIDDEN,
                    "User không có quyền DOSSIER/VIEW_DETAIL.");
        }
    }

    static void assertPolicySnapshot(String expectedId, long expectedVersion, String actualId, Long actualVersion) {
        if (!expectedId.equals(actualId) || actualVersion == null || expectedVersion != actualVersion.longValue()) {
            throw new TaskActionException("ACTION_POLICY_CHANGED", HttpStatus.CONFLICT,
                    "Luật hiển thị Action đã thay đổi; hãy tải lại danh sách hành động.");
        }
    }

    private WorkflowProcessMapping mapping(String processInstanceId) {
        return mappings.findByProcessInstanceId(processInstanceId)
                .orElseThrow(() -> new TaskActionException("PROCESS_MAPPING_NOT_FOUND", HttpStatus.CONFLICT,
                        "Task không có workflow process mapping tin cậy."));
    }

    private WorkflowActionInbox register(ExecuteActionRequest request, String actor, String canonical, String hash) {
        WorkflowActionInbox existing = inbox.findById(request.requestId()).orElse(null);
        if (existing != null) return existing;
        try {
            return transactions.execute(status -> {
                WorkflowActionInbox row = new WorkflowActionInbox();
                row.setRequestId(request.requestId());
                row.setPayloadHash(hash);
                row.setPayloadJson(canonical);
                row.setTaskKey(request.taskKey());
                row.setActionCode(request.actionCode());
                row.setActorId(actor);
                row.setComment(blankToNull(request.comment()));
                row.setFormDataJson(write(request.formData()));
                row.setStatus(WorkflowActionInbox.Status.RECEIVED);
                row.setCreatedAt(now());
                row.setUpdatedAt(row.getCreatedAt());
                return inbox.saveAndFlush(row);
            });
        } catch (DataIntegrityViolationException race) {
            WorkflowActionInbox duplicate = inbox.findById(request.requestId()).orElse(null);
            if (duplicate != null) return duplicate;
            throw new TaskActionException("TASK_ACTION_IN_PROGRESS", HttpStatus.CONFLICT,
                    "Task đang có một action khác đang được xử lý.");
        }
    }

    private void markUnknown(UUID requestId, TaskSnapshot task, WorkflowProcessMapping mapping,
            SimulatedActionResponse action, ExecuteActionRequest request, String actorId) {
        transactions.executeWithoutResult(status -> {
            WorkflowActionInbox row = inbox.findById(requestId).orElseThrow();
            row.setStatus(WorkflowActionInbox.Status.UNKNOWN);
            row.setAttempts(row.getAttempts() + 1);
            row.setProcessInstanceId(task.processInstanceId());
            row.setTaskDefinitionKey(task.taskDefinitionKey());
            row.setHoSoId(mapping.getHoSoId());
            row.setUpdatedAt(now());
            inbox.save(row);
            persistPendingSubmissions(row, action, request, actorId);
        });
    }

    private ExecuteActionResponse complete(UUID requestId) {
        return transactions.execute(status -> {
            WorkflowActionInbox row = inbox.findById(requestId).orElseThrow();
            if (row.getStatus() != WorkflowActionInbox.Status.COMPLETED) {
                row.setStatus(WorkflowActionInbox.Status.COMPLETED);
                row.setCompletedAt(now());
                row.setUpdatedAt(row.getCompletedAt());
                inbox.save(row);
                submissions.findByRequestId(requestId).forEach(submission -> {
                    submission.setStatus(ActionFormSubmission.Status.COMPLETED);
                    submission.setCompletedAt(row.getCompletedAt());
                    submissions.save(submission);
                });
                emitActionEvent(row);
            }
            return response(row);
        });
    }

    private void emitActionEvent(WorkflowActionInbox row) {
        WorkflowProcessMapping mapping = mapping(row.getProcessInstanceId());
        String sourceKey = "TASK_ACTION_APPLIED:" + row.getRequestId();
        if (eventOutbox.existsBySourceKey(sourceKey)) return;
        UUID eventId = UUID.nameUUIDFromBytes(sourceKey.getBytes(StandardCharsets.UTF_8));
        Map<String, Object> payload = new java.util.LinkedHashMap<>();
        payload.put("requestId", row.getRequestId().toString());
        payload.put("taskKey", row.getTaskKey());
        payload.put("taskDefinitionKey", row.getTaskDefinitionKey());
        payload.put("actionCode", row.getActionCode());
        payload.put("actorId", row.getActorId());
        if (row.getComment() != null) payload.put("comment", row.getComment());
        // Nguồn dữ liệu thật cho tự động hoá phía sau (vd sinh HĐXD sau khi ký QĐ thành lập) —
        // ho-so-service lưu formData vào DossierStep, KHÔNG phải Camunda variable (đúng D3).
        if (row.getFormDataJson() != null) payload.put("formData", readFormData(row.getFormDataJson()));
        WorkflowEventEnvelope envelope = new WorkflowEventEnvelope(eventId,
                WorkflowRuntimeEvent.EventType.TASK_ACTION_APPLIED, row.getCompletedAt().toString(),
                mapping.getRequestId().toString(), mapping.getHoSoId(), mapping.getProcessInstanceId(), payload);
        WorkflowEventOutbox event = new WorkflowEventOutbox();
        event.setEventId(eventId);
        event.setSourceKey(sourceKey);
        event.setEventType(WorkflowRuntimeEvent.EventType.TASK_ACTION_APPLIED.name());
        event.setCorrelationId(mapping.getRequestId().toString());
        event.setHoSoId(mapping.getHoSoId());
        event.setProcessInstanceId(mapping.getProcessInstanceId());
        event.setOccurredAt(row.getCompletedAt());
        event.setPayloadJson(write(envelope));
        event.setStatus(WorkflowEventOutbox.Status.PENDING);
        event.setNextAttemptAt(now());
        event.setCreatedAt(now());
        eventOutbox.save(event);
    }

    private void failIfReceived(UUID requestId, String code, String message) {
        transactions.executeWithoutResult(status -> {
            WorkflowActionInbox row = inbox.findById(requestId).orElseThrow();
            if (row.getStatus() != WorkflowActionInbox.Status.RECEIVED) return;
            row.setStatus(WorkflowActionInbox.Status.FAILED);
            row.setErrorCode(code);
            row.setErrorMessage(abbreviate(message, 512));
            row.setUpdatedAt(now());
            inbox.save(row);
        });
    }

    /**
     * T24 (Họp HĐXD Tập đoàn phiên 2) là multi-instance: mỗi thành viên hoàn thành một instance
     * riêng, và biến Zeebe outputCollection của multi-instance là nơi DUY NHẤT có thể giữ N điểm số
     * song song để tính trung bình — dossier_step ở ho-so-service chỉ có 1 dòng theo
     * taskDefinitionKey nên 3 lượt hoàn thành T24 sẽ ghi đè formData của nhau. Vì vậy CHỈ field
     * điểm số (không phải cả formData) được chuyển thành biến Zeebe cục bộ của đúng instance đó —
     * cùng mẫu "business data ngắn hạn phục vụ DMN" đã có tiền lệ ở
     * SystemCheckJobWorker#checkChuTruongTapDoan (tongDuToan/loaiNhiemVu), không phá nguyên tắc D3
     * vì không lưu lại lâu dài, chỉ đi qua Zeebe đúng 1 chặng tới business rule task rồi biến mất.
     */
    private static Map<String, Object> withDiemSoForT24(String taskDefinitionKey, String actionCode,
            Map<String, Object> variables, Map<String, Object> formData) {
        if (!"T24".equals(taskDefinitionKey) || !"APPROVE_STEP".equals(actionCode)) return variables;
        Object diemSo = formData.get("diemSo");
        if (!(diemSo instanceof Number)) return variables;
        Map<String, Object> merged = new java.util.LinkedHashMap<>(variables);
        merged.put("diemSo", diemSo);
        return merged;
    }

    private static void validateRequest(String pathTaskKey, ExecuteActionRequest request) {
        if (!pathTaskKey.equals(request.taskKey())) {
            throw new TaskActionException("TASK_KEY_MISMATCH", HttpStatus.BAD_REQUEST,
                    "taskKey trong path và body phải trùng nhau.");
        }
        if (!RUNTIME_ACTIONS.contains(request.actionCode())) {
            throw new TaskActionException("ACTION_INVALID", HttpStatus.BAD_REQUEST,
                    "actionCode không thuộc runtime action được hỗ trợ.");
        }
        if (!"ACTIVE".equals(request.expectedTaskState())) {
            throw new TaskActionException("EXPECTED_STATE_INVALID", HttpStatus.BAD_REQUEST,
                    "expectedTaskState hiện chỉ hỗ trợ ACTIVE.");
        }
    }

    private void validateActionInput(SimulatedActionResponse action, ExecuteActionRequest request,
            Map<String, Object> context) {
        if (action.requiresReason() && blankToNull(request.comment()) == null) {
            throw new TaskActionException("COMMENT_REQUIRED", HttpStatus.BAD_REQUEST,
                    "Action yêu cầu nhập ý kiến/lý do.");
        }
        if (action.requiresEvidence() && request.formData().isEmpty()) {
            throw new TaskActionException("EVIDENCE_REQUIRED", HttpStatus.BAD_REQUEST,
                    "Action yêu cầu dữ liệu minh chứng.");
        }
        List<String> missingFields = action.formBundle() == null
                ? actionStudio.missingRequiredFormFields(action.formKey(), request.formData())
                : actionStudio.missingRequiredBundleFields(action.formBundle(), request.formData(), context);
        if (!missingFields.isEmpty()) {
            throw new TaskActionException("FORM_VALIDATION_FAILED", HttpStatus.BAD_REQUEST,
                    "Thiếu trường bắt buộc của biểu mẫu: " + String.join(", ", missingFields) + ".");
        }
    }

    private void persistPendingSubmissions(WorkflowActionInbox row, SimulatedActionResponse action,
            ExecuteActionRequest request, String actorId) {
        if (action.formBundle() == null) return;
        for (var item : action.formBundle().items()) {
            Object data = request.formData().get(item.outputNamespace());
            if (data == null) continue;
            ActionFormSubmission submission = new ActionFormSubmission();
            submission.setId(UUID.nameUUIDFromBytes((row.getRequestId() + "\u0000" + item.outputNamespace())
                    .getBytes(StandardCharsets.UTF_8)));
            submission.setRequestId(row.getRequestId());
            submission.setDossierId(row.getHoSoId());
            submission.setTaskKey(row.getTaskKey());
            submission.setTaskDefinitionKey(row.getTaskDefinitionKey());
            submission.setPolicyId(action.policyId());
            submission.setBundleVersion(action.formBundle().version() == null ? 1 : action.formBundle().version());
            submission.setFormKey(item.formKey());
            submission.setFormVersion(item.formVersion());
            submission.setOutputNamespace(item.outputNamespace());
            submission.setActionCode(row.getActionCode());
            submission.setActorId(actorId);
            submission.setDataJson(write(data));
            submission.setStatus(ActionFormSubmission.Status.PENDING);
            submission.setCreatedAt(now());
            submissions.save(submission);
        }
    }

    private static Map<String, Object> actionContext(WorkflowProcessMapping mapping, WorkflowDemoIdentity identity) {
        return Map.of("user", identity.roleCodes(),
                "currentStep", Map.of("candidateGroups", identity.roleCodes()),
                "dossier", Map.of("id", mapping.getHoSoId(), "status", "processing"));
    }

    private String canonical(ExecuteActionRequest request, String actor) {
        Map<String, Object> root = new TreeMap<>();
        root.put("actionCode", request.actionCode());
        root.put("actorId", actor);
        root.put("comment", blankToNull(request.comment()));
        root.put("expectedTaskState", request.expectedTaskState());
        root.put("expectedPolicyId", request.expectedPolicyId());
        root.put("expectedPolicyVersion", request.expectedPolicyVersion());
        root.put("formData", new TreeMap<>(request.formData()));
        root.put("requestId", request.requestId().toString());
        root.put("taskKey", request.taskKey());
        return write(root);
    }

    private static void verifyHash(WorkflowActionInbox row, String hash) {
        if (!MessageDigest.isEqual(row.getPayloadHash().getBytes(StandardCharsets.US_ASCII),
                hash.getBytes(StandardCharsets.US_ASCII))) {
            throw new TaskActionException("IDEMPOTENCY_CONFLICT", HttpStatus.CONFLICT,
                    "requestId đã được dùng với payload khác.");
        }
    }

    private String write(Object value) {
        try { return json.writeValueAsString(value); }
        catch (JsonProcessingException e) {
            throw new TaskActionException("PAYLOAD_INVALID", HttpStatus.BAD_REQUEST, "Payload JSON không hợp lệ.");
        }
    }

    private Object readFormData(String formDataJson) {
        try { return json.readValue(formDataJson, Object.class); }
        catch (JsonProcessingException e) {
            throw new IllegalStateException("WorkflowActionInbox.formDataJson không hợp lệ.", e);
        }
    }

    private FormSubmissionResponse toSubmission(ActionFormSubmission submission) {
        return new FormSubmissionResponse(submission.getId(), submission.getTaskKey(),
                submission.getTaskDefinitionKey(), submission.getPolicyId(), submission.getBundleVersion(),
                submission.getFormKey(), submission.getFormVersion(), submission.getOutputNamespace(),
                submission.getActionCode(), readFormData(submission.getDataJson()), submission.getStatus().name(),
                submission.getCreatedAt(), submission.getCompletedAt());
    }

    private static String sha256(String value) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                .digest(value.getBytes(StandardCharsets.UTF_8))); }
        catch (NoSuchAlgorithmException impossible) { throw new IllegalStateException(impossible); }
    }
    private static ExecuteActionResponse response(WorkflowActionInbox row) {
        return new ExecuteActionResponse(row.getRequestId(), row.getTaskKey(), row.getProcessInstanceId(), "ACCEPTED");
    }
    private static String blankToNull(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    private static String abbreviate(String value, int max) { return value.length() <= max ? value : value.substring(0, max); }
    private static OffsetDateTime now() { return OffsetDateTime.now(ZoneOffset.UTC); }
}
