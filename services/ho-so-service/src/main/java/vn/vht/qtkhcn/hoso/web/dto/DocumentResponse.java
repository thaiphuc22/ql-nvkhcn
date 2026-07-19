package vn.vht.qtkhcn.hoso.web.dto;

import vn.vht.qtkhcn.hoso.domain.TaiLieu;

public record DocumentResponse(long id, String ten, String loai, long version) {
    public static DocumentResponse from(TaiLieu document) {
        return new DocumentResponse(document.getId(), document.getTen(), document.getLoai(), document.getVersion());
    }
}
