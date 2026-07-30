package vn.vht.qtkhcn.web.dto;

import java.util.List;

/**
 * Chẩn đoán "quy trình này chạy được chưa" cho MỘT quy trình đã deploy — đọc-thôi, không chặn ai.
 *
 * <p>Đây là nơi các kiểm tra của Lát 0 (guard deploy-time) được chuyển tới sau khi user quyết định
 * "cứ tạm thời cho phép deploy từ App, chưa cần warning hoặc chặn cứng" (2026-07-28). Deploy vẫn
 * thông suốt; hệ quả thì hiện ra ở đây, TRƯỚC khi có hồ sơ chạy vào và treo.
 *
 * @param status  {@code ok} | {@code warn} | {@code error} — mức nặng nhất trong các dòng bên dưới
 * @param notes   nhận xét ở mức toàn quy trình (vd không có user task nào)
 */
public record ProcessReadinessResponse(
        String bpmnProcessId,
        String name,
        int camundaVersion,
        String source,
        String status,
        List<UserTaskReadiness> userTasks,
        List<ServiceTaskReadiness> serviceTasks,
        List<String> notes) {

    /**
     * @param formKey         formKey khai trong BPMN ({@code zeebe:formDefinition}), null nếu chưa gắn
     * @param formExists      formKey có tồn tại trong thư viện biểu mẫu hay không
     * @param unknownRoleCodes candidateGroups không có trong danh mục vai trò — task sẽ tạo ra nhưng
     *                        không ai nhìn thấy để xử lý
     * @param boundActions    action code đã có luật ghim đúng bước này
     * @param missingActions  nhánh BPMN chưa có luật ghim (đang phải sống nhờ luật chung, nếu có)
     */
    public record UserTaskReadiness(
            String elementId,
            String name,
            String formKey,
            boolean formExists,
            List<String> candidateGroups,
            List<String> unknownRoleCodes,
            boolean dynamicAssignment,
            List<String> boundActions,
            List<String> missingActions,
            String status,
            List<String> issues) {
    }

    /**
     * @param jobType         {@code zeebe:taskDefinition type}
     * @param workerRegistered backend này có {@code @JobWorker} nào lắng nghe job type đó không
     */
    public record ServiceTaskReadiness(
            String elementId,
            String name,
            String jobType,
            boolean workerRegistered,
            String status,
            String issue) {
    }
}
