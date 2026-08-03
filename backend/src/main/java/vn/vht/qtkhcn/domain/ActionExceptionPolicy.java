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
@Table(name = "action_exception_policy")
@Getter
@Setter
@NoArgsConstructor
public class ActionExceptionPolicy {
    @Id
    @Column(length = 128)
    private String id;
    @Column(name = "action_code", nullable = false, length = 64)
    private String actionCode;
    @Column(name = "object_type", nullable = false, length = 32)
    private String objectType;
    @Column(name = "process_code", length = 64)
    private String processCode;
    @Column(name = "from_step_key", length = 128)
    private String fromStepKey;
    @Column(name = "target_type", nullable = false, length = 16)
    private String targetType;
    @Column(name = "target_step_key", length = 128)
    private String targetStepKey;
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "action_exception_role", joinColumns = @JoinColumn(name = "policy_id"))
    @Column(name = "role_code", nullable = false, length = 64)
    private Set<String> allowedRoleCodes = new LinkedHashSet<>();
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "action_exception_permission", joinColumns = @JoinColumn(name = "policy_id"))
    @Column(name = "permission_code", nullable = false, length = 64)
    private Set<String> requiredPermissions = new LinkedHashSet<>();
    @Column(name = "requires_approval", nullable = false)
    private boolean requiresApproval;
    @Column(name = "requires_reason", nullable = false)
    private boolean requiresReason;
    @Column(name = "requires_evidence", nullable = false)
    private boolean requiresEvidence;
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
