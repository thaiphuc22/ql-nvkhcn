package vn.vht.qtkhcn.service;

import java.util.List;

public record ValidatedBpmn(
        byte[] bytes,
        String xml,
        String resourceName,
        String bpmnProcessId,
        String processName,
        String checksumSha256,
        List<String> warnings,
        List<BpmnLintIssue> issues
) {
    public ValidatedBpmn(byte[] bytes, String xml, String resourceName, String bpmnProcessId,
            String processName, String checksumSha256, List<String> warnings) {
        this(bytes, xml, resourceName, bpmnProcessId, processName, checksumSha256, warnings, List.of());
    }

    public boolean hasErrors() {
        return issues.stream().anyMatch(issue -> issue.severity() == BpmnIssueSeverity.ERROR);
    }
}
