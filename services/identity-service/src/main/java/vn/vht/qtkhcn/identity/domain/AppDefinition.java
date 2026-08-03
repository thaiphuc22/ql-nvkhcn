package vn.vht.qtkhcn.identity.domain;
import jakarta.persistence.*;
@Entity @Table(name="apps") public class AppDefinition { @Id @Column(length=32) public String code; @Column(nullable=false) public String name; public String description; @Column(nullable=false) public boolean active=true; protected AppDefinition(){} }
