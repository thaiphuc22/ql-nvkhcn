package vn.vht.qtkhcn.hoso.web.dto;

import vn.vht.qtkhcn.hoso.domain.TaiLieu;

/** Tài liệu đính kèm trong public read view của Hồ sơ. */
public record TaiLieuResponse(long id, String ten, String loai, long version, String contentType, Long sizeBytes,
        boolean hasContent) {

    public static TaiLieuResponse from(TaiLieu taiLieu) {
        return new TaiLieuResponse(taiLieu.getId(), taiLieu.getTen(), taiLieu.getLoai(), taiLieu.getVersion(),
                taiLieu.getContentType(), taiLieu.getSizeBytes(), taiLieu.getStorageKey() != null);
    }
}
