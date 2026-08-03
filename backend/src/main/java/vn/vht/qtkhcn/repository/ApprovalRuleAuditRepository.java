package vn.vht.qtkhcn.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.vht.qtkhcn.domain.ApprovalRuleAudit;

public interface ApprovalRuleAuditRepository extends JpaRepository<ApprovalRuleAudit, UUID> {
    List<ApprovalRuleAudit> findByRuleIdOrderByTimestampDesc(String ruleId);
}
