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
@Table(name = "integration_mapping")
@Getter
@Setter
@NoArgsConstructor
public class IntegrationMapping {
    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "system_key", nullable = false, length = 32)
    private String he;

    @Column(name = "doi_tuong", nullable = false, length = 32)
    private String doiTuong;

    @Column(nullable = false, length = 8)
    private String chieu;

    @Column(name = "trang_thai", nullable = false, length = 16)
    private String trangThai;

    @Column(name = "cap_nhat_luc", nullable = false, length = 32)
    private String capNhatLuc;

    @Column(name = "cap_nhat_boi", nullable = false, length = 255)
    private String capNhatBoi;

    @Column(name = "fields_json", nullable = false, columnDefinition = "text")
    private String fieldsJson;

    @Column(name = "job_type", length = 128)
    private String jobType;

    @Version
    @Column(nullable = false)
    private long version;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;
}
