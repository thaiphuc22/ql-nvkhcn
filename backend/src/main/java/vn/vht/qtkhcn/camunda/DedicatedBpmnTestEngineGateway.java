package vn.vht.qtkhcn.camunda;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.camunda.client.CamundaClient;
import io.camunda.client.api.search.enums.ElementInstanceState;
import io.camunda.client.api.search.enums.IncidentState;
import io.camunda.client.api.search.enums.JobState;
import io.camunda.client.api.search.enums.UserTaskState;
import java.util.*;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import vn.vht.qtkhcn.web.dto.BpmnTestSessionResponse;

@Component
@ConditionalOnProperty(name = "qtkhcn.bpmn-test.enabled", havingValue = "true")
public class DedicatedBpmnTestEngineGateway implements BpmnTestEngineGateway {
    private static final String JOB_USER_TASK = "io.camunda.zeebe:userTask";
    private final CamundaClient client;
    private final ObjectMapper json;

    public DedicatedBpmnTestEngineGateway(BpmnTestClient testClient,
            @Qualifier("bpmnTestObjectMapper") ObjectMapper json) {
        this.client = testClient.client();
        this.json = json;
    }

    @Override
    public StartedInstance deployAndStart(byte[] bpmn, String resourceName, Map<String, Object> variables) {
        var deployment = client.newDeployResourceCommand().addResourceBytes(bpmn, resourceName).send().join();
        if (deployment.getProcesses().size() != 1) {
            throw new IllegalStateException("Test engine phải deploy đúng một process definition.");
        }
        long definitionKey = deployment.getProcesses().getFirst().getProcessDefinitionKey();
        var instance = client.newCreateInstanceCommand().processDefinitionKey(definitionKey)
                .variables(variables).send().join();
        return new StartedInstance(definitionKey, instance.getProcessInstanceKey());
    }

    @Override
    public EngineSnapshot snapshot(long instanceKey) {
        var instances = client.newProcessInstanceSearchRequest()
                .filter(f -> f.processInstanceKey(instanceKey)).page(p -> p.limit(1)).send().join().items();
        String state = instances.isEmpty() ? "INDEXING" : instances.getFirst().getState().name();
        var elements = client.newElementInstanceSearchRequest()
                .filter(f -> f.processInstanceKey(instanceKey).state(ElementInstanceState.ACTIVE))
                .page(p -> p.limit(100)).send().join().items().stream()
                .map(e -> new BpmnTestSessionResponse.Element(e.getElementInstanceKey(), e.getElementId(),
                        e.getElementName(), e.getType().name(), e.getState().name())).toList();

        List<BpmnTestSessionResponse.Task> tasks = new ArrayList<>();
        client.newUserTaskSearchRequest().filter(f -> f.processInstanceKey(instanceKey).state(UserTaskState.CREATED))
                .page(p -> p.limit(100)).send().join().items().forEach(t -> tasks.add(
                        new BpmnTestSessionResponse.Task(t.getUserTaskKey(), t.getElementId(), t.getName(),
                                t.getState().name(), t.getCandidateGroups())));

        var jobs = client.newJobSearchRequest().filter(f -> f.processInstanceKey(instanceKey).state(JobState.CREATED))
                .page(p -> p.limit(100)).send().join().items();
        jobs.stream().filter(j -> JOB_USER_TASK.equals(j.getType())).forEach(j -> tasks.add(
                new BpmnTestSessionResponse.Task(j.getJobKey(), j.getElementId(), j.getElementId(),
                        j.getState().name(), List.of())));
        var blocked = jobs.stream().filter(j -> !JOB_USER_TASK.equals(j.getType()))
                .map(j -> new BpmnTestSessionResponse.BlockedJob(j.getJobKey(), j.getElementId(), j.getType(),
                        "Không có worker production trên test engine; job chỉ chạy khi type nằm trong allowlist mock."))
                .toList();

        Map<String, Object> variables = new TreeMap<>();
        client.newVariableSearchRequest().filter(f -> f.processInstanceKey(instanceKey)).withFullValues()
                .page(p -> p.limit(1000)).send().join().items().forEach(v -> {
                    try { variables.put(v.getName(), json.readValue(v.getValue(), Object.class)); }
                    catch (Exception ignored) { variables.put(v.getName(), v.getValue()); }
                });
        var incidents = client.newIncidentSearchRequest()
                .filter(f -> f.processInstanceKey(instanceKey).state(IncidentState.ACTIVE))
                .page(p -> p.limit(100)).send().join().items().stream()
                .map(i -> new BpmnTestSessionResponse.Incident(i.getIncidentKey(), i.getElementId(),
                        i.getErrorType().name(), i.getErrorMessage(), i.getState().name())).toList();
        return new EngineSnapshot(state, List.copyOf(elements), List.copyOf(tasks), variables, incidents, blocked);
    }

    @Override
    public void completeTask(long instanceKey, long taskKey, Map<String, Object> variables) {
        var nativeTasks = client.newUserTaskSearchRequest().filter(f -> f.userTaskKey(taskKey)
                .processInstanceKey(instanceKey).state(UserTaskState.CREATED)).page(p -> p.limit(1))
                .send().join().items();
        if (!nativeTasks.isEmpty()) {
            client.newCompleteUserTaskCommand(taskKey).variables(variables).send().join();
            return;
        }
        var jobs = client.newJobSearchRequest().filter(f -> f.processInstanceKey(instanceKey)
                .state(JobState.CREATED)).page(p -> p.limit(100)).send().join().items();
        if (jobs.stream().noneMatch(j -> j.getJobKey() == taskKey && JOB_USER_TASK.equals(j.getType()))) {
            throw new NoSuchElementException("User task " + taskKey + " không còn active trong test session.");
        }
        client.newCompleteCommand(taskKey).variables(variables).send().join();
    }

    @Override public void cancel(long processInstanceKey) {
        client.newCancelInstanceCommand(processInstanceKey).send().join();
    }

    @Override public void setVariables(long elementInstanceKey, Map<String, Object> variables) {
        client.newSetVariablesCommand(elementInstanceKey).variables(variables).send().join();
    }

    @Override public void resolveIncident(long incidentKey) {
        client.newResolveIncidentCommand(incidentKey).send().join();
    }

    @Override
    public void bypassServiceTask(long instanceKey, long jobKey, Map<String, Object> variables) {
        var jobs = client.newJobSearchRequest().filter(f -> f.processInstanceKey(instanceKey)
                .state(JobState.CREATED)).page(p -> p.limit(100)).send().join().items();
        if (jobs.stream().noneMatch(j -> j.getJobKey() == jobKey && !JOB_USER_TASK.equals(j.getType()))) {
            throw new NoSuchElementException("Service task job " + jobKey + " không còn BLOCKED trong test session.");
        }
        client.newCompleteCommand(jobKey).variables(variables).send().join();
    }
}
