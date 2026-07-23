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
@Table(name = "action_studio_audit")
@Getter
@Setter
@NoArgsConstructor
public class ActionStudioAudit {
    @Id
    private UUID id;
    @Column(name = "entity_type", nullable = false, length = 32)
    private String entityType;
    @Column(name = "entity_id", nullable = false, length = 128)
    private String entityId;
    @Column(nullable = false, length = 32)
    private String action;
    @Column(nullable = false, length = 255)
    private String actor;
    @Column(name = "event_at", nullable = false)
    private OffsetDateTime eventAt;
    @Column(nullable = false, length = 1000)
    private String detail;
}
