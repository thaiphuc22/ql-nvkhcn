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

/** Artifact bất biến — activate chỉ trỏ definition sang một version, không sửa version cũ. */
@Entity
@Table(name = "service_task_config_version")
@Getter
@Setter
@NoArgsConstructor
public class ServiceTaskConfigVersion {
    @Id
    private UUID id;

    @Column(name = "definition_id", nullable = false)
    private UUID definitionId;

    @Column(nullable = false)
    private int version;

    @Column(name = "config_json", nullable = false, columnDefinition = "jsonb")
    private String configJson;

    @Column(name = "input_mapping", nullable = false, columnDefinition = "jsonb")
    private String inputMapping;

    @Column(name = "output_mapping", nullable = false, columnDefinition = "jsonb")
    private String outputMapping;

    @Column(name = "error_policy", nullable = false, columnDefinition = "jsonb")
    private String errorPolicy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private ServiceTaskConfigVersionStatus status;

    @Column(name = "change_note", nullable = false, length = 500)
    private String changeNote;

    @Column(name = "created_by", nullable = false, length = 255)
    private String createdBy;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;
}
