package vn.vht.qtkhcn.hoso.integration;

import java.util.UUID;

public record StartProcessResponse(UUID requestId, String processInstanceId,
        String processDefinitionId, int processVersion, String status) {
}
