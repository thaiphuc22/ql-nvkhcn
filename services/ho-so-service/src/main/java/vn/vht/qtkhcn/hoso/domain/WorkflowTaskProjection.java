package vn.vht.qtkhcn.hoso.domain;

import jakarta.persistence.Column;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import jakarta.persistence.FetchType;
import java.time.OffsetDateTime;
import java.util.LinkedHashSet;
import java.util.Set;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "workflow_task_projection")
@Getter @Setter @NoArgsConstructor
public class WorkflowTaskProjection {
    public enum State { ACTIVE, COMPLETED }

    @Id @Column(name = "task_key", length = 32) private String taskKey;
    @Column(name = "ho_so_id", nullable = false, length = 32) private String hoSoId;
    @Column(name = "process_instance_id", nullable = false, length = 32) private String processInstanceId;
    @Column(name = "task_definition_key", nullable = false, length = 128) private String taskDefinitionKey;
    @Column(name = "task_name", nullable = false) private String taskName;
    @Enumerated(EnumType.STRING)
    @Column(name = "state", nullable = false, length = 16) private State state;
    @Column(name = "assignee", length = 128) private String assignee;
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "workflow_task_candidate_user", joinColumns = @JoinColumn(name = "task_key"))
    @Column(name = "code") private Set<String> candidateUsers = new LinkedHashSet<>();
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "workflow_task_candidate_group", joinColumns = @JoinColumn(name = "task_key"))
    @Column(name = "code") private Set<String> candidateGroups = new LinkedHashSet<>();
    @Column(name = "created_at") private OffsetDateTime createdAt;
    @Column(name = "completed_at") private OffsetDateTime completedAt;
    @Column(name = "due_at") private OffsetDateTime dueAt;
    @Column(name = "form_key") private String formKey;
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt;
}
