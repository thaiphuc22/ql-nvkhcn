package vn.vht.qtkhcn.workflow;

import java.util.Optional;

/**
 * Port owned by the dossier application layer for commands sent to the workflow context.
 * Implementations may remain in-process or move behind HTTP without changing dossier services.
 */
public interface WorkflowClient {

    Optional<WorkflowInstance> startWorkflow(StartWorkflowCommand command);

    void applyAction(WorkflowActionCommand command);
}
