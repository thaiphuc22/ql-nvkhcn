package vn.vht.qtkhcn.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Đọc-chỉ: lịch sử job worker gần đây của một hệ tích hợp (drawer chi tiết `/tich-hop`). */
@Entity
@Table(name = "integration_job_run")
@Getter
@Setter
@NoArgsConstructor
public class IntegrationJobRun {
    @Id
    @Column(length = 32)
    private String id;

    @Column(name = "job_type", nullable = false, length = 128)
    private String jobType;

    @Column(name = "system_key", nullable = false, length = 32)
    private String he;

    @Column(name = "ma_ho_so", nullable = false, length = 32)
    private String maHoSo;

    @Column(name = "thoi_diem", nullable = false, length = 32)
    private String thoiDiem;

    @Column(name = "ket_qua", nullable = false, length = 16)
    private String ketQua;

    @Column(nullable = false)
    private int retries;

    @Column(name = "thong_diep", nullable = false, length = 500)
    private String thongDiep;
}
