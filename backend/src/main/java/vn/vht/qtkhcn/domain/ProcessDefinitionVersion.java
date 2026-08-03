package vn.vht.qtkhcn.domain;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "process_definition_version")
@Getter
@Setter
@NoArgsConstructor
public class ProcessDefinitionVersion {

    @Id
    private UUID id;

    @Column(name = "catalog_id", nullable = false)
    private UUID catalogId;

    @Column(name = "camunda_version", nullable = false)
    private int camundaVersion;

    @Column(name = "resource_name", nullable = false, length = 255)
    private String resourceName;

    @Column(name = "checksum_sha256", nullable = false, length = 64)
    private String checksumSha256;

    @Column(name = "camunda_deployment_key", nullable = false)
    private long camundaDeploymentKey;

    @Column(name = "camunda_process_definition_key", nullable = false, unique = true)
    private long camundaProcessDefinitionKey;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private ProcessDefinitionStatus status;

    /** Mặc định APP để mọi đường deploy cũ giữ nguyên hành vi; chỉ importer đặt EXTERNAL. */
    @Enumerated(EnumType.STRING)
    @Column(name = "source", nullable = false, length = 16)
    private ProcessDefinitionSource source = ProcessDefinitionSource.APP;

    @Column(name = "imported_by", nullable = false)
    private String importedBy;

    @Column(name = "imported_at", nullable = false)
    private OffsetDateTime importedAt;

    @Column(name = "bpmn_xml", nullable = false, columnDefinition = "text")
    private String bpmnXml;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "process_definition_warning", joinColumns = @JoinColumn(name = "version_id"))
    @Column(name = "warning", nullable = false)
    private Set<String> warnings = new LinkedHashSet<>();
}
