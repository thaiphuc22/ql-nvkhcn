package vn.vht.qtkhcn.camunda;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Deploy RD01.01 lên Zeebe khi backend khởi động (Mốc 3 — bằng chứng "tích hợp thật với Camunda 8").
 * Dùng deploy chương trình hoá (KHÔNG dựa vào auto-deploy qua application.yml) vì đây là API ổn
 * định nhất qua các bản Camunda 8 Java SDK, giảm rủi ro lệch cấu hình theo version.
 *
 * Xác nhận `io.camunda.client.CamundaClient` đúng qua `mvn compile` 2026-07-15 (compile sạch, 0
 * lỗi ở file này) — SDK hợp nhất "Camunda 8" dùng đúng tên lớp này, khớp
 * `camunda-spring-boot-starter:8.9.12`. (File anh em `SystemCheckJobWorker.java` có 1 import khác
 * đoán sai — xem Javadoc ở đó.)
 */
@Component
public class ProcessDeploymentRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(ProcessDeploymentRunner.class);

    // BPMN process id uses an underscore; "RD01.01" is the domain workflow code/API value.
    static final String BUNDLED_PROCESS_ID = "RD01_01";
    static final String BUNDLED_RESOURCE = "processes/rd0101.bpmn";

    // RD02.02 — bản dựng TẠM, chưa chốt nghiệp vụ (xem đầu file rd0202.bpmn). Deploy kèm để luồng
    // cấp Tập đoàn có process active, nếu không CamundaReliableWorkflowEngine sẽ ném
    // ProcessNotActiveException và hồ sơ rơi vào START_FAILED.
    static final String RD0202_PROCESS_ID = "RD02_02";
    static final String RD0202_RESOURCE = "processes/rd0202.bpmn";

    private final StartupProcessDeploymentService startupDeploymentService;

    public ProcessDeploymentRunner(StartupProcessDeploymentService startupDeploymentService) {
        this.startupDeploymentService = startupDeploymentService;
    }

    @Override
    public void run(ApplicationArguments args) {
        deployBundled(BUNDLED_PROCESS_ID, BUNDLED_RESOURCE);
        deployBundled(RD0202_PROCESS_ID, RD0202_RESOURCE);
    }

    private void deployBundled(String processId, String classpathResource) {
        var result = startupDeploymentService.deployIfAbsent(processId, classpathResource);
        if (result.deployed()) {
            log.info("Bundled process deployed: {} v{} (key={})", result.bpmnProcessId(), result.version(),
                    result.processDefinitionKey());
        } else {
            log.info("Bundled process already exists; startup deployment skipped: {} v{} (key={})",
                    result.bpmnProcessId(), result.version(), result.processDefinitionKey());
        }
    }
}
