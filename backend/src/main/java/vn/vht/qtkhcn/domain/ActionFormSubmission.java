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
@Table(name = "action_form_submission")
@Getter @Setter @NoArgsConstructor
public class ActionFormSubmission {
    public enum Status { DRAFT, PENDING, COMPLETED, FAILED }

    @Id private UUID id;
    @Column(name = "request_id", nullable = false) private UUID requestId;
    @Column(name = "dossier_id", nullable = false, length = 128) private String dossierId;
    @Column(name = "task_key", nullable = false, length = 128) private String taskKey;
    @Column(name = "task_definition_key", nullable = false, length = 128) private String taskDefinitionKey;
    @Column(name = "policy_id", nullable = false, length = 128) private String policyId;
    @Column(name = "bundle_version", nullable = false) private long bundleVersion;
    @Column(name = "form_key", nullable = false, length = 128) private String formKey;
    @Column(name = "form_version") private Long formVersion;
    @Column(name = "output_namespace", nullable = false, length = 128) private String outputNamespace;
    @Column(name = "action_code", nullable = false, length = 64) private String actionCode;
    @Column(name = "actor_id", nullable = false, length = 255) private String actorId;
    @Column(name = "data_json", nullable = false, columnDefinition = "TEXT") private String dataJson;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 16) private Status status;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt;
    @Column(name = "completed_at") private OffsetDateTime completedAt;
}
