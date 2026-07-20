package vn.vht.qtkhcn.web.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.OffsetDateTime;
import java.util.Map;
import vn.vht.qtkhcn.domain.ApprovalRule;

public record ApprovalRuleResponse(String id, String domainCode, String ten, String slot,
        Map<String, Object> conditions, Map<String, Object> assignment, int priority, boolean enabled, int version,
        OffsetDateTime updatedAt, String updatedBy) {
    public static ApprovalRuleResponse from(ApprovalRule rule, ObjectMapper mapper) {
        return new ApprovalRuleResponse(rule.getId(), rule.getDomainCode(), rule.getName(),
                rule.getSlotCode(), toMap(mapper, rule.getConditions()), toMap(mapper, rule.getAssignment()), rule.getPriority(),
                rule.isEnabled(), rule.getVersion(), rule.getUpdatedAt(), rule.getUpdatedBy());
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> toMap(ObjectMapper mapper, Object value) {
        return mapper.convertValue(value, Map.class);
    }
}
