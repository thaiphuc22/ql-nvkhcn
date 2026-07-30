package vn.vht.qtkhcn.identity.domain;
import jakarta.persistence.*; import java.util.UUID;
@Entity @Table(name="permissions")
public class Permission { @Id public UUID id; @Column(nullable=false,unique=true,length=64) public String code; @Column(nullable=false) public String name; public String description; @Column(nullable=false) public boolean active=true; protected Permission(){} public Permission(String code,String name,String description){id=UUID.randomUUID();this.code=code;this.name=name;this.description=description;} }
