package vn.vht.qtkhcn.identity.repository;
import java.time.LocalDate; import java.util.*; import org.springframework.data.jpa.repository.*; import org.springframework.data.repository.query.Param; import vn.vht.qtkhcn.identity.domain.UserRoleAssignment;
public interface UserRoleAssignmentRepository extends JpaRepository<UserRoleAssignment,UUID>{
 // join fetch role: DTO đọc mã vai trò qua field công khai `a.role.code`, mà field access trên
 // proxy lazy chưa khởi tạo trả NULL. Derived query `findByUserId` trước đây không fetch role nên
 // GET /api/users/{id}/role-assignments trả roleCode=null — drawer Phân quyền hiện trống mã vai trò.
 @Query("select a from UserRoleAssignment a join fetch a.role left join fetch a.organization where a.user.id=:userId") List<UserRoleAssignment> findByUserId(@Param("userId") UUID userId);
 Optional<UserRoleAssignment> findByIdAndUserId(UUID id,UUID userId);
 // Toàn bộ assignment của mọi user trong MỘT query — để bảng danh sách người dùng hiện cột
 // "Vai trò" mà không phải gọi /users/{id}/role-assignments N lần.
 // join fetch cả `user`: DTO đọc `a.user.id` qua FIELD công khai, và field access trên proxy
 // lazy chưa khởi tạo trả null (khác getter). Các API theo-1-user hiện tại thoát được vì đã
 // load User vào persistence context trước đó; ở đây không có bảo đảm ấy.
 @Query("select a from UserRoleAssignment a join fetch a.user join fetch a.role left join fetch a.organization") List<UserRoleAssignment> findAllDetailed();
 @Query("select distinct a from UserRoleAssignment a join fetch a.role r left join fetch a.organization where a.user.id=:userId and r.active=true and (a.effectiveFrom is null or a.effectiveFrom<=:today) and (a.effectiveTo is null or a.effectiveTo>=:today)") List<UserRoleAssignment> findEffective(@Param("userId") UUID userId,@Param("today") LocalDate today);
}
