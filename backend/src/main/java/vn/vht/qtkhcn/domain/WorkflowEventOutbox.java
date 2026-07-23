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
@Table(name = "workflow_event_outbox")
@Getter @Setter @NoArgsConstructor
public class WorkflowEventOutbox {
    public enum Status { PENDING, PROCESSING, SENT, FAILED }

    @Id @Column(name = "event_id") private UUID eventId;
    @Column(name = "source_key", nullable = false, unique = true) private String sourceKey;
    @Column(name = "event_type", nullable = false) private String eventType;
    @Column(name = "correlation_id", nullable = false) private String correlationId;
    @Column(name = "ho_so_id", nullable = false) private String hoSoId;
    @Column(name = "process_instance_id", nullable = false) private String processInstanceId;
    @Column(name = "occurred_at", nullable = false) private OffsetDateTime occurredAt;
    @Column(name = "payload_json", nullable = false, columnDefinition = "TEXT") private String payloadJson;
    @Enumerated(EnumType.STRING) @Column(name = "status", nullable = false) private Status status;
    @Column(name = "attempts", nullable = false) private int attempts;
    @Column(name = "next_attempt_at", nullable = false) private OffsetDateTime nextAttemptAt;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt;
    @Column(name = "sent_at") private OffsetDateTime sentAt;
    @Column(name = "last_error") private String lastError;
}
