package vn.vht.qtkhcn.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.vht.qtkhcn.domain.ActionFormSubmission;

public interface ActionFormSubmissionRepository extends JpaRepository<ActionFormSubmission, UUID> {
    List<ActionFormSubmission> findByRequestId(UUID requestId);
    List<ActionFormSubmission> findByTaskKeyAndActorIdOrderByCreatedAtDesc(String taskKey, String actorId);
}
