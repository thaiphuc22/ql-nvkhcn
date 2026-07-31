package vn.vht.qtkhcn.service;

import java.util.Locale;
import java.util.Set;

/**
 * Ánh xạ giữa <b>outcome trong BPMN</b> (giá trị chuỗi trong conditionExpression của nhánh gateway,
 * ví dụ {@code = ketQuaThamDinh = "hieu_chinh"}) và <b>action code của Ma trận Hành động</b>.
 *
 * <p>Tách ra khỏi {@code ActionStudioService} vì bảng này giờ có hai nơi dùng và chúng PHẢI khớp
 * nhau: {@code ActionStudioService.reconcile/scaffold} sinh luật hiển thị nút, còn
 * {@code DeployedBpmnRoutingReader.actionVariables} sinh biến điều khiển gửi vào Zeebe khi bấm đúng
 * nút đó. Hai bảng lệch nhau nghĩa là nút hiện ra nhưng bấm xong hồ sơ đi sai nhánh.
 */
public final class BpmnOutcomeCodes {
    private static final Set<String> OUTCOME_ACTIONS =
            Set.of("SUBMIT", "APPROVE_STEP", "RETURN_STEP", "REJECT_STEP");

    private BpmnOutcomeCodes() {
    }

    /** @return action code tương ứng, hoặc {@code null} nếu outcome chưa nằm trong quy ước. */
    public static String actionCode(String outcome) {
        String normalized = outcome == null ? "" : outcome.trim().toLowerCase(Locale.ROOT);
        return switch (normalized) {
            case "submit", "gui", "gui_duyet", "tiep_tuc" -> "SUBMIT";
            case "approve", "dong_y", "dat", "phe_duyet" -> "APPROVE_STEP";
            case "dong_y_bo_sung" -> "APPROVE_WITH_SUPPLEMENT";
            case "return", "hieu_chinh", "yeu_cau_hieu_chinh", "tra_lai" -> "RETURN_STEP";
            case "reject", "khong_dong_y", "khong_dat", "tu_choi" -> "REJECT_STEP";
            default -> null;
        };
    }

    /** Action gắn với một nhánh outcome thật (khác nhóm hành động phụ trợ như bình luận, tải tệp). */
    public static boolean isOutcomeAction(String actionCode) {
        return OUTCOME_ACTIONS.contains(actionCode);
    }
}
