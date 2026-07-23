package vn.vht.qtkhcn.hoso.web.dto;

import java.util.List;
import vn.vht.qtkhcn.hoso.domain.DossierStep;
import vn.vht.qtkhcn.hoso.domain.StepStatus;

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
        String formKey) {

    public static DossierStepResponse from(DossierStep step) {
        return new DossierStepResponse(
                step.getBuocIndex(),
                step.getTaskDefinitionKey(),
                step.getTen(),
                step.getVaiTro(),
                List.copyOf(step.getVaiTroCodes()),
                step.getNguoi(),
                step.getTrangThai(),
                step.getThoiDiem(),
                step.getYKien(),
                step.getHanXuLy(),
                step.getFormKey());
    }
}
