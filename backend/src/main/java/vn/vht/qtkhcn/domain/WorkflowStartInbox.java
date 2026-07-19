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
@Table(name = "workflow_start_inbox")
@Getter @Setter @NoArgsConstructor
public class WorkflowStartInbox {
    public enum Status { RECEIVED, UNKNOWN, STARTED, FAILED }
    @Id @Column(name = "request_id") private UUID requestId;
    @Column(name = "payload_hash", nullable = false, length = 64) private String payloadHash;
    @Column(name = "payload_json", nullable = false, columnDefinition = "text") private String payloadJson;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 16) private Status status;
    @Column(nullable = false) private int attempts;
    @Column(name = "process_instance_id", length = 32) private String processInstanceId;
    @Column(name = "process_definition_id") private String processDefinitionId;
    @Column(name = "process_version") private Integer processVersion;
    @Column(name = "error_code", length = 64) private String errorCode;
    @Column(name = "error_message", length = 512) private String errorMessage;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt;
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt;
}
