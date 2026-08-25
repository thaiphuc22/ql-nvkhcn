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
 * Một từ khoá outcome trong BPMN (giá trị chuỗi trên {@code conditionExpression} của nhánh gateway)
 * và mã nút mà nó được nhận diện thành.
 *
 * <p>{@code keyword} là khoá chính — một từ khoá chỉ thuộc đúng một nút. Xem
 * {@code V37__action_outcome_keyword.sql} cho lý do.
 */
@Entity
@Table(name = "action_studio_action_outcome")
@Getter
@Setter
@NoArgsConstructor
public class ActionOutcomeKeyword {
    @Id
    @Column(length = 64)
    private String keyword;
    @Column(name = "action_code", nullable = false, length = 64)
    private String actionCode;
    @Column(name = "created_by", nullable = false, length = 255)
    private String createdBy;
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;
}
