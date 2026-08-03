package vn.vht.qtkhcn.web.dto;

import java.util.List;
import vn.vht.qtkhcn.domain.ProcessDefinitionDraftStatus;
import vn.vht.qtkhcn.service.BpmnLintIssue;

public record ProcessDefinitionDraftValidationResponse(
        boolean valid,
        long revision,
        ProcessDefinitionDraftStatus status,
        String checksumSha256,
        List<String> warnings,
        List<String> errors,
        List<BpmnLintIssue> issues
) {
}
