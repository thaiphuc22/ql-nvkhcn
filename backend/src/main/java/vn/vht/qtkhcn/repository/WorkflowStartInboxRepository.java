package vn.vht.qtkhcn.repository;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.vht.qtkhcn.domain.WorkflowStartInbox;

public interface WorkflowStartInboxRepository extends JpaRepository<WorkflowStartInbox, UUID> {
}
