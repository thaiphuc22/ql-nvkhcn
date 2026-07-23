package vn.vht.qtkhcn.hoso.integration;

import java.util.Map;
import java.util.UUID;

public record StartProcessCommand(UUID requestId, String businessKey, String processCode,
        String hoSoId, String nhiemVuId, String initiatorUserId, Map<String, Object> initialVariables) {
}
