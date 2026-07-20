package vn.vht.qtkhcn.camunda;

import io.camunda.client.annotation.JobWorker;
import io.camunda.client.api.response.ActivatedJob;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Job worker cho service task "Gateway_SystemCheck" (type khcn.rd0101.check-default-condition)
 * trong RD01.01 — bằng chứng job worker thật xử lý task thật trên Zeebe thật (Mốc 3).
 *
 * Stub logic (Mốc 2/3): LUÔN trả {@code dieuKienMacDinhDat=true} — kiểm tra "điều kiện mặc định"
 * thật (đối chiếu kế hoạch năm, ngân sách...) là nghiệp vụ Mốc 6+ (đợi F2 hoàn thiện dữ liệu PL1–
 * PL6 thật), KHÔNG giả lập ở đây để tránh nhầm là đã có logic thật.
 *
 * Xác nhận qua `mvn compile` 2026-07-15 (đúng như cảnh báo ở ProcessDeploymentRunner): package
 * đoán ban đầu `io.camunda.spring.client.annotation.JobWorker` SAI — lớp thật nằm ở
 * `io.camunda.client.annotation.JobWorker` (kiểm tra trực tiếp bằng cách liệt kê nội dung jar
 * `camunda-spring-boot-starter-8.9.12.jar` trong `~/.m2`, không đoán). `ActivatedJob` compile
 * đúng ngay từ đầu.
 */
@Component
public class SystemCheckJobWorker {

    private static final Logger log = LoggerFactory.getLogger(SystemCheckJobWorker.class);

    @JobWorker(type = "khcn.rd0101.check-default-condition")
    public Map<String, Object> checkDefaultCondition(ActivatedJob job) {
        log.info("Xử lý job {} (processInstanceKey={})", job.getType(), job.getProcessInstanceKey());
        return Map.of(ProcessVariableContract.DIEU_KIEN_MAC_DINH_DAT, true);
    }

    /**
     * Job worker cho service task "Check_ChuTruongTD" trong RD02.02 — kiểm tra BR-RD0202-001 (chỉ
     * được xét duyệt cấp Tập đoàn khi đã có QĐ phê duyệt chủ trương cấp TĐ).
     *
     * Stub như worker RD01.01 ở trên, và ở đây còn CHƯA THỂ làm thật vì nguồn dữ liệu là kết quả
     * RD01.02 — quy trình đó chưa có BPMN (chỉ có rd0101/rd0202). Trả true vô điều kiện để nhánh
     * chính chạy được E2E; đừng nhầm là đã có kiểm tra tiền điều kiện thật.
     */
    @JobWorker(type = "khcn.rd0202.check-chu-truong-td")
    public Map<String, Object> checkChuTruongTapDoan(ActivatedJob job) {
        log.info("Xử lý job {} (processInstanceKey={})", job.getType(), job.getProcessInstanceKey());
        Map<String, Object> variables = new java.util.LinkedHashMap<>(job.getVariablesAsMap());
        variables.put(ProcessVariableContract.DIEU_KIEN_MAC_DINH_DAT, true);
        // Đầu vào cho business rule task `Rule_PhanCap` (decision `capNhiemVu`). Đây là **business
        // data**, không phải biến điều khiển — theo D3 nó KHÔNG được sống lâu dài trong process.
        // Ở lát stub này worker tự cấp giá trị mặc định để DMN có cái mà đánh giá; khi nối dữ liệu
        // thật thì đọc từ aggregate Hồ sơ ở 8093 và truyền vào đúng thời điểm evaluate.
        variables.putIfAbsent("tongDuToan", 12_000_000_000L);
        variables.putIfAbsent("loaiNhiemVu", "de_tai");
        return variables;
    }
}
