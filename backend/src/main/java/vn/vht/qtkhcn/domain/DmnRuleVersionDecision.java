package vn.vht.qtkhcn.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Một decision đã deploy thuộc một phiên bản DMN. Một version là DRD có thể chứa nhiều decision
 * nối chuỗi; {@code root} đánh dấu decision terminal (không decision nào khác phụ thuộc vào nó).
 */
@Entity
@Table(name = "dmn_rule_version_decision")
@Getter
@Setter
@NoArgsConstructor
public class DmnRuleVersionDecision {
    @Id
    private UUID id;

    @Column(name = "rule_version_id", nullable = false)
    private UUID ruleVersionId;

    @Column(name = "decision_id", nullable = false, length = 255)
    private String decisionId;

    @Column(name = "decision_name", length = 255)
    private String decisionName;

    @Column(name = "camunda_decision_key", nullable = false)
    private long camundaDecisionKey;

    @Column(name = "camunda_decision_version", nullable = false)
    private int camundaDecisionVersion;

    @Column(name = "is_root", nullable = false)
    private boolean root;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;
}
