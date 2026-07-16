package vn.vht.qtkhcn.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "bpmn_test_session")
@Getter @Setter @NoArgsConstructor
public class BpmnTestSession {
    @Id private UUID id;
    @Column(name = "draft_id", nullable = false) private UUID draftId;
    @Column(name = "draft_revision", nullable = false) private long draftRevision;
    @Column(name = "correlation_id", nullable = false, unique = true) private String correlationId;
    @Column(nullable = false) private String actor;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private BpmnTestStatus status;
    @Column(name = "process_definition_key") private Long processDefinitionKey;
    @Column(name = "process_instance_key") private Long processInstanceKey;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "initial_variables", nullable = false, columnDefinition = "jsonb") private String initialVariables;
    @Column(name = "failure_message", columnDefinition = "text") private String failureMessage;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt;
    @Column(name = "expires_at", nullable = false) private OffsetDateTime expiresAt;
    @Column(name = "ended_at") private OffsetDateTime endedAt;
}
