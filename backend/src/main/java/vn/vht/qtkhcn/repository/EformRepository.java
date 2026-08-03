package vn.vht.qtkhcn.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.vht.qtkhcn.domain.Eform;

public interface EformRepository extends JpaRepository<Eform, String> {
    List<Eform> findAllByOrderByCreatedAtDesc();
}
