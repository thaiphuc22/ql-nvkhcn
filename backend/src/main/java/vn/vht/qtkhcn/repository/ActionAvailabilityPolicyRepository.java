package vn.vht.qtkhcn.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.vht.qtkhcn.domain.ActionAvailabilityPolicy;

public interface ActionAvailabilityPolicyRepository extends JpaRepository<ActionAvailabilityPolicy, String> {
    List<ActionAvailabilityPolicy> findAllByOrderByDisplayOrderAscIdAsc();
}
