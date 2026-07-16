package vn.vht.qtkhcn.repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.vht.qtkhcn.domain.BpmnTestSession;
import vn.vht.qtkhcn.domain.BpmnTestStatus;

public interface BpmnTestSessionRepository extends JpaRepository<BpmnTestSession, UUID> {
    List<BpmnTestSession> findByExpiresAtBeforeAndStatusIn(OffsetDateTime time, List<BpmnTestStatus> statuses);
}
