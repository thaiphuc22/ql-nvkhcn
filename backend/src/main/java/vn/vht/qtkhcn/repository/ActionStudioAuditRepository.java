package vn.vht.qtkhcn.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.vht.qtkhcn.domain.ActionStudioAudit;

public interface ActionStudioAuditRepository extends JpaRepository<ActionStudioAudit, UUID> {
    List<ActionStudioAudit> findByEntityTypeAndEntityIdOrderByEventAtDesc(String entityType, String entityId);
}
