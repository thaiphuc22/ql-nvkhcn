package vn.vht.qtkhcn.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.vht.qtkhcn.domain.IntegrationJobRun;

public interface IntegrationJobRunRepository extends JpaRepository<IntegrationJobRun, String> {
    List<IntegrationJobRun> findByHeOrderByThoiDiemDesc(String he);
}
