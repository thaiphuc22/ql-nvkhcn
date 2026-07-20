package vn.vht.qtkhcn.repository;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.vht.qtkhcn.domain.ApprovalRule;

public interface ApprovalRuleRepository extends JpaRepository<ApprovalRule, String> {
    List<ApprovalRule> findAllByOrderByPriorityAscIdAsc();
    List<ApprovalRule> findBySlotCodeOrderByPriorityAscIdAsc(String slotCode);
    long countBySlotCode(String slotCode);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from ApprovalRule r where r.id = :id")
    Optional<ApprovalRule> findByIdForUpdate(@Param("id") String id);
}
