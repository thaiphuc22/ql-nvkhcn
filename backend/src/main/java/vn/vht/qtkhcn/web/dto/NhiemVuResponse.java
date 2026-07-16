package vn.vht.qtkhcn.web.dto;

import vn.vht.qtkhcn.domain.Cap;
import vn.vht.qtkhcn.domain.GiaiDoan;
import vn.vht.qtkhcn.domain.NhiemVu;

public record NhiemVuResponse(
        String ma,
        String ten,
        Cap cap,
        String chuNhiem,
        String donViChuTri,
        String thoiGianThucHien,
        String duToan,
        GiaiDoan giaiDoan
) {
    public static NhiemVuResponse from(NhiemVu n) {
        return new NhiemVuResponse(
                n.getMa(), n.getTen(), n.getCap(), n.getChuNhiem().label(),
                n.getDonViChuTri(), n.getThoiGianThucHien(), n.getDuToan(), n.getGiaiDoan());
    }
}
