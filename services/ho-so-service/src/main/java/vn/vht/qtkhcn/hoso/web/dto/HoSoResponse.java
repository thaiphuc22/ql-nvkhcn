package vn.vht.qtkhcn.hoso.web.dto;

import java.time.LocalDate;
import java.util.List;
import vn.vht.qtkhcn.hoso.domain.Cap;
import vn.vht.qtkhcn.hoso.domain.DossierStatus;
import vn.vht.qtkhcn.hoso.domain.HoSo;
import vn.vht.qtkhcn.hoso.domain.HoSoLoai;
import vn.vht.qtkhcn.hoso.domain.HoiDongXetDuyet;
import vn.vht.qtkhcn.hoso.domain.NhiemVu;

/** Legacy-compatible public read view used during the strangler phase. */
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
        Cap cap,
        List<HoiDongXetDuyetResponse> hoiDongXetDuyet) {

    public static HoSoResponse from(HoSo hoSo, NhiemVu nhiemVu, List<HoiDongXetDuyet> hoiDongXetDuyet) {
        return new HoSoResponse(
                hoSo.getId(),
                hoSo.getMaNV(),
                hoSo.getLoai(),
                hoSo.getQuyTrinh(),
                hoSo.getQuyTrinhTen(),
                hoSo.getNguoiKhoiTao(),
                hoSo.getNgayTao(),
                hoSo.getTrangThai(),
                hoSo.getBuocHienTai(),
                hoSo.getZeebeProcessInstanceKey(),
                hoSo.getSteps().stream().map(DossierStepResponse::from).toList(),
                hoSo.getTaiLieu().stream().map(TaiLieuResponse::from).toList(),
                nhiemVu.getMa(),
                nhiemVu.getTen(),
                nhiemVu.getChuNhiem().label(),
                nhiemVu.getDonViChuTri(),
                nhiemVu.getThoiGianThucHien(),
                nhiemVu.getDuToan(),
                nhiemVu.getCap(),
                hoiDongXetDuyet.stream().map(HoiDongXetDuyetResponse::from).toList());
    }
}
