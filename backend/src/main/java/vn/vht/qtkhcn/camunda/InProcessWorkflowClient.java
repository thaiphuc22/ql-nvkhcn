package vn.vht.qtkhcn.camunda;

import java.util.Optional;
import org.springframework.stereotype.Component;
import vn.vht.qtkhcn.domain.ActionOutcome;
import vn.vht.qtkhcn.domain.Cap;
import vn.vht.qtkhcn.workflow.StartWorkflowCommand;
import vn.vht.qtkhcn.workflow.WorkflowActionCommand;
import vn.vht.qtkhcn.workflow.WorkflowClient;
import vn.vht.qtkhcn.workflow.WorkflowInstance;

/**
 * Lát 1 adapter: keeps workflow calls inside the existing Spring Boot process and delegates to
 * the current RD01.01 Camunda service. No HTTP call or runtime topology change is introduced.
 */
@Component
public class InProcessWorkflowClient implements WorkflowClient {

    private static final String SUPPORTED_PROCESS = "RD01.01";
    private static final String CAP_VARIABLE = "cap";

    private final Rd0101ProcessService rd0101ProcessService;

    public InProcessWorkflowClient(Rd0101ProcessService rd0101ProcessService) {
        this.rd0101ProcessService = rd0101ProcessService;
    }

    @Override
    public Optional<WorkflowInstance> startWorkflow(StartWorkflowCommand command) {
        if (!SUPPORTED_PROCESS.equals(command.processCode())) {
            throw new UnsupportedOperationException(
                    "In-process workflow adapter chưa hỗ trợ quy trình " + command.processCode());
        }
        Object capValue = command.initialVariables().get(CAP_VARIABLE);
        if (!(capValue instanceof String cap) || cap.isBlank()) {
            throw new IllegalArgumentException("Workflow start command thiếu biến điều khiển cap.");
        }
        Long processInstanceKey = rd0101ProcessService.startInstance(command.hoSoId(), Cap.valueOf(cap));
        return Optional.ofNullable(processInstanceKey)
                .map(String::valueOf)
                .map(WorkflowInstance::new);
    }

    @Override
    public void applyAction(WorkflowActionCommand command) {
        long processInstanceKey = Long.parseLong(command.processInstanceId());
        rd0101ProcessService.applyAction(processInstanceKey, switch (command.action()) {
            case APPROVE_STEP -> ActionOutcome.APPROVE_STEP;
            case RETURN_STEP -> ActionOutcome.RETURN_STEP;
            case REJECT_STEP -> ActionOutcome.REJECT_STEP;
        });
    }
}
