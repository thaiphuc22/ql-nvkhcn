package vn.vht.qtkhcn.web.dto;

import java.util.List;
import vn.vht.qtkhcn.domain.DossierStep;
import vn.vht.qtkhcn.domain.StepStatus;

public record DossierStepResponse(
        int buocIndex,
        String taskDefinitionKey,
        String ten,
        String vaiTro,
        List<String> vaiTroCodes,
        String nguoi,
        StepStatus trangThai,
        String thoiDiem,
        String yKien,
        String hanXuLy,
        String formKey
) {
    public static DossierStepResponse from(DossierStep s) {
        return new DossierStepResponse(
                s.getBuocIndex(), s.getTaskDefinitionKey(), s.getTen(), s.getVaiTro(),
                List.copyOf(s.getVaiTroCodes()), s.getNguoi(), s.getTrangThai(), s.getThoiDiem(),
                s.getYKien(), s.getHanXuLy(), s.getFormKey());
    }
}
