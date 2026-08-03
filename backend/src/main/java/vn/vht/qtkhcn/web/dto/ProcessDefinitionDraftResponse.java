package vn.vht.qtkhcn.web.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import vn.vht.qtkhcn.domain.ProcessDefinitionDraft;
import vn.vht.qtkhcn.domain.ProcessDefinitionDraftStatus;

public record ProcessDefinitionDraftResponse(
        UUID id,
        String resourceName,
        String bpmnProcessId,
        String name,
        String bpmnXml,
        String checksumSha256,
        ProcessDefinitionDraftStatus status,
        long revision,
        String createdBy,
        OffsetDateTime createdAt,
        String updatedBy,
        OffsetDateTime updatedAt,
        OffsetDateTime validatedAt,
        UUID deployedVersionId,
        List<ProcessDefinitionDraftRevisionResponse> revisions
) {
    public static ProcessDefinitionDraftResponse from(ProcessDefinitionDraft draft,
            List<ProcessDefinitionDraftRevisionResponse> revisions) {
        return new ProcessDefinitionDraftResponse(draft.getId(), draft.getResourceName(), draft.getBpmnProcessId(),
                draft.getName(), draft.getBpmnXml(), draft.getChecksumSha256(), draft.getStatus(),
                draft.getRevision(), draft.getCreatedBy(), draft.getCreatedAt(), draft.getUpdatedBy(),
                draft.getUpdatedAt(), draft.getValidatedAt(), draft.getDeployedVersionId(), revisions);
    }
}
