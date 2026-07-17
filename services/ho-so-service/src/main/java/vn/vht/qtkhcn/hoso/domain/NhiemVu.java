package vn.vht.qtkhcn.hoso.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "nhiem_vu")
@Getter
@Setter
@NoArgsConstructor
public class NhiemVu {

    @Id
    @Column(name = "ma", length = 32)
    private String ma;

    @Column(name = "ten", nullable = false, length = 512)
    private String ten;

    @Enumerated(EnumType.STRING)
    @Column(name = "cap", nullable = false, length = 8)
    private Cap cap;

    @Embedded
    private ChuNhiem chuNhiem;

    @Column(name = "don_vi_chu_tri", nullable = false)
    private String donViChuTri;

    @Column(name = "thoi_gian_thuc_hien")
    private String thoiGianThucHien;

    @Column(name = "du_toan")
    private String duToan;

    @Enumerated(EnumType.STRING)
    @Column(name = "giai_doan", nullable = false, length = 16)
    private GiaiDoan giaiDoan;
}
