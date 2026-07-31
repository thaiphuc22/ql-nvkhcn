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

    /**
     * Định danh tài khoản (email viết thường) — cùng hệ với {@code X-QTKHCN-User-Id},
     * {@code WorkflowTaskProjection.assignee} và {@code candidate_users}, để danh sách hội đồng đưa
     * thẳng vào {@code candidateUsers} của user task được. NULL với hội đồng chỉ ghi họ tên (dữ liệu
     * trước V11) — khi đó bước họp hội đồng rơi về hành vi cũ theo {@code candidateGroups}.
     */
    @Column(name = "user_id", length = 128)
    private String userId;

    @Column(name = "vai_tro_trong_hoi_dong")
    private String vaiTroTrongHoiDong;
}
