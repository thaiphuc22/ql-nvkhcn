package vn.vht.qtkhcn.repository;

import java.util.Optional;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.vht.qtkhcn.domain.ProcessDefinitionCatalog;

public interface ProcessDefinitionCatalogRepository extends JpaRepository<ProcessDefinitionCatalog, UUID> {
    Optional<ProcessDefinitionCatalog> findByBpmnProcessId(String bpmnProcessId);
    List<ProcessDefinitionCatalog> findAllByOrderByBpmnProcessIdAsc();
}
