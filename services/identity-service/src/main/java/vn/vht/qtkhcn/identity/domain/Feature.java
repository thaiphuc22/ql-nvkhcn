package vn.vht.qtkhcn.identity.domain;
import jakarta.persistence.*; import java.util.UUID;
@Entity @Table(name="features") public class Feature {
 @Id public UUID id; @Column(nullable=false,unique=true,length=64) public String code; @Column(nullable=false) public String name; @Column(name="feature_group",nullable=false,length=64) public String group; @Column(name="app_code",nullable=false,length=32) public String appCode; public String description; @Column(nullable=false) public boolean active=true; @Column(nullable=false) public boolean legacy;
 protected Feature(){} public UUID getId(){return id;}
}
