package vn.vht.qtkhcn.web.dto;

import java.util.List;
import java.util.Map;

public record ResolveApprovalResponse(String matchedRuleId, String mode,
        List<ResolvedApproverResponse> approvers, String reason, List<String> warnings,
        ApprovalResolveAuditResponse audit) {
    public record ResolvedApproverResponse(String userId, String viaRoleCode, String viaTargetType,
            boolean placeholder, String delegatedFromUserId, String delegationLyDo) {
    }

    public record ApprovalResolveAuditResponse(Map<String, Object> context, String slot,
            String matchedRuleId, Integer matchedRuleVersion, String mode,
            List<Map<String, Object>> targetsBeforeOrg, List<String> finalUserIds,
            List<DelegationAppliedResponse> delegationsApplied, List<SkippedRuleResponse> skipped,
            String at) {
    }

    public record DelegationAppliedResponse(String fromUserId, String toUserId, String lyDo) {
    }

    public record SkippedRuleResponse(String ruleId, String reason) {
    }
}
