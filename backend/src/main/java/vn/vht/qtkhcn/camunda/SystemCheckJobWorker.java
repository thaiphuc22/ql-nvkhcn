package vn.vht.qtkhcn.camunda;

import io.camunda.client.annotation.JobWorker;
import io.camunda.client.api.response.ActivatedJob;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import vn.vht.qtkhcn.service.ResolvedServiceTaskConfig;
import vn.vht.qtkhcn.service.ServiceTaskConfigResolver;

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

    private final ServiceTaskConfigResolver configResolver;

    public SystemCheckJobWorker(ServiceTaskConfigResolver configResolver) {
        this.configResolver = configResolver;
    }

    @JobWorker(type = "khcn.rd0101.check-default-condition")
    public Map<String, Object> checkDefaultCondition(ActivatedJob job) {
        // CHƯA nối vào ServiceTaskConfigResolver: V21 mới seed binding cho RD02.02. Nối worker này
        // chỉ nên làm cùng lúc với việc seed binding tương ứng, nếu không sẽ chỉ thêm log WARN.
        log.info("Xử lý job {} (processInstanceKey={})", job.getType(), job.getProcessInstanceKey());
        return Map.of(ProcessVariableContract.DIEU_KIEN_MAC_DINH_DAT, true);
    }

    /**
     * Job worker cho service task "Check_ChuTruongTD" trong RD02.02 — kiểm tra BR-RD0202-001 (chỉ
     * được xét duyệt cấp Tập đoàn khi đã có QĐ phê duyệt chủ trương cấp TĐ).
     *
     * Hành vi do CẤU HÌNH chi phối: tên biến kết quả và giá trị stub đọc từ config version ACTIVE
     * gắn với element này (bảng service_task_binding / service_task_config_version, seed ở V21).
     *
     * VẪN CHƯA phải kiểm tra thật — nguồn dữ liệu là kết quả RD01.02, mà quy trình đó chưa có BPMN.
     * Khác biệt so với trước: giá trị `true` không còn nằm trong Java mà nằm ở `stubResult` trong
     * cấu hình, sửa được không cần build lại, và log ra đúng version cấu hình đã dùng.
     *
     * Không resolve được cấu hình thì GIỮ hành vi cũ (trả true) thay vì ném lỗi: thiếu dữ liệu quản
     * trị không được phép làm hỏng process đang chạy. Log WARN để chỗ thiếu vẫn lộ ra.
     */
    @JobWorker(type = "khcn.rd0202.check-chu-truong-td")
    public Map<String, Object> checkChuTruongTapDoan(ActivatedJob job) {
        Optional<ResolvedServiceTaskConfig> resolved =
                configResolver.resolve(job.getBpmnProcessId(), job.getElementId(), job.getType());

        String resultVariable = resolved
                .flatMap(ResolvedServiceTaskConfig::resultVariable)
                .orElse(ProcessVariableContract.DIEU_KIEN_MAC_DINH_DAT);
        boolean result = resolved
                .flatMap(ResolvedServiceTaskConfig::stubResult)
                .orElse(Boolean.TRUE);

        resolved.ifPresentOrElse(
                config -> log.info("Xử lý job {} (processInstanceKey={}) theo cấu hình {} v{}: {}={}",
                        job.getType(), job.getProcessInstanceKey(),
                        config.definitionCode(), config.versionNo(), resultVariable, result),
                () -> log.warn("Xử lý job {} (processInstanceKey={}) KHÔNG có cấu hình — dùng mặc định {}={}",
                        job.getType(), job.getProcessInstanceKey(), resultVariable, result));

        Map<String, Object> variables = new java.util.LinkedHashMap<>(job.getVariablesAsMap());
        variables.put(resultVariable, result);
        // Đầu vào cho business rule task `Rule_PhanCap` (decision `capNhiemVu`). Đây là **business
        // data**, không phải biến điều khiển — theo D3 nó KHÔNG được sống lâu dài trong process.
        // Ở lát stub này worker tự cấp giá trị mặc định để DMN có cái mà đánh giá; khi nối dữ liệu
        // thật thì đọc từ aggregate Hồ sơ ở 8093 và truyền vào đúng thời điểm evaluate.
        variables.putIfAbsent("tongDuToan", 12_000_000_000L);
        variables.putIfAbsent("loaiNhiemVu", "de_tai");
        return variables;
    }
}
