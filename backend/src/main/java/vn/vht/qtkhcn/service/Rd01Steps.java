package vn.vht.qtkhcn.service;

import java.util.List;
import vn.vht.qtkhcn.web.dto.TaskStepDef;

/**
 * Chuỗi bước rút gọn của RD01.01 — port từ webapp/src/data/processes.ts (taskSteps t1..t6).
 * t1 "Khởi tạo hồ sơ" không nằm trong danh sách này vì hồ sơ draft đã tự tạo bước đó (xem
 * HoSoService#createDraft, mirror webapp/src/data/dossiers.ts::createDraftHoSo +
 * stepsFromTaskSteps bỏ bước đầu có hanhDong="Khởi tạo").
 */
public final class Rd01Steps {

    private Rd01Steps() {
    }

    public static final List<TaskStepDef> RD01_01_SUBMIT_STEPS = List.of(
            new TaskStepDef("t2", "Ký duyệt cấp Trung tâm/Khối", "BGĐ TT/Khối",
                    List.of("BGD_TT", "BGD_KHOI"), "phieu-phe-duyet"),
            new TaskStepDef("t3", "Thẩm định Cơ quan nghiệp vụ", "TP CLKHCN, TCKT, NS, GĐ TTMS",
                    List.of("TP_CLKHCN", "TP_TCKT", "TP_NS", "GD_TTMS"), "phieu-nhan-xet"),
            new TaskStepDef("t4", "Lập Báo cáo thẩm định", "CQ QLKHCN",
                    List.of("CQ_QLKHCN"), "bao-cao-tham-dinh"),
            new TaskStepDef("t5", "Hội đồng KHCN phê duyệt", "HĐ KHCN VHT",
                    List.of("HDKHCN"), "phieu-phe-duyet"),
            new TaskStepDef("t6", "TGĐ phê duyệt Quyết định chủ trương", "TGĐ VHT",
                    List.of("TGD_VHT"), "phieu-phe-duyet")
    );
}
