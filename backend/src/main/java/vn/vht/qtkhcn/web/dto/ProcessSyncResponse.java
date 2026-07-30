package vn.vht.qtkhcn.web.dto;

import java.util.List;
import java.util.UUID;

/**
 * Kết quả một lượt "Đồng bộ từ Camunda" — hút quy trình deploy thẳng lên engine (Modeler, zbctl, CI)
 * về {@code process_definition_catalog} để người dùng chọn được khi gửi duyệt.
 *
 * Trả cả {@code failures} thay vì ném lỗi ở definition đầu tiên hỏng: một quy trình không đọc được
 * XML không được phép chặn những quy trình còn lại vào catalog.
 *
 * @param scanned      số process definition (bản mới nhất) đọc được từ engine trong lượt này
 * @param imported     số bản version mới ghi vào catalog
 * @param alreadyKnown số definition catalog đã biết (khớp {@code camundaProcessDefinitionKey})
 */
public record ProcessSyncResponse(
        int scanned,
        int imported,
        int alreadyKnown,
        List<ImportedProcess> importedProcesses,
        List<SyncFailure> failures,
        List<String> warnings) {

    /** @param newCatalog true = quy trình hoàn toàn mới; false = version mới của quy trình đã có. */
    public record ImportedProcess(UUID catalogId, UUID versionId, String bpmnProcessId, String name,
            int version, boolean newCatalog) {
    }

    public record SyncFailure(String bpmnProcessId, String message) {
    }
}
