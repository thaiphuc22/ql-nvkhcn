package vn.vht.qtkhcn.hoso.web.dto;

import java.time.OffsetDateTime;
import java.util.List;
import vn.vht.qtkhcn.hoso.domain.HoiDongCap;
import vn.vht.qtkhcn.hoso.domain.HoiDongXetDuyet;

/** Hội đồng xét duyệt sinh tự động, hiển thị trong public read view của Hồ sơ. */
public record HoiDongXetDuyetResponse(
        long id,
        HoiDongCap cap,
        String sourceTaskDefinitionKey,
        String canCuPhapLy,
        OffsetDateTime createdAt,
        List<ThanhVienHoiDongResponse> thanhVien) {

    public static HoiDongXetDuyetResponse from(HoiDongXetDuyet hoiDong) {
        return new HoiDongXetDuyetResponse(
                hoiDong.getId(),
                hoiDong.getCap(),
                hoiDong.getSourceTaskDefinitionKey(),
                hoiDong.getCanCuPhapLy(),
                hoiDong.getCreatedAt(),
                hoiDong.getThanhVien().stream().map(ThanhVienHoiDongResponse::from).toList());
    }
}
