package vn.vht.qtkhcn.identity.repository;
import java.util.*; import org.springframework.data.jpa.repository.*; import org.springframework.data.repository.query.Param; import vn.vht.qtkhcn.identity.domain.*;
public interface RoleFeaturePermissionRepository extends JpaRepository<RoleFeaturePermission,RoleFeaturePermissionId>{
 @Query("select x from RoleFeaturePermission x join fetch x.feature join fetch x.permission where x.role.id=:roleId") List<RoleFeaturePermission> findDetailedByRoleId(@Param("roleId") UUID roleId);
 @Modifying @Query("delete from RoleFeaturePermission x where x.role.id=:roleId") void deleteByRoleId(@Param("roleId") UUID roleId);
}
