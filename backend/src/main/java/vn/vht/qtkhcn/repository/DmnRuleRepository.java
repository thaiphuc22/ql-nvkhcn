package vn.vht.qtkhcn.repository;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.vht.qtkhcn.domain.DmnRule;

public interface DmnRuleRepository extends JpaRepository<DmnRule, UUID> {
    boolean existsByCodeIgnoreCase(String code);
    List<DmnRule> findAllByOrderByUpdatedAtDesc();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from DmnRule r where r.id = :id")
    Optional<DmnRule> findByIdForUpdate(@Param("id") UUID id);
}

