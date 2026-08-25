package vn.vht.qtkhcn.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "eform")
@Getter
@Setter
@NoArgsConstructor
public class Eform {
    @Id
    @Column(name = "form_key", length = 128)
    private String key;

    @Column(nullable = false, length = 255)
    private String ten;

    @Column(name = "mo_ta", nullable = false, length = 1000)
    private String moTa;

    @Column(length = 32)
    private String loai;

    @Column(name = "schema_json", nullable = false, columnDefinition = "text")
    private String schemaJson;

    /**
     * {@code APP} — BA vẽ trong Thư viện biểu mẫu; {@code CAMUNDA} — hút từ BPMN khách deploy.
     * Dòng CAMUNDA là read-only với app (Camunda là nơi authoring duy nhất) nhưng lượt đồng bộ sau
     * được ghi đè; dòng APP thì importer không bao giờ đụng vào.
     */
    @Column(name = "source", nullable = false, length = 16)
    private String source = EformSource.APP;

    /** Id nguyên văn trong BPMN — null với biểu mẫu do app tự vẽ. */
    @Column(name = "camunda_form_id", length = 255)
    private String camundaFormId;

    @Version
    @Column(nullable = false)
    private long version;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_by", nullable = false, length = 255)
    private String updatedBy;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
