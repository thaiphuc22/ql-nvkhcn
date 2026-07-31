package vn.vht.qtkhcn.hoso.web.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

/** hoSoId/cap là định danh nghiệp vụ, không đổi được sau khi tạo — chỉ sửa mã, căn cứ + thành viên. */
public record UpdateHoiDongRequest(
        @NotBlank String maHoiDong,
        String canCuPhapLy,
        @NotNull @Valid List<ThanhVienHoiDongRequest> thanhVien) {
}
