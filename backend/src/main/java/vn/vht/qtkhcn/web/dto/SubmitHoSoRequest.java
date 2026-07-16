package vn.vht.qtkhcn.web.dto;

import jakarta.validation.constraints.NotBlank;

/** "Gửi duyệt" — chọn quy trình cho hồ sơ draft, dựng chuỗi bước phê duyệt (Mốc 2), khởi tạo
 *  process instance Zeebe thật khi luồng = RD01.01 (Mốc 3, xem RD0101ProcessService). */
public record SubmitHoSoRequest(
        @NotBlank String quyTrinh,
        @NotBlank String quyTrinhTen
) {
}
