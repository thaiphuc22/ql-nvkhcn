package vn.vht.qtkhcn.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.vht.qtkhcn.domain.ProcessDefinitionVersion;

public interface ProcessDefinitionVersionRepository extends JpaRepository<ProcessDefinitionVersion, UUID> {
    List<ProcessDefinitionVersion> findByCatalogIdOrderByCamundaVersionDesc(UUID catalogId);
    Optional<ProcessDefinitionVersion> findFirstByCatalogIdOrderByCamundaVersionDesc(UUID catalogId);
    Optional<ProcessDefinitionVersion> findByCamundaProcessDefinitionKey(long camundaProcessDefinitionKey);
}
