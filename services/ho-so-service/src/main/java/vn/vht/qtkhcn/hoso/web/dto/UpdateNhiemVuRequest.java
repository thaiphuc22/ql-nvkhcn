package vn.vht.qtkhcn.hoso.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import vn.vht.qtkhcn.hoso.domain.Cap;
import vn.vht.qtkhcn.hoso.domain.GiaiDoan;

public record UpdateNhiemVuRequest(
        @NotBlank String ten,
        @NotNull Cap cap,
        @NotBlank String chuNhiemHoTen,
        String chuNhiemHocHamHocVi,
        String chuNhiemMaNhanVien,
        String chuNhiemEmail,
        @NotBlank String donViChuTri,
        String thoiGianThucHien,
        String duToan,
        @NotNull GiaiDoan giaiDoan) {
}
