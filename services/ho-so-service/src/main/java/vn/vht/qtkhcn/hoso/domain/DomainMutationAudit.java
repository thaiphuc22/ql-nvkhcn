package vn.vht.qtkhcn.hoso.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "domain_mutation_audit")
@Getter
@NoArgsConstructor
public class DomainMutationAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "aggregate_type", nullable = false, length = 32)
    private String aggregateType;

    @Column(name = "aggregate_id", nullable = false, length = 64)
    private String aggregateId;

    @Column(name = "aggregate_version", nullable = false)
    private long aggregateVersion;

    @Column(name = "action", nullable = false, length = 32)
    private String action;

    @Column(name = "actor", nullable = false, length = 128)
    private String actor;

    @Column(name = "occurred_at", nullable = false)
    private OffsetDateTime occurredAt;

    @Column(name = "detail", length = 512)
    private String detail;

    public DomainMutationAudit(String aggregateType, String aggregateId, long aggregateVersion,
                               String action, String actor, String detail) {
        this.aggregateType = aggregateType;
        this.aggregateId = aggregateId;
        this.aggregateVersion = aggregateVersion;
        this.action = action;
        this.actor = actor;
        this.occurredAt = OffsetDateTime.now();
        this.detail = detail;
    }
}
