package vn.vht.qtkhcn.web.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import vn.vht.qtkhcn.domain.ProcessDefinitionStatus;

public record ProcessDefinitionImportResponse(
        UUID id,
        UUID versionId,
        String bpmnProcessId,
        String name,
        String resourceName,
        long camundaDeploymentKey,
        long camundaProcessDefinitionKey,
        int version,
        ProcessDefinitionStatus status,
        String checksumSha256,
        String importedBy,
        OffsetDateTime importedAt,
        List<String> warnings
) {
}
