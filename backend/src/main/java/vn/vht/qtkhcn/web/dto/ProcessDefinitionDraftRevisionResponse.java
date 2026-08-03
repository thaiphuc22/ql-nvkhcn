package vn.vht.qtkhcn.web.dto;

import java.time.OffsetDateTime;
import java.util.UUID;
import vn.vht.qtkhcn.domain.ProcessDefinitionDraftRevision;
import vn.vht.qtkhcn.domain.ProcessDefinitionDraftStatus;

public record ProcessDefinitionDraftRevisionResponse(
        UUID id,
        long revision,
        String resourceName,
        String bpmnProcessId,
        String name,
        String bpmnXml,
        String checksumSha256,
        ProcessDefinitionDraftStatus status,
        String actor,
        OffsetDateTime createdAt
) {
    public static ProcessDefinitionDraftRevisionResponse from(ProcessDefinitionDraftRevision value) {
        return new ProcessDefinitionDraftRevisionResponse(value.getId(), value.getRevision(),
                value.getResourceName(), value.getBpmnProcessId(), value.getName(), value.getBpmnXml(),
                value.getChecksumSha256(), value.getStatus(), value.getActor(), value.getCreatedAt());
    }
}
