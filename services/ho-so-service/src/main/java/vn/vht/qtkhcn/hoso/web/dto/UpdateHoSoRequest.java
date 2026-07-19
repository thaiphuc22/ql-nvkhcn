package vn.vht.qtkhcn.hoso.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import vn.vht.qtkhcn.hoso.domain.HoSoLoai;

public record UpdateHoSoRequest(
        @NotNull HoSoLoai loai,
        @NotBlank String nguoiKhoiTao,
        @NotNull LocalDate ngayTao) {
}
