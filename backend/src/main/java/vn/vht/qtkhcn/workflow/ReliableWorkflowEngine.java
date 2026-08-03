package vn.vht.qtkhcn.workflow;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public interface ReliableWorkflowEngine {
    StartedProcess start(String processCode, String businessKey, UUID requestId, Map<String, Object> variables);
    Optional<StartedProcess> findByRequestId(UUID requestId);

    record StartedProcess(String processInstanceId, String processDefinitionId, int processVersion) {}
}
