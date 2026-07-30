package vn.vht.qtkhcn.identity.domain;
import jakarta.persistence.*;
@Entity @Table(name="role_feature_permissions") @IdClass(RoleFeaturePermissionId.class)
public class RoleFeaturePermission {
 @Id @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="role_id") public Role role;
 @Id @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="feature_id") public Feature feature;
 @Id @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="permission_id") public Permission permission;
 @Column(nullable=false) public boolean enabled=true;
 protected RoleFeaturePermission(){} public RoleFeaturePermission(Role r,Feature f,Permission p,boolean enabled){role=r;feature=f;permission=p;this.enabled=enabled;}
}
