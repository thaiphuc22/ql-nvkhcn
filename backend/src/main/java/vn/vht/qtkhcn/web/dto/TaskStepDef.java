package vn.vht.qtkhcn.web.dto;

import java.util.List;

/**
 * Định nghĩa 1 bước trong quy trình (nguồn: webapp/src/data/processes.ts::TaskStep, đã rút gọn).
 * Dùng để dựng {@code DossierStep} khi "Gửi duyệt". KHÔNG phải BPMN thật — đây vẫn là mô hình
 * tuyến tính rút gọn giống mock (webapp active-task.md từng ghi nhận độ lệch giữa mô hình 6-bước
 * này và BPMN đầy đủ ~12 user task của RD01.01; hoà giải đầy đủ là việc của Mốc 6+).
 */
public record TaskStepDef(
        String key,
        String ten,
        String vaiTro,
        List<String> vaiTroCodes,
        String formKey
) {
}
