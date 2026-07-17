package vn.vht.qtkhcn.repository;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.vht.qtkhcn.domain.ActionStudioAudit;

public interface ActionStudioAuditRepository extends JpaRepository<ActionStudioAudit, UUID> {
}
