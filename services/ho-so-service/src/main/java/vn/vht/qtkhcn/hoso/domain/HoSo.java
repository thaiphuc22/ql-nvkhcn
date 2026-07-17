package vn.vht.qtkhcn.hoso.domain;

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

@Entity
@Table(name = "ho_so")
@Getter
@Setter
@NoArgsConstructor
public class HoSo {

    @Id
    @Column(name = "id", length = 32)
    private String id;

    @Column(name = "ma_nv", nullable = false, length = 32)
    private String maNV;

    @Enumerated(EnumType.STRING)
    @Column(name = "loai", nullable = false, length = 16)
    private HoSoLoai loai;

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
    private DossierStatus trangThai;

    @Column(name = "buoc_hien_tai", nullable = false)
    private int buocHienTai;

    @Column(name = "zeebe_process_instance_key")
    private Long zeebeProcessInstanceKey;

    @OneToMany(mappedBy = "hoSo", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("buocIndex asc")
    private List<DossierStep> steps = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "ho_so_tai_lieu", joinColumns = @JoinColumn(name = "ho_so_id"))
    private List<TaiLieu> taiLieu = new ArrayList<>();
}
