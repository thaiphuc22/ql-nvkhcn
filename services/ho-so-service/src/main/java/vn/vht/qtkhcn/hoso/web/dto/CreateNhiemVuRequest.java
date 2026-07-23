package vn.vht.qtkhcn.hoso.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import vn.vht.qtkhcn.hoso.domain.Cap;

public record CreateNhiemVuRequest(
        @NotBlank String ten,
        @NotNull Cap cap,
        @NotBlank String chuNhiemHoTen,
        String chuNhiemHocHamHocVi,
        String chuNhiemMaNhanVien,
        String chuNhiemEmail,
        @NotBlank String donViChuTri,
        String thoiGianThucHien,
        String duToan) {
}
