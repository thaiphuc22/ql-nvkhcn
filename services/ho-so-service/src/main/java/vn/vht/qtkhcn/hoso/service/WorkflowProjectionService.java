package vn.vht.qtkhcn.hoso.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vht.qtkhcn.hoso.domain.DossierStatus;
import vn.vht.qtkhcn.hoso.domain.DossierStep;
import vn.vht.qtkhcn.hoso.domain.HoSo;
import vn.vht.qtkhcn.hoso.domain.StepStatus;
import vn.vht.qtkhcn.hoso.domain.WorkflowEventInbox;
import vn.vht.qtkhcn.hoso.domain.WorkflowProcessProjection;
import vn.vht.qtkhcn.hoso.domain.WorkflowTaskProjection;
import vn.vht.qtkhcn.hoso.repository.HoSoRepository;
import vn.vht.qtkhcn.hoso.repository.WorkflowEventInboxRepository;
import vn.vht.qtkhcn.hoso.repository.WorkflowProcessProjectionRepository;
import vn.vht.qtkhcn.hoso.repository.WorkflowTaskProjectionRepository;

@Service
public class WorkflowProjectionService {
    private final WorkflowEventInboxRepository inboxRepository;
    private final WorkflowTaskProjectionRepository taskRepository;
    private final WorkflowProcessProjectionRepository processRepository;
    private final HoSoRepository hoSoRepository;
    private final HoiDongXetDuyetService hoiDong;
    private final ObjectMapper json;

    public WorkflowProjectionService(WorkflowEventInboxRepository inboxRepository,
            WorkflowTaskProjectionRepository taskRepository,
            WorkflowProcessProjectionRepository processRepository,
            HoSoRepository hoSoRepository, HoiDongXetDuyetService hoiDong, ObjectMapper json) {
        this.inboxRepository = inboxRepository;
        this.taskRepository = taskRepository;
        this.processRepository = processRepository;
        this.hoSoRepository = hoSoRepository;
        this.hoiDong = hoiDong;
        this.json = json;
    }

    /** Rebuilds from durable facts, making arrival order and retries irrelevant. */
    @Transactional
    public void rebuild(String hoSoId) {
        HoSo hoSo = hoSoRepository.findForWorkflowProjection(hoSoId)
                .orElseThrow(() -> new EntityNotFoundException("Khong tim thay HoSo " + hoSoId));
        List<WorkflowEventInbox> events = inboxRepository
                .findByHoSoIdOrderByOccurredAtAscEventIdAsc(hoSoId);
        if (events.isEmpty()) return;

        String processInstanceId = events.getFirst().getProcessInstanceId();
        validateCorrelation(hoSo, events, processInstanceId);
        Map<String, TaskState> tasks = new LinkedHashMap<>();
        Map<String, ActionState> actions = new LinkedHashMap<>();
        WorkflowProcessProjection.State processState = WorkflowProcessProjection.State.ACTIVE;
        OffsetDateTime lastEventAt = events.getFirst().getOccurredAt();
        String incidentKey = null;
        String incidentMessage = null;

        for (WorkflowEventInbox event : events) {
            JsonNode payload = payload(event);
            lastEventAt = event.getOccurredAt().isAfter(lastEventAt) ? event.getOccurredAt() : lastEventAt;
            switch (event.getEventType()) {
                case "TASK_CREATED" -> task(tasks, payload).created(event.getOccurredAt(), payload);
                case "TASK_COMPLETED" -> task(tasks, payload).completed(event.getOccurredAt(), payload);
                case "TASK_ACTION_APPLIED" -> action(actions, payload, event.getOccurredAt());
                case "PROCESS_COMPLETED" -> processState = WorkflowProcessProjection.State.COMPLETED;
                case "PROCESS_REJECTED" -> processState = WorkflowProcessProjection.State.REJECTED;
                case "PROCESS_CANCELLED" -> processState = WorkflowProcessProjection.State.CANCELLED;
                case "INCIDENT_CREATED" -> {
                    incidentKey = text(payload, "incidentKey");
                    incidentMessage = abbreviate(text(payload, "errorMessage"), 512);
                }
                default -> throw new IllegalStateException("Workflow event type khong duoc ho tro: "
                        + event.getEventType());
            }
        }

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        WorkflowProcessProjection.State finalProcessState = processState;
        taskRepository.deleteByHoSoId(hoSoId);
        List<WorkflowTaskProjection> projectedTasks = tasks.values().stream()
                .map(task -> task.toEntity(hoSoId, processInstanceId, finalProcessState, now)).toList();
        projectedTasks.forEach(task -> narrowToHoiDong(hoSoId, task));
        taskRepository.saveAll(projectedTasks);

        WorkflowProcessProjection process = processRepository.findById(processInstanceId)
                .orElseGet(WorkflowProcessProjection::new);
        process.setProcessInstanceId(processInstanceId);
        process.setHoSoId(hoSoId);
        process.setState(processState);
        process.setLastEventAt(lastEventAt);
        process.setLastIncidentKey(blankToNull(incidentKey));
        process.setLastIncidentMessage(blankToNull(incidentMessage));
        process.setUpdatedAt(now);
        processRepository.save(process);

        applyDossierProjection(hoSo, projectedTasks, actions, processState);
        events.forEach(event -> {
            event.setProcessedAt(now);
            event.setProcessingError(null);
        });
        inboxRepository.saveAll(events);
        hoSoRepository.save(hoSo);
    }

    /**
     * Gắn danh sách thành viên Hội đồng xét duyệt của hồ sơ này vào task họp hội đồng.
     *
     * <p>BPMN chỉ khai được vế tĩnh {@code candidateGroups="HDXD"/"HDXD_TD"} — nghĩa là "ai đủ tư cách
     * ngồi hội đồng", không phải "ai ở trong hội đồng của hồ sơ này". Không thu hẹp thì mọi người giữ
     * vai trò đó thấy task họp hội đồng của MỌI hồ sơ. Việc dịch nhóm sang người diễn ra ở đây, trong
     * app, đúng D9/D20 (Zeebe không biết ai thuộc nhóm nào; kiểm tra quyền nằm hoàn toàn trong code).
     *
     * <p>Chỉ điền khi Camunda không tự trả về {@code candidateUsers} — nếu một ngày BPMN gán đích danh
     * (assignee hoặc candidateUsers thật), giá trị của engine luôn thắng, không bị đè.</p>
     */
    private void narrowToHoiDong(String hoSoId, WorkflowTaskProjection task) {
        if (!task.getCandidateUsers().isEmpty() || task.getAssignee() != null) return;
        List<String> members = hoiDong.candidateUsersTheoNhom(hoSoId, task.getCandidateGroups());
        if (!members.isEmpty()) task.setCandidateUsers(new LinkedHashSet<>(members));
    }

    private static void validateCorrelation(HoSo hoSo, List<WorkflowEventInbox> events,
            String processInstanceId) {
        boolean mixed = events.stream().anyMatch(event -> !processInstanceId.equals(event.getProcessInstanceId()));
        if (mixed) throw new IllegalStateException("Mot HoSo khong duoc projection tu nhieu process instance.");
        if (hoSo.getZeebeProcessInstanceKey() != null
                && !String.valueOf(hoSo.getZeebeProcessInstanceKey()).equals(processInstanceId)) {
            throw new IllegalStateException("Workflow event khong khop process instance cua HoSo " + hoSo.getId());
        }
        if (hoSo.getZeebeProcessInstanceKey() == null) {
            try {
                hoSo.setZeebeProcessInstanceKey(Long.valueOf(processInstanceId));
            } catch (NumberFormatException invalid) {
                throw new IllegalStateException("processInstanceId khong hop le: " + processInstanceId, invalid);
            }
        }
    }

    private static void applyDossierProjection(HoSo hoSo, List<WorkflowTaskProjection> tasks,
            Map<String, ActionState> actions, WorkflowProcessProjection.State processState) {
        materializeMissingSteps(hoSo, tasks);
        Map<String, List<WorkflowTaskProjection>> byDefinition = new LinkedHashMap<>();
        tasks.forEach(task -> byDefinition.computeIfAbsent(task.getTaskDefinitionKey(), ignored -> new ArrayList<>())
                .add(task));
        int current = 0;
        int lastDone = 0;
        for (DossierStep step : hoSo.getSteps()) {
            if (step.getBuocIndex() == 0) continue;
            List<WorkflowTaskProjection> matches = byDefinition.getOrDefault(step.getTaskDefinitionKey(), List.of());
            boolean active = matches.stream().anyMatch(task -> task.getState() == WorkflowTaskProjection.State.ACTIVE)
                    && processState == WorkflowProcessProjection.State.ACTIVE;
            boolean completed = matches.stream().anyMatch(task -> task.getState() == WorkflowTaskProjection.State.COMPLETED);
            step.setTrangThai(active ? StepStatus.CURRENT : completed ? StepStatus.DONE : StepStatus.PENDING);
            if (active) {
                current = current == 0 ? step.getBuocIndex() : Math.min(current, step.getBuocIndex());
                WorkflowTaskProjection activeTask = matches.stream()
                        .filter(task -> task.getState() == WorkflowTaskProjection.State.ACTIVE).findFirst().orElseThrow();
                step.setNguoi(blankToNull(activeTask.getAssignee()));
                // A BPMN return may create a new task execution for a step that was already completed.
                // The step row represents the current stage, so completion metadata from the prior
                // execution must not leak into the reopened task.
                step.setThoiDiem(null);
                step.setYKien(null);
                step.setHanXuLy(activeTask.getDueAt() == null ? null : activeTask.getDueAt().toString());
                if (activeTask.getFormKey() != null) step.setFormKey(activeTask.getFormKey());
            } else if (completed) {
                lastDone = Math.max(lastDone, step.getBuocIndex());
                OffsetDateTime completedAt = matches.stream().map(WorkflowTaskProjection::getCompletedAt)
                        .filter(value -> value != null).max(OffsetDateTime::compareTo).orElse(null);
                step.setThoiDiem(completedAt == null ? null : completedAt.toString());
                matches.stream().map(task -> actions.get(task.getTaskKey())).filter(value -> value != null)
                        .max(java.util.Comparator.comparing(ActionState::occurredAt)).ifPresent(action -> {
                            step.setNguoi(blankToNull(action.actorId()));
                            step.setYKien(blankToNull(action.comment()));
                            step.setThoiDiem(action.occurredAt().toString());
                            step.setFormDataJson(blankToNull(action.formDataJson()));
                        });
            }
        }
        hoSo.setBuocHienTai(current == 0 ? lastDone : current);
        hoSo.setTrangThai(switch (processState) {
            case ACTIVE -> DossierStatus.PROCESSING;
            case COMPLETED -> DossierStatus.APPROVED;
            case REJECTED -> DossierStatus.REJECTED;
            case CANCELLED -> DossierStatus.CANCELLED;
        });
    }

    private static void materializeMissingSteps(HoSo hoSo, List<WorkflowTaskProjection> tasks) {
        Set<String> existing = hoSo.getSteps().stream().map(DossierStep::getTaskDefinitionKey)
                .filter(value -> value != null && !value.isBlank()).collect(java.util.stream.Collectors.toSet());
        int nextIndex = hoSo.getSteps().stream().mapToInt(DossierStep::getBuocIndex).max().orElse(0) + 1;
        for (WorkflowTaskProjection task : tasks.stream()
                .sorted(java.util.Comparator.comparing(WorkflowTaskProjection::getCreatedAt,
                        java.util.Comparator.nullsLast(java.util.Comparator.naturalOrder())))
                .toList()) {
            if (!existing.add(task.getTaskDefinitionKey())) continue;
            DossierStep step = new DossierStep();
            step.setHoSo(hoSo);
            step.setBuocIndex(nextIndex++);
            step.setTaskDefinitionKey(task.getTaskDefinitionKey());
            step.setTen(task.getTaskName());
            step.setVaiTro(String.join(", ", task.getCandidateGroups()));
            step.setVaiTroCodes(new LinkedHashSet<>(task.getCandidateGroups()));
            step.setFormKey(task.getFormKey());
            step.setTrangThai(StepStatus.PENDING);
            hoSo.getSteps().add(step);
        }
    }

    private void action(Map<String, ActionState> actions, JsonNode payload, OffsetDateTime occurredAt) {
        String taskKey = required(payload, "taskKey");
        String formDataJson = payload.has("formData") ? writeFormData(payload.path("formData")) : null;
        ActionState incoming = new ActionState(text(payload, "actorId"), text(payload, "comment"),
                formDataJson, occurredAt);
        actions.merge(taskKey, incoming,
                (left, right) -> right.occurredAt().isAfter(left.occurredAt()) ? right : left);
    }

    private String writeFormData(JsonNode formData) {
        try { return json.writeValueAsString(formData); }
        catch (Exception invalid) { return null; }
    }

    private TaskState task(Map<String, TaskState> tasks, JsonNode payload) {
        String taskKey = required(payload, "taskKey");
        return tasks.computeIfAbsent(taskKey, TaskState::new);
    }

    private JsonNode payload(WorkflowEventInbox event) {
        try {
            return json.readTree(event.getPayloadJson()).path("payload");
        } catch (Exception invalid) {
            throw new IllegalStateException("Workflow inbox payload khong hop le: " + event.getEventId(), invalid);
        }
    }

    private static String required(JsonNode node, String name) {
        String value = text(node, name);
        if (value.isBlank()) throw new IllegalStateException("Workflow task payload thieu " + name);
        return value;
    }
    private static String text(JsonNode node, String name) { return node.path(name).asText("").trim(); }
    private static String blankToNull(String value) { return value == null || value.isBlank() ? null : value; }
    private static String abbreviate(String value, int max) { return value.length() <= max ? value : value.substring(0, max); }

    private static final class TaskState {
        private final String taskKey;
        private String definitionKey = "";
        private String name = "";
        private String assignee = "";
        private Set<String> candidateUsers = Set.of();
        private Set<String> candidateGroups = Set.of();
        private String formKey;
        private OffsetDateTime dueAt;
        private OffsetDateTime createdAt;
        private OffsetDateTime completedAt;

        private TaskState(String taskKey) { this.taskKey = taskKey; }
        private void created(OffsetDateTime at, JsonNode payload) {
            if (createdAt == null || at.isBefore(createdAt)) createdAt = at;
            merge(payload);
        }
        private void completed(OffsetDateTime at, JsonNode payload) {
            if (completedAt == null || at.isAfter(completedAt)) completedAt = at;
            merge(payload);
        }
        private void merge(JsonNode payload) {
            String incomingDefinition = text(payload, "taskDefinitionKey");
            if (!incomingDefinition.isBlank()) definitionKey = incomingDefinition;
            String incomingName = text(payload, "name");
            if (!incomingName.isBlank()) name = incomingName;
            assignee = text(payload, "assignee");
            candidateUsers = values(payload.path("candidateUsers"));
            candidateGroups = values(payload.path("candidateGroups"));
            formKey = blankToNull(text(payload, "formKey"));
            String due = text(payload, "dueDate");
            if (!due.isBlank()) dueAt = OffsetDateTime.parse(due);
        }
        private WorkflowTaskProjection toEntity(String hoSoId, String processInstanceId,
                WorkflowProcessProjection.State processState, OffsetDateTime now) {
            if (definitionKey.isBlank()) throw new IllegalStateException("Workflow task payload thieu taskDefinitionKey");
            WorkflowTaskProjection entity = new WorkflowTaskProjection();
            entity.setTaskKey(taskKey);
            entity.setHoSoId(hoSoId);
            entity.setProcessInstanceId(processInstanceId);
            entity.setTaskDefinitionKey(definitionKey);
            entity.setTaskName(name.isBlank() ? definitionKey : name);
            entity.setState(completedAt != null || processState != WorkflowProcessProjection.State.ACTIVE
                    ? WorkflowTaskProjection.State.COMPLETED : WorkflowTaskProjection.State.ACTIVE);
            entity.setAssignee(blankToNull(assignee));
            entity.setCandidateUsers(new LinkedHashSet<>(candidateUsers));
            entity.setCandidateGroups(new LinkedHashSet<>(candidateGroups));
            entity.setCreatedAt(createdAt);
            entity.setCompletedAt(completedAt);
            entity.setDueAt(dueAt);
            entity.setFormKey(formKey);
            entity.setUpdatedAt(now);
            return entity;
        }
        private static Set<String> values(JsonNode array) {
            if (!array.isArray()) return Set.of();
            Set<String> values = new LinkedHashSet<>();
            array.forEach(value -> { if (!value.asText().isBlank()) values.add(value.asText().trim()); });
            return values;
        }
    }

    private record ActionState(String actorId, String comment, String formDataJson, OffsetDateTime occurredAt) {}
}
