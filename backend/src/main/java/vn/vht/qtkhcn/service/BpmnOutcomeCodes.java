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
 *
 * <p><b>Đây không còn là nguồn duy nhất.</b> Từ khoá do BA khai trong Danh mục nút nằm ở
 * {@link OutcomeKeywordCatalog} (bảng {@code action_studio_action_outcome}); lớp này là bảng MẶC
 * ĐỊNH dùng khi tra hụt hoặc CSDL lỗi. Mọi nơi cần tra phải gọi qua {@code OutcomeKeywordCatalog},
 * không gọi thẳng vào đây.
 */
public final class BpmnOutcomeCodes {
    /**
     * Tập mã nút rẽ nhánh theo <b>D10 — LOCKED</b>, đã <b>sửa bởi D10.1 (2026-08-25)</b> từ 4 lên 5
     * mã. Đây là NƠI DUY NHẤT viết ra tập này ở backend;
     * chỗ nào cần thì dẫn xuất từ đây chứ đừng chép lại literal, vì hai bản chép sẽ lệch nhau lúc
     * nào không biết — đúng cái đã xảy ra với {@link #TASK_RUNTIME_ACTIONS} trước đây.
     *
     * <p>Cố ý KHÔNG đọc từ CSDL: cho tập này thành dữ liệu là mở rộng được nó, tức phá D10 bằng cửa
     * sau. Muốn thêm mã nút thì phải sửa D10 trong {@code .harness/state/decisions.md} trước.
     */
    public static final Set<String> OUTCOME_ACTIONS =
            Set.of("SUBMIT", "APPROVE_STEP", "RETURN_STEP", "REJECT_STEP", "APPROVE_WITH_SUPPLEMENT");

    /**
     * Tập mã nút thực thi được khi <b>hoàn tất một user task</b> — bằng {@link #OUTCOME_ACTIONS} trừ
     * {@code SUBMIT}.
     *
     * <p>{@code SUBMIT} không nằm đây không phải do sót: nó không hoàn tất user task nào mà khởi tạo
     * tiến trình qua {@code DossierActionService.execute()} → {@code POST /api/ho-so/{id}/submit},
     * nên không có gateway để rẽ. Viết bằng phép trừ thay vì liệt kê lại để quan hệ đó hiện ra trong
     * mã, và để sửa D10 chỉ phải sửa một chỗ.
     */
    public static final Set<String> TASK_RUNTIME_ACTIONS = OUTCOME_ACTIONS.stream()
            .filter(code -> !"SUBMIT".equals(code)).collect(java.util.stream.Collectors.toUnmodifiableSet());

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
