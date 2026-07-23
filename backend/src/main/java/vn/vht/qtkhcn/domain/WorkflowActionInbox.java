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
@Table(name = "workflow_action_inbox")
@Getter @Setter @NoArgsConstructor
public class WorkflowActionInbox {
    public enum Status { RECEIVED, UNKNOWN, COMPLETED, FAILED }

    @Id @Column(name = "request_id") private UUID requestId;
    @Column(name = "payload_hash", nullable = false) private String payloadHash;
    @Column(name = "payload_json", nullable = false, columnDefinition = "TEXT") private String payloadJson;
    @Column(name = "task_key", nullable = false) private String taskKey;
    @Column(name = "task_definition_key") private String taskDefinitionKey;
    @Column(name = "process_instance_id") private String processInstanceId;
    @Column(name = "ho_so_id") private String hoSoId;
    @Column(name = "action_code", nullable = false) private String actionCode;
    @Column(name = "actor_id", nullable = false) private String actorId;
    @Column(name = "comment_text", columnDefinition = "TEXT") private String comment;
    @Column(name = "form_data_json", nullable = false, columnDefinition = "TEXT") private String formDataJson;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private Status status;
    @Column(nullable = false) private int attempts;
    @Column(name = "error_code") private String errorCode;
    @Column(name = "error_message") private String errorMessage;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt;
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt;
    @Column(name = "completed_at") private OffsetDateTime completedAt;
}
