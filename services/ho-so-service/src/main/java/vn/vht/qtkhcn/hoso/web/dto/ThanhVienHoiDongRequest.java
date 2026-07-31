package vn.vht.qtkhcn.hoso.web.dto;

import jakarta.validation.constraints.NotBlank;

/** {@code userId} tùy chọn — chỉ ghi tên là hợp lệ (khớp mẫu QĐ nhập tay không gắn tài khoản). */
public record ThanhVienHoiDongRequest(@NotBlank String hoTen, String userId, String vaiTroTrongHoiDong) {
}
