package vn.vht.qtkhcn.web.dto;

import java.time.OffsetDateTime;
import java.util.UUID;
import vn.vht.qtkhcn.domain.ProcessDefinitionStatus;

public record ProcessDefinitionSummaryResponse(
        UUID id,
        String bpmnProcessId,
        String name,
        int latestVersion,
        String resourceName,
        ProcessDefinitionStatus status,
        OffsetDateTime updatedAt
) {
}
