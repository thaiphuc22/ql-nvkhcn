package vn.vht.qtkhcn.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import vn.vht.qtkhcn.domain.HoSoLoai;

/** Dựng hồ sơ mới ở trạng thái draft — port từ webapp/src/data/dossiers.ts::createDraftHoSo. */
public record CreateHoSoRequest(
        @NotBlank String maNV,
        HoSoLoai loai,
        @NotBlank String nguoiKhoiTao,
        LocalDate ngayTao,
        List<@Valid CreateTaiLieuRequest> taiLieu
) {
    /** Giữ tương thích cho các caller nội bộ/test đã dùng contract Mốc 2. */
    public CreateHoSoRequest(String maNV, HoSoLoai loai, String nguoiKhoiTao) {
        this(maNV, loai, nguoiKhoiTao, null, null);
    }
}
