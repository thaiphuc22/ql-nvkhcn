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
@Table(name = "process_definition_catalog")
@Getter
@Setter
@NoArgsConstructor
public class ProcessDefinitionCatalog {

    @Id
    private UUID id;

    @Column(name = "bpmn_process_id", nullable = false, unique = true, length = 255)
    private String bpmnProcessId;

    @Column(name = "name", nullable = false, length = 512)
    private String name;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
