package vn.vht.qtkhcn.repository;

import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.vht.qtkhcn.domain.WorkflowEventOutbox;

public interface WorkflowEventOutboxRepository extends JpaRepository<WorkflowEventOutbox, UUID> {
    boolean existsBySourceKey(String sourceKey);
    List<WorkflowEventOutbox> findTop50ByStatusInAndNextAttemptAtLessThanEqualOrderByCreatedAt(
            Collection<WorkflowEventOutbox.Status> statuses, OffsetDateTime now);
}
