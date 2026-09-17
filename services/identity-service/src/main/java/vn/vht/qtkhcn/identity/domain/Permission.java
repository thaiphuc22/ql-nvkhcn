package vn.vht.qtkhcn.identity.domain;
import jakarta.persistence.*; import java.util.UUID;
@Entity @Table(name="permissions")
public class Permission {
 @Id public UUID id; @Column(nullable=false,unique=true,length=64) public String code; @Column(nullable=false) public String name; public String description; @Column(nullable=false) public boolean active=true;
 @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="feature_id") public Feature feature;
 @Column(name="sort_order",nullable=false) public int sortOrder;
 @Column(length=255) public String requires;
 @Column(name="screen_children",length=255) public String screenChildren;
 protected Permission(){}
 public Permission(String code,String name,String description){id=UUID.randomUUID();this.code=code;this.name=name;this.description=description;}
}
