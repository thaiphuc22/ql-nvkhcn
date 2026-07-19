package vn.vht.qtkhcn.hoso.domain;

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
@Table(name = "workflow_event_inbox")
@Getter @Setter @NoArgsConstructor
public class WorkflowEventInbox {
    @Id @Column(name = "event_id") private UUID eventId;
    @Column(name = "event_type", nullable = false) private String eventType;
    @Column(name = "payload_hash", nullable = false, length = 64) private String payloadHash;
    @Column(name = "correlation_id", nullable = false) private String correlationId;
    @Column(name = "ho_so_id", nullable = false) private String hoSoId;
    @Column(name = "process_instance_id", nullable = false) private String processInstanceId;
    @Column(name = "occurred_at", nullable = false) private OffsetDateTime occurredAt;
    @Column(name = "payload_json", nullable = false, columnDefinition = "TEXT") private String payloadJson;
    @Column(name = "received_at", nullable = false) private OffsetDateTime receivedAt;
    @Column(name = "processed_at") private OffsetDateTime processedAt;
    @Column(name = "processing_error", length = 512) private String processingError;
}
