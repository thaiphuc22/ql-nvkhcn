package vn.vht.qtkhcn.service;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.Optional;
import vn.vht.qtkhcn.domain.ServiceTaskTypeCode;

/**
 * Cấu hình đã resolve cho một job đang chạy: definition ACTIVE + config version ACTIVE + binding
 * ACTIVE. Worker chỉ nhận được record này khi CẢ BA đều hợp lệ — không có trạng thái nửa vời.
 *
 * @param definitionCode mã definition (để log/trace, ví dụ CHECK_CHU_TRUONG_TD)
 * @param typeCode       loại tác vụ, quyết định cách đọc {@code config}
 * @param versionNo      số hiệu config version đang active — log ra để truy vết đúng bản cấu hình
 * @param config         thân {@code config_json} của version
 */
public record ResolvedServiceTaskConfig(
        String definitionCode,
        ServiceTaskTypeCode typeCode,
        int versionNo,
        JsonNode config) {

    /** Tên biến process sẽ nhận kết quả (EVALUATE_DECISION). */
    public Optional<String> resultVariable() {
        return text("resultVariable");
    }

    /** Mã DMN/decision được trỏ tới. */
    public Optional<String> decisionCode() {
        return text("decisionCode");
    }

    /**
     * Kết quả stub khi tác vụ chưa nối được nguồn dữ liệu thật.
     *
     * Đây là escape hatch có chủ ý: giá trị vốn hard-code trong Java được đưa ra cấu hình để nhìn
     * thấy và sửa được mà không build lại. Rỗng nghĩa là cấu hình KHÔNG khai stub — khi đó worker
     * phải tự tính thật chứ không được đoán.
     */
    public Optional<Boolean> stubResult() {
        JsonNode node = config.get("stubResult");
        return node != null && node.isBoolean() ? Optional.of(node.booleanValue()) : Optional.empty();
    }

    private Optional<String> text(String field) {
        JsonNode node = config.get(field);
        return node != null && node.isTextual() && !node.textValue().isBlank()
                ? Optional.of(node.textValue())
                : Optional.empty();
    }
}
