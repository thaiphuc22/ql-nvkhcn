package vn.vht.qtkhcn.hoso.web.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.util.List;
import vn.vht.qtkhcn.hoso.domain.HoSoLoai;

public record CreateHoSoRequest(
        @NotBlank String maNV,
        HoSoLoai loai,
        @NotBlank String nguoiKhoiTao,
        LocalDate ngayTao,
        List<@Valid CreateTaiLieuRequest> taiLieu) {
}
