package vn.vht.qtkhcn.hoso.web.dto;

import vn.vht.qtkhcn.hoso.domain.ThanhVienHoiDong;

/**
 * Thành viên trong public read view của Hội đồng xét duyệt.
 *
 * <p>{@code userId} cũng là phần tử của {@code inputCollection} cho multi-instance T24 — biểu thức
 * {@code =[thanhVienHienTai.userId]} trong {@code rd0202.bpmn} đọc thẳng field này, nên đổi tên field
 * ở đây là đổi hợp đồng với BPMN đang deploy.</p>
 */
public record ThanhVienHoiDongResponse(String hoTen, String userId, String vaiTroTrongHoiDong) {

    public static ThanhVienHoiDongResponse from(ThanhVienHoiDong member) {
        return new ThanhVienHoiDongResponse(member.getHoTen(), member.getUserId(),
                member.getVaiTroTrongHoiDong());
    }
}
