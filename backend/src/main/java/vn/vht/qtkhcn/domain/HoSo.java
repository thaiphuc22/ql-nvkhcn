package vn.vht.qtkhcn.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Hồ sơ (HoSo) — INSTANCE của MỘT luồng nghiệp vụ trên một {@link NhiemVu} (D8).
 * Port 1:1 từ webapp/src/data/dossiers.ts::HoSo (bản chuẩn hoá, KHÔNG bao gồm view-join NV —
 * xem NhiemVuController/HoSoController cho DTO join tương đương webapp's toView()).
 */
@Entity
@Table(name = "ho_so")
@Getter
@Setter
@NoArgsConstructor
public class HoSo {

    /** Mã hồ sơ, vd "HS-2026-018" — cũng là correlation key `maHoSo` trong process variables
     *  (docs/arch/camunda-design.md §5.2, webapp/src/data/variableContract.ts). */
    @Id
    @Column(name = "id", length = 32)
    private String id;

    /** FK → NhiemVu.ma. Không map @ManyToOne để giữ HoSo tách biệt/nhẹ theo đúng D8 — service
     *  layer tự join khi cần (mirror cách webapp dossiers.ts::toView làm ở tầng view, không ở model). */
    @Column(name = "ma_nv", nullable = false, length = 32)
    private String maNV;

    @Enumerated(EnumType.STRING)
    @Column(name = "loai", nullable = false, length = 16)
    private HoSoLoai loai;

    /** Mã quy trình đã chọn khi "Gửi duyệt" (vd "RD01.01"); rỗng khi còn draft. */
    @Column(name = "quy_trinh")
    private String quyTrinh;

    @Column(name = "quy_trinh_ten")
    private String quyTrinhTen;

    @Column(name = "nguoi_khoi_tao", nullable = false)
    private String nguoiKhoiTao;

    @Column(name = "ngay_tao", nullable = false)
    private LocalDate ngayTao;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false, length = 16)
    private DossierStatus trangThai = DossierStatus.DRAFT;

    @Column(name = "buoc_hien_tai", nullable = false)
    private int buocHienTai;

    /**
     * Zeebe process instance key sau khi "Gửi duyệt" tạo process instance thật (Mốc 3, D16).
     * NULL khi hồ sơ còn draft hoặc chưa nối Camunda thật. KHÔNG chứa dữ liệu nghiệp vụ — chỉ là
     * con trỏ tương quan, đúng ranh giới D3.
     */
    @Column(name = "zeebe_process_instance_key")
    private Long zeebeProcessInstanceKey;

    @OneToMany(mappedBy = "hoSo", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("buocIndex asc")
    private List<DossierStep> steps = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "ho_so_tai_lieu", joinColumns = @JoinColumn(name = "ho_so_id"))
    private List<TaiLieu> taiLieu = new ArrayList<>();
}
