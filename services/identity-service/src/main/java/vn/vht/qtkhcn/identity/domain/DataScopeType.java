package vn.vht.qtkhcn.identity.domain;
import jakarta.persistence.*;
@Entity @Table(name="data_scope_types") public class DataScopeType { @Id @Column(length=32) public String code; @Column(nullable=false) public String name; public String description; @Column(nullable=false,unique=true) public int rank; @Column(nullable=false) public boolean active=true; protected DataScopeType(){} }
