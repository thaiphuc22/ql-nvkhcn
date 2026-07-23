package vn.vht.qtkhcn.hoso.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
public class ChuNhiem {

    @Column(name = "chu_nhiem_ho_ten", nullable = false)
    private String hoTen;

    @Column(name = "chu_nhiem_hoc_ham_hoc_vi")
    private String hocHamHocVi;

    @Column(name = "chu_nhiem_ma_nhan_vien")
    private String maNhanVien;

    @Column(name = "chu_nhiem_email")
    private String email;

    @Column(name = "chu_nhiem_sdt")
    private String sdt;

    @Column(name = "chu_nhiem_don_vi_cong_tac")
    private String donViCongTac;

    public String label() {
        return hocHamHocVi != null && !hocHamHocVi.isBlank() ? hocHamHocVi + " " + hoTen : hoTen;
    }
}
