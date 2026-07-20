package vn.vht.qtkhcn.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "approval_slot")
@Getter
@Setter
@NoArgsConstructor
public class ApprovalSlot {
    @Id
    @Column(length = 128)
    private String code;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(length = 1000)
    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "process_groups", nullable = false, columnDefinition = "jsonb")
    private java.util.List<String> processGroups = new java.util.ArrayList<>();

    @Column(nullable = false, length = 16)
    private String status;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Column(name = "updated_by", nullable = false, length = 255)
    private String updatedBy;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
