package vn.vht.qtkhcn.identity.repository;
import java.time.LocalDate; import java.util.*; import org.springframework.data.jpa.repository.*; import org.springframework.data.repository.query.Param; import vn.vht.qtkhcn.identity.domain.UserRoleAssignment;
public interface UserRoleAssignmentRepository extends JpaRepository<UserRoleAssignment,UUID>{
 List<UserRoleAssignment> findByUserId(UUID userId);
 Optional<UserRoleAssignment> findByIdAndUserId(UUID id,UUID userId);
 @Query("select distinct a from UserRoleAssignment a join fetch a.role r left join fetch a.organization where a.user.id=:userId and r.active=true and (a.effectiveFrom is null or a.effectiveFrom<=:today) and (a.effectiveTo is null or a.effectiveTo>=:today)") List<UserRoleAssignment> findEffective(@Param("userId") UUID userId,@Param("today") LocalDate today);
}
