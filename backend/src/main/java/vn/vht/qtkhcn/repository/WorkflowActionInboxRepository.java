package vn.vht.qtkhcn.repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.vht.qtkhcn.domain.WorkflowActionInbox;

public interface WorkflowActionInboxRepository extends JpaRepository<WorkflowActionInbox, UUID> {
    boolean existsByTaskKeyAndStatusIn(String taskKey, Collection<WorkflowActionInbox.Status> statuses);
    boolean existsByProcessInstanceIdAndActionCodeAndStatusIn(String processInstanceId, String actionCode,
            Collection<WorkflowActionInbox.Status> statuses);
    List<WorkflowActionInbox> findTop50ByStatusOrderByCreatedAtAsc(WorkflowActionInbox.Status status);
}
