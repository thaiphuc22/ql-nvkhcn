package vn.vht.qtkhcn.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.vht.qtkhcn.domain.IntegrationSystem;

public interface IntegrationSystemRepository extends JpaRepository<IntegrationSystem, String> {
    List<IntegrationSystem> findAllByOrderByKeyAsc();
}
