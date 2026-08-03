package vn.vht.qtkhcn.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.Map;
import java.util.UUID;

public record StartProcessRequest(
        @NotNull UUID requestId,
        @NotBlank @Size(max = 255) String businessKey,
        @NotBlank @Size(max = 128) String processCode,
        @NotBlank @Size(max = 128) String hoSoId,
        @NotBlank @Size(max = 128) String nhiemVuId,
        @NotBlank @Size(max = 128) String initiatorUserId,
        @NotNull Map<String, Object> initialVariables) {
}
