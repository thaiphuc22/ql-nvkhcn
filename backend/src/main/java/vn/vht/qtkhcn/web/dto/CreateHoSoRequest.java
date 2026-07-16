package vn.vht.qtkhcn.web.dto;

import jakarta.validation.constraints.NotBlank;
import vn.vht.qtkhcn.domain.HoSoLoai;

/** Dựng hồ sơ mới ở trạng thái draft — port từ webapp/src/data/dossiers.ts::createDraftHoSo. */
public record CreateHoSoRequest(
        @NotBlank String maNV,
        HoSoLoai loai,
        @NotBlank String nguoiKhoiTao
) {
}
