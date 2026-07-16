package vn.vht.qtkhcn.domain;

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

/**
 * Nhiệm vụ KHCN (NV KHCN) — thực thể MASTER, xuyên suốt vòng đời đề tài (D8).
 * Port 1:1 từ webapp/src/data/nhiemVu.ts::NhiemVu. Một NhiemVu có N HoSo (xem {@link HoSo}).
 * Khoá là {@code ma} (Mã NV KHCN), không dùng surrogate id — khớp cách seed mock hiện tại
 * (đồng bộ tương lai với NS/MS/SAP/QLTS/PLM dùng chung mã này).
 */
@Entity
@Table(name = "nhiem_vu")
@Getter
@Setter
@NoArgsConstructor
public class NhiemVu {

    /** Mã NV KHCN — khoá master, vd "RD.2026.018". */
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

    /** Dự toán tổng (PL1–PL6) — text tự do trong mock (vd "4.850.000.000 đ"); GAP: chưa có
     *  breakdown PL1–PL6 thật, xem F2 trong DELIVERY_STATE.md. */
    @Column(name = "du_toan")
    private String duToan;

    @Enumerated(EnumType.STRING)
    @Column(name = "giai_doan", nullable = false, length = 16)
    private GiaiDoan giaiDoan;
}
