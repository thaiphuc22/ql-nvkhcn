package vn.vht.qtkhcn.hoso.web.dto;

import vn.vht.qtkhcn.hoso.domain.ThanhVienHoiDong;

/** Thành viên trong public read view của Hội đồng xét duyệt. */
public record ThanhVienHoiDongResponse(String hoTen, String vaiTroTrongHoiDong) {

    public static ThanhVienHoiDongResponse from(ThanhVienHoiDong member) {
        return new ThanhVienHoiDongResponse(member.getHoTen(), member.getVaiTroTrongHoiDong());
    }
}
