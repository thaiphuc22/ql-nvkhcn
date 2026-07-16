package vn.vht.qtkhcn.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.vht.qtkhcn.domain.DmnRuleVersion;

public interface DmnRuleVersionRepository extends JpaRepository<DmnRuleVersion, UUID> {
    List<DmnRuleVersion> findByRuleIdOrderByVersionDesc(UUID ruleId);
    Optional<DmnRuleVersion> findByRuleIdAndVersion(UUID ruleId, int version);
    boolean existsByRuleIdAndVersion(UUID ruleId, int version);
}
