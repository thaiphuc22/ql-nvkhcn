package vn.vht.qtkhcn.hoso.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "hoi_dong_thanh_vien")
@Getter
@Setter
@NoArgsConstructor
public class ThanhVienHoiDong {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hoi_dong_id", nullable = false)
    private HoiDongXetDuyet hoiDong;

    @Column(name = "ho_ten", nullable = false)
    private String hoTen;

    @Column(name = "vai_tro_trong_hoi_dong")
    private String vaiTroTrongHoiDong;
}
