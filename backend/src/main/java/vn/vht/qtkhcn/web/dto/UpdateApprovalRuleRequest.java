package vn.vht.qtkhcn.web.dto;

import java.util.Map;

public record UpdateApprovalRuleRequest(String ten, String slot, Map<String, Object> conditions,
        Map<String, Object> assignment, Integer priority, Boolean enabled, String changeNote) {
}
