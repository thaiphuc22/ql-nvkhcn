package vn.vht.qtkhcn.domain;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "dmn_rule")
@Getter
@Setter
@NoArgsConstructor
public class DmnRule {
    @Id
    private UUID id;

    @Column(nullable = false, unique = true, length = 128)
    private String code;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private DmnRuleCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private DmnRuleStatus status;

    @Column(name = "latest_version", nullable = false)
    private int latestVersion;

    @Column(name = "active_version")
    private Integer activeVersion;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "dmn_rule_applied_process", joinColumns = @JoinColumn(name = "rule_id"))
    @Column(name = "bpmn_process_id", nullable = false, length = 255)
    private Set<String> appliedProcesses = new LinkedHashSet<>();

    @Column(name = "created_by", nullable = false, length = 255)
    private String createdBy;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_by", nullable = false, length = 255)
    private String updatedBy;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}

