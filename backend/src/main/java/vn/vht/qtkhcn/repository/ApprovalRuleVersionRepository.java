package vn.vht.qtkhcn.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.vht.qtkhcn.domain.ApprovalRuleVersion;

public interface ApprovalRuleVersionRepository extends JpaRepository<ApprovalRuleVersion, UUID> {
    List<ApprovalRuleVersion> findByRuleIdOrderByVersionDesc(String ruleId);
}
