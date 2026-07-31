package vn.vht.qtkhcn.identity.domain;
import jakarta.persistence.*; import java.time.Instant; import java.util.UUID;
@Entity @Table(name="organizations")
public class Organization {
 @Id public UUID id; @Column(nullable=false,unique=true,length=64) public String code; @Column(nullable=false) public String name;
 @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="parent_id") public Organization parent; @Column(nullable=false) public boolean active=true;
 @Column(name="created_at",nullable=false) public Instant createdAt; @Column(name="updated_at",nullable=false) public Instant updatedAt;
 protected Organization(){} public Organization(String code,String name,Organization parent){id=UUID.randomUUID();this.code=code;this.name=name;this.parent=parent;createdAt=updatedAt=Instant.now();}
 public UUID getId(){return id;}
}
