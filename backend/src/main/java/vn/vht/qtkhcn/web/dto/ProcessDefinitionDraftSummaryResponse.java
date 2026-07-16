package vn.vht.qtkhcn.web.dto;

import java.time.OffsetDateTime;
import java.util.UUID;
import vn.vht.qtkhcn.domain.ProcessDefinitionDraft;
import vn.vht.qtkhcn.domain.ProcessDefinitionDraftStatus;

public record ProcessDefinitionDraftSummaryResponse(
        UUID id,
        String resourceName,
        String bpmnProcessId,
        String name,
        ProcessDefinitionDraftStatus status,
        long revision,
        String createdBy,
        OffsetDateTime createdAt,
        String updatedBy,
        OffsetDateTime updatedAt,
        OffsetDateTime validatedAt,
        UUID deployedVersionId
) {
    public static ProcessDefinitionDraftSummaryResponse from(ProcessDefinitionDraft draft) {
        return new ProcessDefinitionDraftSummaryResponse(draft.getId(), draft.getResourceName(),
                draft.getBpmnProcessId(), draft.getName(), draft.getStatus(), draft.getRevision(),
                draft.getCreatedBy(), draft.getCreatedAt(), draft.getUpdatedBy(), draft.getUpdatedAt(),
                draft.getValidatedAt(), draft.getDeployedVersionId());
    }
}
