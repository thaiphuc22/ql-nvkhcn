package vn.vht.qtkhcn.workflow;

import java.util.Map;

/** Application command; deliberately independent of Camunda request/response classes. */
public record StartWorkflowCommand(
        String businessKey,
        String processCode,
        String hoSoId,
        String nhiemVuId,
        String initiatorUserId,
        Map<String, Object> initialVariables) {

    public StartWorkflowCommand {
        initialVariables = Map.copyOf(initialVariables);
    }
}
