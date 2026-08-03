package vn.vht.qtkhcn.hoso.web.dto;

import java.time.OffsetDateTime;
import java.util.List;
import vn.vht.qtkhcn.hoso.domain.HoiDongCap;
import vn.vht.qtkhcn.hoso.domain.HoiDongXetDuyet;

/**
 * Hội đồng xét duyệt — hiển thị cả trong public read view của Hồ sơ (nhúng vào
 * {@code HoSoResponse}) và trong màn quản trị {@code /api/hoi-dong} (list/tạo/sửa/xóa thủ công).
 * {@code sourceTaskDefinitionKey} NULL nghĩa là hội đồng được tạo thủ công, không phải sinh tự
 * động từ workflow; {@code version} phục vụ optimistic locking (header If-Match) khi sửa.
 */
public record HoiDongXetDuyetResponse(
        long id,
        String maHoiDong,
        String hoSoId,
        HoiDongCap cap,
        String sourceTaskDefinitionKey,
        String canCuPhapLy,
        OffsetDateTime createdAt,
        long version,
        List<ThanhVienHoiDongResponse> thanhVien) {

    public static HoiDongXetDuyetResponse from(HoiDongXetDuyet hoiDong) {
        return new HoiDongXetDuyetResponse(
                hoiDong.getId(),
                hoiDong.getMaHoiDong(),
                hoiDong.getHoSoId(),
                hoiDong.getCap(),
                hoiDong.getSourceTaskDefinitionKey(),
                hoiDong.getCanCuPhapLy(),
                hoiDong.getCreatedAt(),
                hoiDong.getVersion(),
                hoiDong.getThanhVien().stream().map(ThanhVienHoiDongResponse::from).toList());
    }
}
