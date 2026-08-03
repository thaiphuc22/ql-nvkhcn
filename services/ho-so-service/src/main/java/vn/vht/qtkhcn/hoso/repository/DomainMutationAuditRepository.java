package vn.vht.qtkhcn.hoso.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.vht.qtkhcn.hoso.domain.DomainMutationAudit;

public interface DomainMutationAuditRepository extends JpaRepository<DomainMutationAudit, Long> {
    List<DomainMutationAudit> findByAggregateTypeAndAggregateIdOrderByOccurredAtDesc(
            String aggregateType, String aggregateId);
}
