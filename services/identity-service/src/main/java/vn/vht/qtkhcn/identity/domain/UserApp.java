package vn.vht.qtkhcn.identity.domain;
import jakarta.persistence.*; import java.time.Instant;
@Entity @Table(name="user_apps") @IdClass(UserAppId.class) public class UserApp {
 @Id @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="user_id") public User user;
 @Id @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="app_code") public AppDefinition app;
 @Column(name="granted_at",nullable=false) public Instant grantedAt;
 protected UserApp(){} public UserApp(User user,AppDefinition app){this.user=user;this.app=app;grantedAt=Instant.now();}
}
