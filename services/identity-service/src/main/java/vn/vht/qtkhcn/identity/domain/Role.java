package vn.vht.qtkhcn.identity.domain;
import jakarta.persistence.*; import java.time.Instant; import java.util.*;
@Entity @Table(name="roles")
public class Role {
 @Id public UUID id; @Column(nullable=false,unique=true,length=64) public String code; @Column(nullable=false) public String name; @Column(nullable=false,length=32) public String kind; @Column(name="app_code",nullable=false,length=32) public String appCode; @Column(nullable=false) public boolean active=true;
 @OneToMany(mappedBy="role",cascade=CascadeType.ALL,orphanRemoval=true) public Set<RoleFeaturePermission> featurePermissions=new HashSet<>();
 @Column(name="created_at",nullable=false) public Instant createdAt; @Column(name="updated_at",nullable=false) public Instant updatedAt;
 protected Role(){} public Role(String code,String name,String kind,String appCode){id=UUID.randomUUID();this.code=code;this.name=name;this.kind=kind;this.appCode=appCode;createdAt=updatedAt=Instant.now();}
 public UUID getId(){return id;} public String getCode(){return code;}
}
