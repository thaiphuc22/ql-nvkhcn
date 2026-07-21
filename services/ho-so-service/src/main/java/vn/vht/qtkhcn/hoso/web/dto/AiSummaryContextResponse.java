package vn.vht.qtkhcn.hoso.web.dto;

import java.util.List;
import vn.vht.qtkhcn.hoso.domain.Cap;
import vn.vht.qtkhcn.hoso.domain.HoSo;
import vn.vht.qtkhcn.hoso.domain.NhiemVu;
import vn.vht.qtkhcn.hoso.domain.StepStatus;

/** Ngữ cảnh gọn cho AI Agent tóm tắt hồ sơ (service task AI_Summarize, RD02.02) — chỉ field mô tả. */
public record AiSummaryContextResponse(
        String hoSoId,
        String tenDeTai,
        String chuNhiem,
        String donVi,
        String thoiGianThucHien,
        String duToan,
        Cap cap,
        List<BuocHoanTat> cacBuocDaHoanTat) {

    public record BuocHoanTat(String ten, String nguoi, String yKien) {}

    public static AiSummaryContextResponse from(HoSo hoSo, NhiemVu nhiemVu) {
        List<BuocHoanTat> buoc = hoSo.getSteps().stream()
                .filter(step -> step.getTrangThai() == StepStatus.DONE)
                .map(step -> new BuocHoanTat(step.getTen(), step.getNguoi(), step.getYKien()))
                .toList();
        return new AiSummaryContextResponse(hoSo.getId(), nhiemVu.getTen(), nhiemVu.getChuNhiem().label(),
                nhiemVu.getDonViChuTri(), nhiemVu.getThoiGianThucHien(), nhiemVu.getDuToan(), nhiemVu.getCap(), buoc);
    }
}
