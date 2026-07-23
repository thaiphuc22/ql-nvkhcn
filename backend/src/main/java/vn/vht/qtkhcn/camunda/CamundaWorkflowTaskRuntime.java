package vn.vht.qtkhcn.camunda;

import io.camunda.client.CamundaClient;
import io.camunda.client.api.search.enums.JobState;
import io.camunda.client.api.search.enums.UserTaskState;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import vn.vht.qtkhcn.service.TaskActionException;

/** Exact-key lookup/execution boundary for native and legacy job-backed Camunda user tasks. */
@Component
public class CamundaWorkflowTaskRuntime {
    private static final String JOB_BACKED_USER_TASK = "io.camunda.zeebe:userTask";
    private final CamundaClient client;
    private final BpmnUserTaskMetadataCatalog metadata;

    public CamundaWorkflowTaskRuntime(CamundaClient client, BpmnUserTaskMetadataCatalog metadata) {
        this.client = client;
        this.metadata = metadata;
    }

    public TaskSnapshot requireActive(String taskKey) {
        TaskSnapshot task = find(taskKey).orElseThrow(() -> new TaskActionException("TASK_NOT_FOUND",
                HttpStatus.NOT_FOUND, "Không tìm thấy workflow task " + taskKey + "."));
        if (!task.active()) {
            throw new TaskActionException("TASK_NOT_ACTIVE", HttpStatus.CONFLICT,
                    "Workflow task " + taskKey + " không còn ACTIVE.");
        }
        return task;
    }

    public Optional<TaskSnapshot> find(String taskKey) {
        long key = parseKey(taskKey);
        var nativeTasks = client.newUserTaskSearchRequest()
                .filter(f -> f.userTaskKey(key)).page(p -> p.limit(1)).send().join().items();
        if (!nativeTasks.isEmpty()) {
            var task = nativeTasks.getFirst();
            return Optional.of(new TaskSnapshot(taskKey, String.valueOf(task.getProcessInstanceKey()),
                    "", task.getElementId(), task.getName(), task.getAssignee(),
                    set(task.getCandidateUsers()), set(task.getCandidateGroups()),
                    task.getState() == UserTaskState.CREATED, true));
        }

        var jobs = client.newJobSearchRequest().filter(f -> f.jobKey(key)).page(p -> p.limit(1))
                .send().join().items();
        if (jobs.isEmpty() || !JOB_BACKED_USER_TASK.equals(jobs.getFirst().getType())) return Optional.empty();
        var job = jobs.getFirst();
        var taskMetadata = metadata.resolve(job.getProcessDefinitionKey(),
                job.getProcessDefinitionId(), job.getElementId());
        return Optional.of(new TaskSnapshot(taskKey, String.valueOf(job.getProcessInstanceKey()),
                job.getProcessDefinitionId(), job.getElementId(), taskMetadata.name(), taskMetadata.assignee(),
                Set.copyOf(taskMetadata.candidateUsers()), Set.copyOf(taskMetadata.candidateGroups()),
                job.getState() == JobState.CREATED, false));
    }

    public void apply(TaskSnapshot task, String actionCode, Map<String, Object> variables) {
        long taskKey = parseKey(task.taskKey());
        if ("REJECT_STEP".equals(actionCode)) {
            client.newCancelInstanceCommand(Long.parseLong(task.processInstanceId())).send().join();
            return;
        }
        if (task.nativeUserTask()) {
            client.newCompleteUserTaskCommand(taskKey).variables(variables).send().join();
        } else {
            client.newCompleteCommand(taskKey).variables(variables).send().join();
        }
    }

    private static long parseKey(String value) {
        try { return Long.parseLong(value); }
        catch (NumberFormatException invalid) {
            throw new TaskActionException("TASK_KEY_INVALID", HttpStatus.BAD_REQUEST,
                    "taskKey phải là Camunda key hợp lệ.");
        }
    }

    private static Set<String> set(List<String> values) {
        return values == null ? Set.of() : Set.copyOf(values);
    }

    public record TaskSnapshot(String taskKey, String processInstanceId, String processDefinitionId,
            String taskDefinitionKey, String name, String assignee, Set<String> candidateUsers,
            Set<String> candidateGroups, boolean active, boolean nativeUserTask) {
        public TaskSnapshot {
            candidateUsers = Set.copyOf(candidateUsers);
            candidateGroups = Set.copyOf(candidateGroups);
        }
    }
}
