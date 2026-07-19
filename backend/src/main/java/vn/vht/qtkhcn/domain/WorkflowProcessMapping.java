package vn.vht.qtkhcn.domain;

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
@Table(name = "workflow_process_mapping")
@Getter @Setter @NoArgsConstructor
public class WorkflowProcessMapping {
    @Id @Column(name = "request_id") private UUID requestId;
    @Column(name = "business_key", nullable = false) private String businessKey;
    @Column(name = "ho_so_id", nullable = false) private String hoSoId;
    @Column(name = "nhiem_vu_id", nullable = false) private String nhiemVuId;
    @Column(name = "process_instance_id", nullable = false, unique = true) private String processInstanceId;
    @Column(name = "process_definition_id", nullable = false) private String processDefinitionId;
    @Column(name = "process_version", nullable = false) private int processVersion;
    @Column(name = "started_at", nullable = false) private OffsetDateTime startedAt;
}
