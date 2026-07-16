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
}
