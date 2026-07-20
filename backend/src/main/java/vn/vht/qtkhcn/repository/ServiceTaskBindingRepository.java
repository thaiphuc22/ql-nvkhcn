package vn.vht.qtkhcn.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.vht.qtkhcn.domain.ServiceTaskBinding;
import vn.vht.qtkhcn.domain.ServiceTaskBindingStatus;

public interface ServiceTaskBindingRepository extends JpaRepository<ServiceTaskBinding, UUID> {
    /** Binding ghim đúng element. Unique index trong V21 bảo đảm tối đa 1 row ACTIVE. */
    Optional<ServiceTaskBinding> findByBpmnProcessIdAndElementIdAndBindingStatus(
            String bpmnProcessId, String elementId, ServiceTaskBindingStatus bindingStatus);

    /** Binding rộng theo job type (element_id NULL) — dùng khi không có binding ghim element. */
    Optional<ServiceTaskBinding> findByJobTypeAndElementIdIsNullAndBindingStatus(
            String jobType, ServiceTaskBindingStatus bindingStatus);

    List<ServiceTaskBinding> findAllByOrderByBpmnProcessIdAscElementIdAsc();

    List<ServiceTaskBinding> findByDefinitionIdOrderByBpmnProcessIdAscElementIdAsc(UUID definitionId);
}
