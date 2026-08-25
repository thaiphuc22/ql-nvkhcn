package vn.vht.qtkhcn.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.vht.qtkhcn.domain.ActionVariableBinding;

public interface ActionVariableBindingRepository extends JpaRepository<ActionVariableBinding, String> {
    List<ActionVariableBinding> findByProcessCodeOrderByTaskDefinitionKeyAscFormFieldAsc(String processCode);
}
