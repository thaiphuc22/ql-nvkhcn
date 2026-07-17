package vn.vht.qtkhcn.service;

import java.util.List;
import org.springframework.stereotype.Component;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.ProcessRoutingResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.ProcessStepResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.RouteBranchResponse;

@Component
public class ActionStudioRoutingCatalog {
    private final List<ProcessRoutingResponse> processes = List.of(
            process("RD01.01", "Xét duyệt nhiệm vụ KHCN",
                    step("t1", "Lập và gửi hồ sơ", "PM", branch("SUBMIT", "Gửi duyệt", "Thẩm định hồ sơ", "forward")),
                    step("t2", "Thẩm định hồ sơ", "TD",
                            branch("APPROVE", "Đồng ý", "Thẩm định tài chính", "forward"),
                            branch("RETURN", "Yêu cầu điều chỉnh", "Lập và gửi hồ sơ", "rework"),
                            branch("REJECT", "Từ chối", "Kết thúc — từ chối", "reject")),
                    step("t3", "Thẩm định tài chính", "TCKT",
                            branch("APPROVE", "Đồng ý", "Lãnh đạo phê duyệt", "forward"),
                            branch("RETURN", "Trả lại", "Thẩm định hồ sơ", "rework")),
                    step("t4", "Lãnh đạo phê duyệt", "LD",
                            branch("APPROVE", "Phê duyệt", "Hoàn thành", "complete"),
                            branch("REJECT", "Từ chối", "Kết thúc — từ chối", "reject"))),
            process("RD02.01", "Nghiệm thu nhiệm vụ",
                    step("t1", "Nộp hồ sơ nghiệm thu", "PM", branch("SUBMIT", "Gửi duyệt", "Hội đồng đánh giá", "forward")),
                    step("t2", "Hội đồng đánh giá", "TD",
                            branch("APPROVE", "Đạt", "Lãnh đạo phê duyệt", "forward"),
                            branch("RETURN", "Chưa đạt", "Nộp hồ sơ nghiệm thu", "rework"),
                            branch("REJECT", "Từ chối", "Kết thúc", "reject")),
                    step("t3", "Lãnh đạo phê duyệt", "LD", branch("APPROVE", "Phê duyệt", "Hoàn thành", "complete"))),
            process("RD05.01", "Thanh quyết toán",
                    step("t1", "Lập hồ sơ quyết toán", "PM", branch("SUBMIT", "Gửi", "Kiểm soát tài chính", "forward")),
                    step("t2", "Kiểm soát tài chính", "TCKT",
                            branch("APPROVE", "Đồng ý", "Phê duyệt quyết toán", "forward"),
                            branch("RETURN", "Bổ sung", "Lập hồ sơ quyết toán", "rework")),
                    step("t3", "Phê duyệt quyết toán", "LD", branch("APPROVE", "Phê duyệt", "Hoàn thành", "complete"))));

    public List<ProcessRoutingResponse> processes() {
        return processes;
    }

    public ProcessRoutingResponse require(String code) {
        return processes.stream().filter(item -> item.code().equals(code)).findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Không có quy trình trong catalog Action Studio: " + code));
    }

    private static ProcessRoutingResponse process(String code, String name, ProcessStepResponse... steps) {
        return new ProcessRoutingResponse(code, name, List.of(steps));
    }

    private static ProcessStepResponse step(String key, String name, String role, RouteBranchResponse... branches) {
        return new ProcessStepResponse(key, name, role, List.of(branches));
    }

    private static RouteBranchResponse branch(String outcome, String label, String target, String kind) {
        return new RouteBranchResponse(outcome, label, target, kind);
    }
}
