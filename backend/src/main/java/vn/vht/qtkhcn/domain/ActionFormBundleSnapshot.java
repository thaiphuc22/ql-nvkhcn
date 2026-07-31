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
@Table(name = "action_form_bundle_snapshot")
@Getter @Setter @NoArgsConstructor
public class ActionFormBundleSnapshot {
    @Id @Column(length = 255) private String id;
    @Column(name = "policy_id", nullable = false, length = 128) private String policyId;
    @Column(name = "bundle_version", nullable = false) private long bundleVersion;
    @Column(name = "config_json", nullable = false, columnDefinition = "TEXT") private String configJson;
    @Column(name = "created_by", nullable = false, length = 255) private String createdBy;
    @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt;
}
