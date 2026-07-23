package vn.vht.qtkhcn.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "action_studio_action")
@Getter
@Setter
@NoArgsConstructor
public class ActionStudioAction {
    @Id
    @Column(name = "action_code", length = 64)
    private String actionCode;
    @Column(name = "action_name", nullable = false, length = 255)
    private String actionName;
    @Column(name = "action_type", nullable = false, length = 16)
    private String actionType;
    @Column(length = 16)
    private String outcome;
    @Column(name = "requires_reason", nullable = false)
    private boolean requiresReason;
    @Column(name = "requires_evidence", nullable = false)
    private boolean requiresEvidence;
    @Column(name = "requires_confirm", nullable = false)
    private boolean requiresConfirm;
    @Column(nullable = false)
    private boolean active;
    @Column(nullable = false, length = 255)
    private String label;
    @Column(nullable = false, length = 64)
    private String icon;
    @Column(name = "ui_group", nullable = false, length = 16)
    private String uiGroup;
    @Column(nullable = false, length = 16)
    private String tone;
    @Column(name = "display_order", nullable = false)
    private int displayOrder;
    @Column(name = "help_text", length = 1000)
    private String helpText;
    @Version
    @Column(nullable = false)
    private long version;
    @Column(name = "updated_by", nullable = false, length = 255)
    private String updatedBy;
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
