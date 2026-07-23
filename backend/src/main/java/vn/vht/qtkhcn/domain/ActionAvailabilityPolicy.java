package vn.vht.qtkhcn.domain;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.OffsetDateTime;
import java.util.LinkedHashSet;
import java.util.Set;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "action_availability_policy")
@Getter
@Setter
@NoArgsConstructor
public class ActionAvailabilityPolicy {
    @Id
    @Column(length = 128)
    private String id;
    @Column(name = "action_code", nullable = false, length = 64)
    private String actionCode;
    @Column(length = 32)
    private String surface;
    @Column(name = "process_code", length = 64)
    private String processCode;
    @Column(name = "task_definition_key", length = 128)
    private String taskDefinitionKey;
    @Column(name = "dossier_status", length = 32)
    private String dossierStatus;
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "action_availability_role", joinColumns = @JoinColumn(name = "policy_id"))
    @Column(name = "role_code", nullable = false, length = 64)
    private Set<String> allowedRoleCodes = new LinkedHashSet<>();
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "action_availability_permission", joinColumns = @JoinColumn(name = "policy_id"))
    @Column(name = "permission_code", nullable = false, length = 64)
    private Set<String> requiredPermissions = new LinkedHashSet<>();
    @Column(name = "form_key", length = 128)
    private String formKey;
    @Column(name = "condition_expression", length = 1000)
    private String conditionExpression;
    @Column(name = "display_order", nullable = false)
    private int displayOrder;
    @Column(nullable = false)
    private boolean enabled;
    @Version
    @Column(nullable = false)
    private long version;
    @Column(name = "updated_by", nullable = false, length = 255)
    private String updatedBy;
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
