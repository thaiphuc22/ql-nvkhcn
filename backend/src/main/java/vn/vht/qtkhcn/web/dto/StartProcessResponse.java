package vn.vht.qtkhcn.web.dto;

import java.util.UUID;

public record StartProcessResponse(UUID requestId, String processInstanceId,
        String processDefinitionId, int processVersion, String status) {
}
