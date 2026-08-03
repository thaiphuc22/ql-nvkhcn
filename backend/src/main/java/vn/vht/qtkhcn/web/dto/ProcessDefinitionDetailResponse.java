package vn.vht.qtkhcn.web.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ProcessDefinitionDetailResponse(
        UUID id,
        String bpmnProcessId,
        String name,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        ProcessDefinitionVersionResponse latestVersion
) {
}
