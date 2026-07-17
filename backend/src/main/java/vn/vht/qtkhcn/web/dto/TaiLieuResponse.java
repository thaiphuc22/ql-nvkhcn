package vn.vht.qtkhcn.web.dto;

import vn.vht.qtkhcn.domain.TaiLieu;

/** Tài liệu đính kèm hiển thị trên màn Chi tiết Hồ sơ. */
public record TaiLieuResponse(String ten, String loai) {

    public static TaiLieuResponse from(TaiLieu taiLieu) {
        return new TaiLieuResponse(taiLieu.getTen(), taiLieu.getLoai());
    }
}
