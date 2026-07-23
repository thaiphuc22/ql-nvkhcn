package vn.vht.qtkhcn.web.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;
import vn.vht.qtkhcn.domain.ApprovalRuleVersion;

public record ApprovalRuleVersionResponse(UUID id, String ruleId, int version, Map<String, Object> snapshot,
        String changeNote, String createdBy, OffsetDateTime createdAt) {
    @SuppressWarnings("unchecked")
    public static ApprovalRuleVersionResponse from(ApprovalRuleVersion version, ObjectMapper mapper) {
        return new ApprovalRuleVersionResponse(version.getId(), version.getRuleId(), version.getVersion(),
                mapper.convertValue(version.getSnapshot(), Map.class), version.getChangeNote(),
                version.getCreatedBy(), version.getCreatedAt());
    }
}
