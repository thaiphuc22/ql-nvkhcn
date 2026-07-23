package vn.vht.qtkhcn.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.vht.qtkhcn.domain.IntegrationMapping;

public interface IntegrationMappingRepository extends JpaRepository<IntegrationMapping, String> {
    List<IntegrationMapping> findAllByOrderByCreatedAtDesc();
}
