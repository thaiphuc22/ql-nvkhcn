package vn.vht.qtkhcn.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.vht.qtkhcn.domain.ServiceTaskConfigVersion;

public interface ServiceTaskConfigVersionRepository extends JpaRepository<ServiceTaskConfigVersion, UUID> {
    List<ServiceTaskConfigVersion> findByDefinitionIdOrderByVersionDesc(UUID definitionId);
    Optional<ServiceTaskConfigVersion> findByDefinitionIdAndVersion(UUID definitionId, int version);
}
