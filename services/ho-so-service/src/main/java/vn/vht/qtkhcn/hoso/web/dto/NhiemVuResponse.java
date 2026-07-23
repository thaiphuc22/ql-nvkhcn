package vn.vht.qtkhcn.hoso.web.dto;

import vn.vht.qtkhcn.hoso.domain.Cap;
import vn.vht.qtkhcn.hoso.domain.GiaiDoan;
import vn.vht.qtkhcn.hoso.domain.NhiemVu;

public record NhiemVuResponse(
        String ma,
        String ten,
        Cap cap,
        String chuNhiem,
        String donViChuTri,
        String thoiGianThucHien,
        String duToan,
        GiaiDoan giaiDoan) {

    public static NhiemVuResponse from(NhiemVu nhiemVu) {
        return new NhiemVuResponse(
                nhiemVu.getMa(),
                nhiemVu.getTen(),
                nhiemVu.getCap(),
                nhiemVu.getChuNhiem().label(),
                nhiemVu.getDonViChuTri(),
                nhiemVu.getThoiGianThucHien(),
                nhiemVu.getDuToan(),
                nhiemVu.getGiaiDoan());
    }
}
