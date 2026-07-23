package vn.vht.qtkhcn.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateProcessDefinitionDraftRequest(
        @NotBlank @Size(max = 255) String resourceName,
        @NotBlank @Size(max = 255) String bpmnProcessId,
        @NotBlank @Size(max = 512) String name,
        @NotBlank String bpmnXml
) {
}
