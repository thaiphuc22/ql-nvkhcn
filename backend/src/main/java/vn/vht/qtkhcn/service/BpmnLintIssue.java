package vn.vht.qtkhcn.service;

public record BpmnLintIssue(
        String code,
        BpmnIssueSeverity severity,
        String message,
        String elementId,
        String elementName
) {
}
