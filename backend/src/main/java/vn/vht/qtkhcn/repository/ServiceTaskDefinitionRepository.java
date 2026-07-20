package vn.vht.qtkhcn.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.vht.qtkhcn.domain.ServiceTaskDefinition;

public interface ServiceTaskDefinitionRepository extends JpaRepository<ServiceTaskDefinition, UUID> {
    Optional<ServiceTaskDefinition> findByCode(String code);

    List<ServiceTaskDefinition> findAllByOrderByCodeAsc();
}
