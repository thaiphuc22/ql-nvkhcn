package vn.vht.qtkhcn.web.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import vn.vht.qtkhcn.domain.ServiceTaskBindingStatus;
import vn.vht.qtkhcn.domain.ServiceTaskConfigVersionStatus;
import vn.vht.qtkhcn.domain.ServiceTaskDefinitionStatus;
import vn.vht.qtkhcn.domain.ServiceTaskTypeCode;

/**
 * DTO cho API "Cấu hình tác vụ hệ thống" (đọc).
 *
 * Đây là dữ liệu THẬT chi phối job worker lúc chạy (xem {@code ServiceTaskConfigResolver}), khác với
 * seed in-memory ở `frontend-angular/src/app/core/models/service-task.ts`.
 *
 * Bốn cột JSONB trả về dạng Map/List chứ KHÔNG phải chuỗi (frontend khỏi parse lần hai) và cũng KHÔNG
 * phải {@code JsonNode}: classpath có cả Jackson 2 (`com.fasterxml`, do JPA/resolver dùng) lẫn Jackson 3
 * (`tools.jackson`, do Spring Framework 7 dùng cho HTTP message converter). Một {@code JsonNode} của
 * Jackson 2 lọt vào response sẽ bị Jackson 3 coi là POJO và serialize ra `{"array":false,"object":true,...}`
 * — đã dính đúng lỗi này một lần, contract test bắt được. Map/List thì cả hai đời Jackson đều hiểu.
 */
public final class ServiceTaskDtos {

    private ServiceTaskDtos() {}

    /** Dòng danh sách — đủ để hiển thị bảng, không kèm nội dung cấu hình. */
    public record DefinitionSummary(
            UUID id,
            String code,
            String name,
            String description,
            ServiceTaskTypeCode typeCode,
            ServiceTaskDefinitionStatus status,
            String ownerModule,
            int latestVersion,
            Integer activeVersion,
            List<String> tags,
            int bindingCount,
            OffsetDateTime updatedAt) {}

    public record DefinitionDetail(
            UUID id,
            String code,
            String name,
            String description,
            ServiceTaskTypeCode typeCode,
            ServiceTaskDefinitionStatus status,
            String ownerModule,
            int latestVersion,
            Integer activeVersion,
            List<String> tags,
            String createdBy,
            OffsetDateTime createdAt,
            String updatedBy,
            OffsetDateTime updatedAt,
            List<ConfigVersion> versions,
            List<Binding> bindings) {}

    public record ConfigVersion(
            UUID id,
            int version,
            Map<String, Object> config,
            List<Map<String, Object>> inputMapping,
            List<Map<String, Object>> outputMapping,
            Map<String, Object> errorPolicy,
            ServiceTaskConfigVersionStatus status,
            String changeNote,
            String createdBy,
            OffsetDateTime createdAt) {}

    /**
     * {@code elementId == null} = binding rộng theo {@code jobType}. {@code processCode} chỉ để hiển
     * thị — resolver KHÔNG dùng nó (xem ghi chú ở {@code ServiceTaskBinding}).
     */
    public record Binding(
            UUID id,
            String bpmnProcessId,
            String elementId,
            String jobType,
            UUID definitionId,
            String definitionCode,
            ServiceTaskBindingStatus bindingStatus,
            String processCode,
            String taskName,
            LocalDate effectiveFrom,
            LocalDate effectiveTo,
            String createdBy,
            OffsetDateTime updatedAt) {}

    public record DefinitionWriteRequest(
            @NotBlank String code,
            @NotBlank String name,
            String description,
            @NotNull ServiceTaskTypeCode typeCode,
            @NotBlank String ownerModule,
            List<String> tags,
            @NotNull Map<String, Object> config,
            List<Map<String, Object>> inputMapping,
            List<Map<String, Object>> outputMapping,
            @NotNull Map<String, Object> errorPolicy,
            String changeNote,
            String actor) {}
}
