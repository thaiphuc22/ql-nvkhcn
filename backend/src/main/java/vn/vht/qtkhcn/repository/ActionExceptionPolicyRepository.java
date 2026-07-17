package vn.vht.qtkhcn.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.vht.qtkhcn.domain.ActionExceptionPolicy;

public interface ActionExceptionPolicyRepository extends JpaRepository<ActionExceptionPolicy, String> {
    List<ActionExceptionPolicy> findAllByOrderByIdAsc();
}
