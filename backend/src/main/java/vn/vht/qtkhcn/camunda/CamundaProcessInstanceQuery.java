package vn.vht.qtkhcn.camunda;

import io.camunda.client.CamundaClient;
import io.camunda.client.api.search.enums.ElementInstanceState;
import io.camunda.client.api.search.enums.ElementInstanceType;
import io.camunda.client.api.search.enums.ProcessInstanceState;
import io.camunda.client.api.search.response.ElementInstance;
import io.camunda.client.api.search.response.ProcessInstance;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/**
 * Read-only view of Camunda runtime state for the "Đã deploy" grid: how many instances are still
 * running per process, and where each of them currently sits.
 *
 * <p>Camunda is a separate system with its own availability; every call here can fail independently
 * of PostgreSQL. Callers get the failure as data (see {@link ProcessInstanceOverviewService}) so the
 * catalog itself keeps rendering when the engine is down.
 */
@Component
public class CamundaProcessInstanceQuery {

    /** Container/flow elements are never a meaningful "bước hiện tại" for a human reading the grid. */
    private static final Set<ElementInstanceType> NOT_A_STEP = EnumSet.of(
            ElementInstanceType.PROCESS, ElementInstanceType.SUB_PROCESS,
            ElementInstanceType.EVENT_SUB_PROCESS, ElementInstanceType.AD_HOC_SUB_PROCESS,
            ElementInstanceType.MULTI_INSTANCE_BODY, ElementInstanceType.SEQUENCE_FLOW);

    private static final int INSTANCE_PAGE_LIMIT = 1000;
    private static final int ELEMENT_PAGE_LIMIT = 1000;

    private final CamundaClient client;
    private final BpmnUserTaskMetadataCatalog metadata;

    public CamundaProcessInstanceQuery(CamundaClient client, BpmnUserTaskMetadataCatalog metadata) {
        this.client = client;
        this.metadata = metadata;
    }

    /** Running instance count keyed by {@code bpmnProcessId}, across every deployed version. */
    public Map<String, Integer> runningCountsByProcessId() {
        Map<String, Integer> counts = new LinkedHashMap<>();
        for (ProcessInstance instance : searchActiveInstances(null)) {
            counts.merge(instance.getProcessDefinitionId(), 1, Integer::sum);
        }
        return counts;
    }

    /** Running instances of one process, newest first, each with the elements currently active. */
    public List<RunningInstance> runningInstances(String bpmnProcessId) {
        List<ProcessInstance> instances = searchActiveInstances(bpmnProcessId);
        if (instances.isEmpty()) return List.of();

        Map<Long, List<CurrentStep>> stepsByInstance = client.newElementInstanceSearchRequest()
                .filter(f -> f.processDefinitionId(bpmnProcessId).state(ElementInstanceState.ACTIVE))
                .page(p -> p.limit(ELEMENT_PAGE_LIMIT)).send().join().items().stream()
                .filter(element -> !NOT_A_STEP.contains(element.getType()))
                .collect(Collectors.groupingBy(ElementInstance::getProcessInstanceKey,
                        Collectors.mapping(this::toStep, Collectors.toList())));

        return instances.stream()
                .sorted(Comparator.comparing(ProcessInstance::getStartDate,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(instance -> new RunningInstance(
                        String.valueOf(instance.getProcessInstanceKey()),
                        safe(instance.getBusinessId()),
                        instance.getProcessDefinitionVersion() == null ? 0 : instance.getProcessDefinitionVersion(),
                        instance.getStartDate(),
                        Boolean.TRUE.equals(instance.getHasIncident()),
                        stepsByInstance.getOrDefault(instance.getProcessInstanceKey(), List.of()).stream()
                                .sorted(Comparator.comparing(CurrentStep::startedAt,
                                        Comparator.nullsLast(Comparator.naturalOrder())))
                                .toList()))
                .toList();
    }

    /** Snapshot used by the monitoring screen, newest first, across all deployed processes. */
    public List<MonitoredInstance> monitoredInstances() {
        List<ProcessInstance> instances = client.newProcessInstanceSearchRequest()
                .page(p -> p.limit(INSTANCE_PAGE_LIMIT)).send().join().items();
        if (instances.isEmpty()) return List.of();

        Map<Long, List<CurrentStep>> stepsByInstance = client.newElementInstanceSearchRequest()
                .filter(f -> f.state(ElementInstanceState.ACTIVE))
                .page(p -> p.limit(ELEMENT_PAGE_LIMIT)).send().join().items().stream()
                .filter(element -> !NOT_A_STEP.contains(element.getType()))
                .collect(Collectors.groupingBy(ElementInstance::getProcessInstanceKey,
                        Collectors.mapping(this::toStep, Collectors.toList())));

        return instances.stream()
                .sorted(Comparator.comparing(ProcessInstance::getStartDate,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(instance -> new MonitoredInstance(
                        String.valueOf(instance.getProcessInstanceKey()), safe(instance.getBusinessId()),
                        safe(instance.getProcessDefinitionId()),
                        instance.getProcessDefinitionVersion() == null ? 0 : instance.getProcessDefinitionVersion(),
                        instance.getState() == null ? "UNKNOWN" : instance.getState().name(),
                        instance.getStartDate(), instance.getEndDate(), Boolean.TRUE.equals(instance.getHasIncident()),
                        stepsByInstance.getOrDefault(instance.getProcessInstanceKey(), List.of()).stream()
                                .sorted(Comparator.comparing(CurrentStep::startedAt,
                                        Comparator.nullsLast(Comparator.naturalOrder())))
                                .toList()))
                .toList();
    }

    private List<ProcessInstance> searchActiveInstances(String bpmnProcessId) {
        return client.newProcessInstanceSearchRequest()
                .filter(f -> {
                    f.state(ProcessInstanceState.ACTIVE);
                    if (bpmnProcessId != null) f.processDefinitionId(bpmnProcessId);
                })
                .page(p -> p.limit(INSTANCE_PAGE_LIMIT)).send().join().items();
    }

    private CurrentStep toStep(ElementInstance element) {
        return new CurrentStep(safe(element.getElementId()), stepName(element),
                element.getType() == null ? ElementInstanceType.UNKNOWN.name() : element.getType().name(),
                element.getStartDate(), Boolean.TRUE.equals(element.getIncident()));
    }

    /**
     * Names come from the deployed BPMN, not from {@code getElementName()}. Camunda serves
     * {@code application/json} with no charset parameter, so the client decodes Vietnamese element
     * names with the platform default (cp1252 on Windows) and returns mojibake. The BPMN catalog is
     * read as UTF-8 from PostgreSQL and is already the source of task names for the worklist
     * projection, so this also keeps naming consistent across screens.
     */
    private String stepName(ElementInstance element) {
        String fromBpmn = metadata.resolve(element.getProcessDefinitionKey(), element.getElementId()).name();
        if (!fromBpmn.isBlank()) return fromBpmn;
        // Non-user-task elements are absent from the catalog; fall back rather than show nothing.
        String fromEngine = element.getElementName();
        return fromEngine == null || fromEngine.isBlank() ? safe(element.getElementId()) : fromEngine;
    }

    private static String safe(String value) {
        return value == null ? "" : value;
    }

    public record CurrentStep(String elementId, String name, String type, OffsetDateTime startedAt,
            boolean hasIncident) {
    }

    public record RunningInstance(String processInstanceKey, String businessId, int version,
            OffsetDateTime startedAt, boolean hasIncident, List<CurrentStep> currentSteps) {
        public RunningInstance {
            currentSteps = List.copyOf(currentSteps);
        }
    }

    public record MonitoredInstance(String processInstanceKey, String businessId, String bpmnProcessId,
            int version, String state, OffsetDateTime startedAt, OffsetDateTime endedAt,
            boolean hasIncident, List<CurrentStep> currentSteps) {
        public MonitoredInstance {
            currentSteps = List.copyOf(currentSteps);
        }
    }
}
