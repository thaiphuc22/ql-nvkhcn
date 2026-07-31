package vn.vht.qtkhcn.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.vht.qtkhcn.domain.EformVersion;

public interface EformVersionRepository extends JpaRepository<EformVersion, String> {
    Optional<EformVersion> findByFormKeyAndVersion(String formKey, long version);

    List<EformVersion> findAllByFormKeyOrderByVersionDesc(String formKey);
}
