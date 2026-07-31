package vn.vht.qtkhcn.hoso.web.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import vn.vht.qtkhcn.hoso.domain.HoiDongCap;

/** Tạo thủ công qua UI quản trị — {@code sourceTaskDefinitionKey} luôn NULL (xem HoiDongMutationService). */
public record CreateHoiDongRequest(
        @NotBlank String maHoiDong,
        @NotBlank String hoSoId,
        @NotNull HoiDongCap cap,
        String canCuPhapLy,
        @NotNull @Valid List<ThanhVienHoiDongRequest> thanhVien) {
}
