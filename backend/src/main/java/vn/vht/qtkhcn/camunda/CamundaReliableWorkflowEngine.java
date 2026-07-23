package vn.vht.qtkhcn.camunda;

import io.camunda.client.CamundaClient;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;
import vn.vht.qtkhcn.workflow.ReliableWorkflowEngine;

@Component
public class CamundaReliableWorkflowEngine implements ReliableWorkflowEngine {
    static final String REQUEST_VARIABLE = "qtkhcnStartRequestId";
    private final CamundaClient client;

    public CamundaReliableWorkflowEngine(CamundaClient client) {
        this.client = client;
    }

    @Override
    public StartedProcess start(String processCode, String businessKey, UUID requestId,
            Map<String, Object> variables) {
        String bpmnProcessId = processCode.replace('.', '_');
        var definitions = client.newProcessDefinitionSearchRequest()
                .filter(f -> f.processDefinitionId(bpmnProcessId).isLatestVersion(true))
                .page(p -> p.limit(2)).send().join().items();
        if (definitions.size() != 1) {
            throw new ProcessNotActiveException("Khong co dung mot process active cho " + processCode);
        }
        var definition = definitions.getFirst();
        Map<String, Object> safeVariables = new HashMap<>(variables);
        safeVariables.put(REQUEST_VARIABLE, requestId.toString());
        var result = client.newCreateInstanceCommand()
                .processDefinitionKey(definition.getProcessDefinitionKey())
                .businessId(businessKey)
                .variables(safeVariables).send().join();
        return new StartedProcess(String.valueOf(result.getProcessInstanceKey()),
                result.getBpmnProcessId(), result.getVersion());
    }

    @Override
    public Optional<StartedProcess> findByRequestId(UUID requestId) {
        String jsonValue = "\"" + requestId + "\"";
        var variables = client.newVariableSearchRequest()
                .filter(f -> f.name(REQUEST_VARIABLE).value(jsonValue))
                .page(p -> p.limit(2)).send().join().items();
        if (variables.isEmpty()) return Optional.empty();
        long instanceKey = variables.getFirst().getProcessInstanceKey();
        var instances = client.newProcessInstanceSearchRequest()
                .filter(f -> f.processInstanceKey(instanceKey)).page(p -> p.limit(1)).send().join().items();
        if (instances.isEmpty()) return Optional.empty();
        var instance = instances.getFirst();
        return Optional.of(new StartedProcess(String.valueOf(instance.getProcessInstanceKey()),
                instance.getProcessDefinitionId(), instance.getProcessDefinitionVersion()));
    }

    public static class ProcessNotActiveException extends RuntimeException {
        public ProcessNotActiveException(String message) { super(message); }
    }
}
