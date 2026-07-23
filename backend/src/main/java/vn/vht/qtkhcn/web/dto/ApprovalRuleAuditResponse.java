package vn.vht.qtkhcn.web.dto;

import java.time.OffsetDateTime;
import java.util.UUID;
import vn.vht.qtkhcn.domain.ApprovalRuleAudit;

public record ApprovalRuleAuditResponse(UUID id, String ruleId, String action, int version,
        String actor, OffsetDateTime timestamp, String detail) {
    public static ApprovalRuleAuditResponse from(ApprovalRuleAudit audit) {
        return new ApprovalRuleAuditResponse(audit.getId(), audit.getRuleId(), audit.getAction(),
                audit.getVersion(), audit.getActor(), audit.getTimestamp(), audit.getDetail());
    }
}
