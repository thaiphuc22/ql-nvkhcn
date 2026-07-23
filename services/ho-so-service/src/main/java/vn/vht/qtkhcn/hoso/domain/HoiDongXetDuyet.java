package vn.vht.qtkhcn.hoso.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "hoi_dong_xet_duyet")
@Getter
@Setter
@NoArgsConstructor
public class HoiDongXetDuyet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ho_so_id", nullable = false, length = 32)
    private String hoSoId;

    @Enumerated(EnumType.STRING)
    @Column(name = "cap", nullable = false, length = 16)
    private HoiDongCap cap;

    @Column(name = "source_task_definition_key", nullable = false, length = 64)
    private String sourceTaskDefinitionKey;

    @Column(name = "can_cu_phap_ly", columnDefinition = "text")
    private String canCuPhapLy;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @OneToMany(mappedBy = "hoiDong", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("id asc")
    private List<ThanhVienHoiDong> thanhVien = new ArrayList<>();
}
