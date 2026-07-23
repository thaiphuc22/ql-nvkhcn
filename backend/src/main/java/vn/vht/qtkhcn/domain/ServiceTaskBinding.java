package vn.vht.qtkhcn.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Gắn một service task trong BPMN với cấu hình sẽ chi phối nó lúc chạy.
 *
 * Resolve theo {@code bpmnProcessId + elementId} — đúng bộ mà {@code ActivatedJob} đưa cho worker.
 * {@code elementId == null} nghĩa là binding rộng theo {@code jobType} (một cấu hình phục vụ mọi
 * element dùng job type đó). {@code processCode} chỉ để hiển thị/đối soát, KHÔNG dùng để resolve.
 */
@Entity
@Table(name = "service_task_binding")
@Getter
@Setter
@NoArgsConstructor
public class ServiceTaskBinding {
    @Id
    private UUID id;

    @Column(name = "bpmn_process_id", nullable = false, length = 255)
    private String bpmnProcessId;

    @Column(name = "element_id", length = 255)
    private String elementId;

    @Column(name = "job_type", nullable = false, length = 255)
    private String jobType;

    @Column(name = "definition_id", nullable = false)
    private UUID definitionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "binding_status", nullable = false, length = 16)
    private ServiceTaskBindingStatus bindingStatus;

    @Column(name = "process_code", nullable = false, length = 64)
    private String processCode;

    @Column(name = "task_name", nullable = false, length = 255)
    private String taskName;

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Column(name = "created_by", nullable = false, length = 255)
    private String createdBy;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
