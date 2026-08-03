package vn.vht.qtkhcn.web.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Một quy trình người dùng có thể chọn khi gửi duyệt hồ sơ.
 *
 * Tách khỏi {@link ProcessDefinitionSummaryResponse} có chủ đích: summary phục vụ màn quản trị
 * `/quy-trinh` (kèm resourceName/status kỹ thuật), còn record này phục vụ người dùng nghiệp vụ chọn
 * quy trình — chỉ mang thứ giúp họ quyết định.
 *
 * {@code userTaskCount} đọc từ chính BPMN đã deploy (qua {@code DeployedBpmnRoutingReader}), tức
 * cùng nguồn mà runtime dùng để sinh bước hồ sơ. Bằng 0 nghĩa là quy trình không có userTask nào —
 * chọn vào thì hồ sơ chạy tới cuối mà không sinh việc cho ai. KHÔNG chặn ở đây (quyết định của user
 * 2026-07-28: cho phép chọn tự do, không guard), chỉ cấp đủ dữ liệu để UI cảnh báo.
 */
public record SelectableProcessResponse(
        UUID id,
        String bpmnProcessId,
        String name,
        int latestVersion,
        int userTaskCount,
        OffsetDateTime updatedAt
) {
}
