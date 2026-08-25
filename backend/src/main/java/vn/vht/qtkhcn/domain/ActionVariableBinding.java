package vn.vht.qtkhcn.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Một quy tắc <b>trường biểu mẫu → biến Camunda</b> cho đúng một (quy trình, bước, nút).
 *
 * <p>Khoá theo selector chứ không theo {@code policy_id} — xem {@code V38__action_variable_binding.sql}
 * cho lý do (scaffold tạo lại policy với id mới).
 *
 * <p>Đây là <b>ngoại lệ hẹp</b> của D3, không phải cơ chế gửi kèm biểu mẫu cho mọi bước: chỉ những
 * trường được khai ở đây mới đi kèm, từng dòng một, và BA nhìn thấy chúng trong màn Đối soát.
 */
@Entity
@Table(name = "action_variable_binding")
@Getter
@Setter
@NoArgsConstructor
public class ActionVariableBinding {
    @Id
    @Column(length = 128)
    private String id;
    @Column(name = "process_code", nullable = false, length = 64)
    private String processCode;
    @Column(name = "task_definition_key", nullable = false, length = 128)
    private String taskDefinitionKey;
    @Column(name = "action_code", nullable = false, length = 64)
    private String actionCode;
    /** Tên trường trong eForm (khoá {@code key} của component form-js). */
    @Column(name = "form_field", nullable = false, length = 128)
    private String formField;
    /** Tên biến gửi vào Zeebe. Thường trùng {@code formField} nhưng không bắt buộc. */
    @Column(name = "variable_name", nullable = false, length = 128)
    private String variableName;
    @Column(name = "ghi_chu", length = 1000)
    private String ghiChu;
    @Column(name = "updated_by", nullable = false, length = 255)
    private String updatedBy;
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
