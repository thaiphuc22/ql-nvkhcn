package vn.vht.qtkhcn.hoso.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "workflow_process_projection")
@Getter @Setter @NoArgsConstructor
public class WorkflowProcessProjection {
    public enum State { ACTIVE, COMPLETED, REJECTED, CANCELLED }

    @Id @Column(name = "process_instance_id", length = 32) private String processInstanceId;
    @Column(name = "ho_so_id", nullable = false, length = 32) private String hoSoId;
    @Enumerated(EnumType.STRING)
    @Column(name = "state", nullable = false, length = 16) private State state;
    @Column(name = "last_event_at", nullable = false) private OffsetDateTime lastEventAt;
    @Column(name = "last_incident_key", length = 32) private String lastIncidentKey;
    @Column(name = "last_incident_message", length = 512) private String lastIncidentMessage;
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt;
}
