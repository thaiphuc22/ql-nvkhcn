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
@Table(name = "integration_system")
@Getter
@Setter
@NoArgsConstructor
public class IntegrationSystem {
    @Id
    @Column(name = "system_key", length = 32)
    private String key;

    @Column(nullable = false, length = 255)
    private String ten;

    @Column(name = "mo_ta", nullable = false, length = 1000)
    private String moTa;

    @Column(name = "giao_thuc", nullable = false, length = 64)
    private String giaoThuc;

    @Column(nullable = false, length = 32)
    private String kieu;

    @Column(name = "sync_mode", nullable = false, length = 16)
    private String syncMode;

    @Column(name = "trang_thai", nullable = false, length = 16)
    private String trangThai;

    @Column(name = "lan_dong_bo_cuoi", length = 32)
    private String lanDongBoCuoi;

    @Column(name = "ban_ghi_24h", nullable = false)
    private int banGhi24h;

    @Column(name = "loi_24h", nullable = false)
    private int loi24h;

    @Column(name = "do_tre_ms", nullable = false)
    private int doTreMs;

    @Column(name = "hang_doi", nullable = false)
    private int hangDoi;

    @Column(nullable = false, length = 500)
    private String endpoint;

    @Column(name = "api_key_hash", length = 128)
    private String apiKeyHash;

    @Column(name = "api_key_tail", length = 8)
    private String apiKeyTail;

    @Column(nullable = false, length = 255)
    private String ref;

    @Version
    @Column(nullable = false)
    private long version;

    @Column(name = "updated_by", nullable = false, length = 255)
    private String updatedBy;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;
}
