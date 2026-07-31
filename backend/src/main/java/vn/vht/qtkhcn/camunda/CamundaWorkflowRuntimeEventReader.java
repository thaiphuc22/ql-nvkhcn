package vn.vht.qtkhcn.camunda;

import io.camunda.client.CamundaClient;
import io.camunda.client.api.search.enums.ElementInstanceState;
import io.camunda.client.api.search.enums.ElementInstanceType;
import io.camunda.client.api.search.response.ElementInstance;
import io.camunda.client.api.search.response.Job;
import io.camunda.client.api.search.enums.ProcessInstanceState;
import io.camunda.client.api.search.enums.UserTaskState;
import io.camunda.client.api.search.response.UserTask;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;
import vn.vht.qtkhcn.domain.WorkflowActionInbox;
import vn.vht.qtkhcn.repository.WorkflowActionInboxRepository;
import vn.vht.qtkhcn.workflow.WorkflowRuntimeEvent;
import vn.vht.qtkhcn.workflow.WorkflowRuntimeEventReader;

@Component
public class CamundaWorkflowRuntimeEventReader implements WorkflowRuntimeEventReader {
    private static final String JOB_BACKED_USER_TASK = "io.camunda.zeebe:userTask";
    // RD02.02: endEvent "Hồ sơ không được thông qua" (nhánh không đạt điểm HĐXD Tập đoàn phiên 2, T24).
    private static final String REJECTING_END_EVENT_ID = "End_KhongThongQua";
    private final CamundaClient client;
    private final BpmnUserTaskMetadataCatalog metadata;
    private final WorkflowActionInboxRepository actionInbox;

    public CamundaWorkflowRuntimeEventReader(CamundaClient client, BpmnUserTaskMetadataCatalog metadata,
            WorkflowActionInboxRepository actionInbox) {
        this.client = client;
        this.metadata = metadata;
        this.actionInbox = actionInbox;
    }

    @Override
    public List<WorkflowRuntimeEvent> read(long processInstanceKey) {
        List<WorkflowRuntimeEvent> result = new ArrayList<>();
        var tasks = client.newUserTaskSearchRequest()
                .filter(f -> f.processInstanceKey(processInstanceKey))
                .page(p -> p.limit(100)).send().join().items();
        tasks.forEach(task -> addNativeTaskEvents(task, result));
        // Native user-task search can return non-empty but still miss items (observed live on
        // RD02.02 v4: it silently dropped a COMPLETED and an ACTIVE task from the same instance).
        // Always cross-check against element-instance/job search rather than gating on isEmpty();
        // WorkflowEventCollector.collect() dedupes by sourceKey so overlap between the two branches
        // is harmless.
        readJobBackedTasks(processInstanceKey, result);

        var instances = client.newProcessInstanceSearchRequest()
                .filter(f -> f.processInstanceKey(processInstanceKey))
                .page(p -> p.limit(1)).send().join().items();
        if (!instances.isEmpty()) {
            var instance = instances.getFirst();
            if (instance.getState() == ProcessInstanceState.COMPLETED
                    || instance.getState() == ProcessInstanceState.TERMINATED) {
                var type = instance.getState() == ProcessInstanceState.COMPLETED
                        ? (reachedRejectingEndEvent(processInstanceKey)
                                ? WorkflowRuntimeEvent.EventType.PROCESS_REJECTED
                                : WorkflowRuntimeEvent.EventType.PROCESS_COMPLETED)
                        : rejected(processInstanceKey)
                                ? WorkflowRuntimeEvent.EventType.PROCESS_REJECTED
                                : WorkflowRuntimeEvent.EventType.PROCESS_CANCELLED;
                result.add(new WorkflowRuntimeEvent(type.name() + ":" + processInstanceKey,
                        type, nonNull(instance.getEndDate()), Map.of(
                                "processDefinitionId", instance.getProcessDefinitionId(),
                                "processDefinitionVersion", instance.getProcessDefinitionVersion(),
                                "camundaState", instance.getState().name())));
            }
        }

        var incidents = client.newIncidentSearchRequest()
                .filter(f -> f.processInstanceKey(processInstanceKey))
                .page(p -> p.limit(100)).send().join().items();
        incidents.forEach(incident -> result.add(new WorkflowRuntimeEvent(
                "INCIDENT_CREATED:" + incident.getIncidentKey(),
                WorkflowRuntimeEvent.EventType.INCIDENT_CREATED, nonNull(incident.getCreationTime()),
                Map.of("incidentKey", String.valueOf(incident.getIncidentKey()),
                        "elementId", safe(incident.getElementId()),
                        "errorType", incident.getErrorType().name(),
                        "errorMessage", safe(incident.getErrorMessage())))));
        return result;
    }

    private boolean rejected(long processInstanceKey) {
        return actionInbox.existsByProcessInstanceIdAndActionCodeAndStatusIn(
                String.valueOf(processInstanceKey), "REJECT_STEP",
                List.of(WorkflowActionInbox.Status.UNKNOWN, WorkflowActionInbox.Status.COMPLETED));
    }

    /**
     * RD02.02: khi HĐXD Tập đoàn phiên 2 (T24) chấm điểm không đạt, quy trình kết thúc BÌNH THƯỜNG
     * ở endEvent "End_KhongThongQua" (khác với GCheck, vốn quay lại T02 thay vì kết thúc) — Camunda
     * báo ProcessInstanceState.COMPLETED giống hệt nhánh thành công, khác với REJECT_STEP (nơi
     * process bị huỷ, TERMINATED). Phải tra thêm endEvent nào đã COMPLETED để phân biệt, rồi báo
     * dossier là REJECTED thay vì COMPLETED — nhất quán với cách người dùng "Từ chối" thủ công.
     */
    private boolean reachedRejectingEndEvent(long processInstanceKey) {
        return client.newElementInstanceSearchRequest()
                .filter(f -> f.processInstanceKey(processInstanceKey).type(ElementInstanceType.END_EVENT)
                        .elementId(REJECTING_END_EVENT_ID).state(ElementInstanceState.COMPLETED))
                .page(p -> p.limit(1)).send().join().items().stream().findAny().isPresent();
    }

    private void addNativeTaskEvents(UserTask task, List<WorkflowRuntimeEvent> result) {
        // History search returns the latest task state. Emit its creation even when the
        // collector first sees the task after it was completed/cancelled during downtime.
        if (task.getCreationDate() != null) {
            result.add(taskEvent(task, WorkflowRuntimeEvent.EventType.TASK_CREATED,
                    task.getCreationDate(), "created"));
        }
        if (task.getState() == UserTaskState.COMPLETED) {
            result.add(taskEvent(task, WorkflowRuntimeEvent.EventType.TASK_COMPLETED,
                    task.getCompletionDate(), "completed"));
        }
    }

    /**
     * The native {@code newUserTaskSearchRequest()} view has been observed live to return an
     * incomplete result set (non-empty, but missing items) as well as an empty one — so this runs
     * unconditionally for every process instance, not just job-backed user tasks or empty native
     * results. Correlates the element-instance and job views (job key == user task key for native
     * {@code zeebe:userTask}s) and recovers assignment/form data from the exact deployed BPMN.
     */
    private void readJobBackedTasks(long processInstanceKey, List<WorkflowRuntimeEvent> result) {
        List<ElementInstance> elements = client.newElementInstanceSearchRequest()
                .filter(f -> f.processInstanceKey(processInstanceKey).type(ElementInstanceType.USER_TASK))
                .page(p -> p.limit(100)).send().join().items();
        if (elements.isEmpty()) return;

        Map<Long, Job> jobsByElement = client.newJobSearchRequest()
                .filter(f -> f.processInstanceKey(processInstanceKey))
                .page(p -> p.limit(100)).send().join().items().stream()
                .filter(job -> JOB_BACKED_USER_TASK.equals(job.getType()))
                .collect(Collectors.toMap(Job::getElementInstanceKey, Function.identity(),
                        (left, right) -> left.getJobKey() >= right.getJobKey() ? left : right));

        for (ElementInstance element : elements) {
            Job job = jobsByElement.get(element.getElementInstanceKey());
            // Without the job key the projected task cannot be executed safely. Search is eventually
            // consistent, so skip it and let the scheduled collector retry on the next cycle.
            if (job == null) continue;
            var taskMetadata = metadata.resolve(element.getProcessDefinitionKey(), element.getElementId());
            if (element.getStartDate() != null) {
                result.add(jobBackedTaskEvent(element, job, taskMetadata,
                        WorkflowRuntimeEvent.EventType.TASK_CREATED, element.getStartDate(), "created"));
            }
            if (element.getState() == ElementInstanceState.COMPLETED) {
                result.add(jobBackedTaskEvent(element, job, taskMetadata,
                        WorkflowRuntimeEvent.EventType.TASK_COMPLETED, element.getEndDate(), "completed"));
            }
        }
    }

    private static WorkflowRuntimeEvent taskEvent(UserTask task, WorkflowRuntimeEvent.EventType type,
            OffsetDateTime occurredAt, String suffix) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("taskKey", String.valueOf(task.getUserTaskKey()));
        payload.put("taskDefinitionKey", safe(task.getElementId()));
        payload.put("name", safe(task.getName()));
        payload.put("assignee", safe(task.getAssignee()));
        payload.put("candidateGroups", task.getCandidateGroups() == null ? List.of() : task.getCandidateGroups());
        payload.put("candidateUsers", task.getCandidateUsers() == null ? List.of() : task.getCandidateUsers());
        if (task.getDueDate() != null) payload.put("dueDate", task.getDueDate().toString());
        if (task.getFormKey() != null) payload.put("formKey", String.valueOf(task.getFormKey()));
        if (task.getExternalFormReference() != null) payload.put("externalFormReference", task.getExternalFormReference());
        return new WorkflowRuntimeEvent(type.name() + ":" + task.getUserTaskKey() + ":" + suffix,
                type, nonNull(occurredAt), payload);
    }

    private static WorkflowRuntimeEvent jobBackedTaskEvent(ElementInstance element, Job job,
            BpmnUserTaskMetadataCatalog.UserTaskMetadata metadata, WorkflowRuntimeEvent.EventType type,
            OffsetDateTime occurredAt, String suffix) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("taskKey", String.valueOf(job.getJobKey()));
        payload.put("taskDefinitionKey", safe(element.getElementId()));
        payload.put("name", metadata.name().isBlank() ? safe(element.getElementName()) : metadata.name());
        payload.put("assignee", metadata.assignee());
        payload.put("candidateGroups", metadata.candidateGroups());
        payload.put("candidateUsers", metadata.candidateUsers());
        if (!metadata.formKey().isBlank()) payload.put("formKey", metadata.formKey());
        return new WorkflowRuntimeEvent(type.name() + ":" + job.getJobKey() + ":" + suffix,
                type, nonNull(occurredAt), payload);
    }

    private static OffsetDateTime nonNull(OffsetDateTime value) {
        return value == null ? OffsetDateTime.now(ZoneOffset.UTC) : value;
    }
    private static String safe(String value) { return value == null ? "" : value; }
}
