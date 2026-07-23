package vn.vht.qtkhcn.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "dmn_rule_version")
@Getter
@Setter
@NoArgsConstructor
public class DmnRuleVersion {
    @Id
    private UUID id;

    @Column(name = "rule_id", nullable = false)
    private UUID ruleId;

    @Column(nullable = false)
    private int version;

    @Column(name = "dmn_xml", nullable = false, columnDefinition = "text")
    private String dmnXml;

    @Column(name = "checksum_sha256", nullable = false, length = 64)
    private String checksumSha256;

    @Column(name = "change_note", nullable = false, length = 500)
    private String changeNote;

    @Column(name = "created_by", nullable = false, length = 255)
    private String createdBy;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "deploy_status", nullable = false, length = 16)
    private DmnDeployStatus deployStatus = DmnDeployStatus.NOT_DEPLOYED;

    @Column(name = "camunda_deployment_key")
    private Long camundaDeploymentKey;

    @Column(name = "camunda_decision_key")
    private Long camundaDecisionKey;

    @Column(name = "camunda_decision_id", length = 255)
    private String camundaDecisionId;

    @Column(name = "camunda_decision_version")
    private Integer camundaDecisionVersion;

    @Column(name = "deployed_at")
    private OffsetDateTime deployedAt;

    @Column(name = "deploy_error", columnDefinition = "text")
    private String deployError;
}
