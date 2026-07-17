package vn.vht.qtkhcn.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Tài liệu thành phần được chọn trên màn tạo mới hồ sơ. */
public record CreateTaiLieuRequest(
        @NotBlank @Size(max = 255) String ten,
        @NotBlank @Size(max = 32) String loai
) {
}
