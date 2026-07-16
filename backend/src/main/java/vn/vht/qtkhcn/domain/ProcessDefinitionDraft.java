package vn.vht.qtkhcn.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "process_definition_draft")
@Getter
@Setter
@NoArgsConstructor
public class ProcessDefinitionDraft {
    @Id
    private UUID id;

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

    @Version
    @Column(nullable = false)
    private long revision;

    @Column(name = "created_by", nullable = false, length = 255)
    private String createdBy;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_by", nullable = false, length = 255)
    private String updatedBy;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "validated_at")
    private OffsetDateTime validatedAt;

    @Column(name = "deployed_version_id")
    private UUID deployedVersionId;
}
