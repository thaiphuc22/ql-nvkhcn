package vn.vht.qtkhcn.identity.domain;
import jakarta.persistence.*; import java.time.Instant; import java.util.UUID;
@Entity @Table(name="users")
public class User {
 @Id public UUID id; @Column(nullable=false,unique=true) public String email; @Column(name="employee_code",unique=true,length=64) public String employeeCode; @Column(name="full_name",nullable=false) public String fullName; @Column(name="job_title") public String jobTitle;
 @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="organization_id") public Organization organization; @Column(nullable=false,length=32) public String status="ACTIVE"; @Column(nullable=false) public boolean administrator;
 @Column(name="created_at",nullable=false) public Instant createdAt; @Column(name="updated_at",nullable=false) public Instant updatedAt;
 protected User(){} public User(String email,String employeeCode,String fullName,String jobTitle,Organization organization,String status,boolean administrator){id=UUID.randomUUID();this.email=email;this.employeeCode=employeeCode;this.fullName=fullName;this.jobTitle=jobTitle;this.organization=organization;this.status=status;this.administrator=administrator;createdAt=updatedAt=Instant.now();}
 public UUID getId(){return id;}
}
