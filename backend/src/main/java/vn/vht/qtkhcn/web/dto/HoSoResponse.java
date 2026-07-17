package vn.vht.qtkhcn.web.dto;

import java.time.LocalDate;
import java.util.List;
import vn.vht.qtkhcn.domain.Cap;
import vn.vht.qtkhcn.domain.DossierStatus;
import vn.vht.qtkhcn.domain.HoSo;
import vn.vht.qtkhcn.domain.HoSoLoai;
import vn.vht.qtkhcn.domain.NhiemVu;

/**
 * View join HoSo + NhiemVu — tương đương webapp/src/data/dossiers.ts::Dossier (toView()).
 * Lưu trữ vẫn chuẩn hoá 2 bảng (D8); đây chỉ là hình chiếu cho API/UI.
 */
public record HoSoResponse(
        String id,
        String maNV,
        HoSoLoai loai,
        String quyTrinh,
        String quyTrinhTen,
        String nguoiKhoiTao,
        LocalDate ngayTao,
        DossierStatus trangThai,
        int buocHienTai,
        Long zeebeProcessInstanceKey,
        List<DossierStepResponse> steps,
        List<TaiLieuResponse> taiLieu,
        String maDeTai,
        String tenDeTai,
        String chuNhiem,
        String donVi,
        String thoiGianThucHien,
        String duToan,
        Cap cap
) {
    public static HoSoResponse from(HoSo h, NhiemVu nv) {
        return new HoSoResponse(
                h.getId(), h.getMaNV(), h.getLoai(), h.getQuyTrinh(), h.getQuyTrinhTen(),
                h.getNguoiKhoiTao(), h.getNgayTao(), h.getTrangThai(), h.getBuocHienTai(),
                h.getZeebeProcessInstanceKey(),
                h.getSteps().stream().map(DossierStepResponse::from).toList(),
                h.getTaiLieu().stream().map(TaiLieuResponse::from).toList(),
                nv.getMa(), nv.getTen(), nv.getChuNhiem().label(), nv.getDonViChuTri(),
                nv.getThoiGianThucHien(), nv.getDuToan(), nv.getCap());
    }
}
