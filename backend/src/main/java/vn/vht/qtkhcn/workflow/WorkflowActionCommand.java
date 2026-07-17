package vn.vht.qtkhcn.workflow;

/** Application command; deliberately independent of Camunda job/task DTOs. */
public record WorkflowActionCommand(String processInstanceId, WorkflowAction action) {
}
