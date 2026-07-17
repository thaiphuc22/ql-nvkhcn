package vn.vht.qtkhcn.hoso.web.dto;

import vn.vht.qtkhcn.hoso.domain.TaiLieu;

/** Tài liệu đính kèm trong public read view của Hồ sơ. */
public record TaiLieuResponse(String ten, String loai) {

    public static TaiLieuResponse from(TaiLieu taiLieu) {
        return new TaiLieuResponse(taiLieu.getTen(), taiLieu.getLoai());
    }
}
