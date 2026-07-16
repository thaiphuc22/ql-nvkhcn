package vn.vht.qtkhcn.web.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import vn.vht.qtkhcn.domain.ProcessDefinitionStatus;
import vn.vht.qtkhcn.domain.ProcessDefinitionVersion;

public record ProcessDefinitionVersionResponse(
        UUID id,
        int version,
        String resourceName,
        String checksumSha256,
        long camundaDeploymentKey,
        long camundaProcessDefinitionKey,
        ProcessDefinitionStatus status,
        String importedBy,
        OffsetDateTime importedAt,
        String bpmnXml,
        List<String> warnings
) {
    public static ProcessDefinitionVersionResponse from(ProcessDefinitionVersion version) {
        return new ProcessDefinitionVersionResponse(version.getId(), version.getCamundaVersion(),
                version.getResourceName(), version.getChecksumSha256(), version.getCamundaDeploymentKey(),
                version.getCamundaProcessDefinitionKey(), version.getStatus(), version.getImportedBy(),
                version.getImportedAt(), version.getBpmnXml(), List.copyOf(version.getWarnings()));
    }
}
