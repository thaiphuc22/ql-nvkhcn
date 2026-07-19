package vn.vht.qtkhcn.hoso.repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.vht.qtkhcn.hoso.domain.OutboxEvent;

public interface OutboxEventRepository extends JpaRepository<OutboxEvent, UUID> {
    List<OutboxEvent> findTop20ByStatusInAndNextAttemptAtLessThanEqualOrderByCreatedAt(
            List<OutboxEvent.Status> statuses, OffsetDateTime now);

    long countByStatus(OutboxEvent.Status status);

    Optional<OutboxEvent> findFirstByStatusOrderBySentAtDesc(OutboxEvent.Status status);
}
