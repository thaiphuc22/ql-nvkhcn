package vn.vht.qtkhcn.hoso.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.vht.qtkhcn.hoso.domain.WorkflowProcessProjection;

public interface WorkflowProcessProjectionRepository extends JpaRepository<WorkflowProcessProjection, String> {
    void deleteByHoSoId(String hoSoId);
}

