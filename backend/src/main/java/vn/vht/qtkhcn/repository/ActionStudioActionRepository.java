package vn.vht.qtkhcn.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.vht.qtkhcn.domain.ActionStudioAction;

public interface ActionStudioActionRepository extends JpaRepository<ActionStudioAction, String> {
    List<ActionStudioAction> findAllByOrderByDisplayOrderAsc();
}
