package vn.vht.qtkhcn.repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.vht.qtkhcn.domain.DmnRuleVersionDecision;

public interface DmnRuleVersionDecisionRepository extends JpaRepository<DmnRuleVersionDecision, UUID> {
    List<DmnRuleVersionDecision> findByRuleVersionIdOrderByDisplayOrder(UUID ruleVersionId);

    List<DmnRuleVersionDecision> findByRuleVersionIdInOrderByDisplayOrder(Collection<UUID> ruleVersionIds);

    void deleteByRuleVersionId(UUID ruleVersionId);
}
