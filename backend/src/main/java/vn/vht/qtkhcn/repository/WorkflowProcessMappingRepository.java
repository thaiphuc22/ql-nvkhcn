package vn.vht.qtkhcn.repository;

import java.util.UUID;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.vht.qtkhcn.domain.WorkflowProcessMapping;

public interface WorkflowProcessMappingRepository extends JpaRepository<WorkflowProcessMapping, UUID> {
    Optional<WorkflowProcessMapping> findByProcessInstanceId(String processInstanceId);
    Optional<WorkflowProcessMapping> findByHoSoId(String hoSoId);
}
