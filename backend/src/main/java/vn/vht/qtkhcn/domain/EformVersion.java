package vn.vht.qtkhcn.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "eform_version")
@Getter
@Setter
@NoArgsConstructor
public class EformVersion {
    @Id
    @Column(name = "revision_key", length = 180)
    private String revisionKey;

    @Column(name = "form_key", nullable = false, length = 128)
    private String formKey;

    @Column(nullable = false)
    private long version;

    @Column(nullable = false, length = 255)
    private String ten;

    @Column(name = "mo_ta", nullable = false, length = 1000)
    private String moTa;

    @Column(length = 32)
    private String loai;

    @Column(name = "schema_json", nullable = false, columnDefinition = "text")
    private String schemaJson;

    @Column(name = "created_by", nullable = false, length = 255)
    private String createdBy;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;
}
