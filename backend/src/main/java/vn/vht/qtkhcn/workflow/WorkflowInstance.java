package vn.vht.qtkhcn.workflow;

/** Workflow start result using a string id so the seam is safe for future JSON transport. */
public record WorkflowInstance(String processInstanceId) {
}
