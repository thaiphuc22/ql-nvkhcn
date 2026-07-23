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
@Table(name = "process_definition_draft_revision")
@Getter
@Setter
@NoArgsConstructor
public class ProcessDefinitionDraftRevision {
    @Id
    private UUID id;
    @Column(name = "draft_id", nullable = false)
    private UUID draftId;
    @Column(nullable = false)
    private long revision;
    @Column(name = "resource_name", nullable = false, length = 255)
    private String resourceName;
    @Column(name = "bpmn_process_id", nullable = false, length = 255)
    private String bpmnProcessId;
    @Column(nullable = false, length = 512)
    private String name;
    @Column(name = "bpmn_xml", nullable = false, columnDefinition = "text")
    private String bpmnXml;
    @Column(name = "checksum_sha256", nullable = false, length = 64)
    private String checksumSha256;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ProcessDefinitionDraftStatus status;
    @Column(nullable = false, length = 255)
    private String actor;
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;
}
