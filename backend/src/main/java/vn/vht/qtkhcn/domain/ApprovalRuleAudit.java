package vn.vht.qtkhcn.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "approval_rule_audit")
@Getter
@Setter
@NoArgsConstructor
public class ApprovalRuleAudit {
    @Id
    private UUID id;

    @Column(name = "rule_id", nullable = false, length = 64)
    private String ruleId;

    @Column(nullable = false, length = 16)
    private String action;

    @Column(nullable = false)
    private int version;

    @Column(nullable = false, length = 255)
    private String actor;

    @Column(nullable = false)
    private OffsetDateTime timestamp;

    @Column(nullable = false, length = 1000)
    private String detail;
}
