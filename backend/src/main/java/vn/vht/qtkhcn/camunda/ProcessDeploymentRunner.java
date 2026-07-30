package vn.vht.qtkhcn.camunda;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import vn.vht.qtkhcn.service.BundledProcessCatalogSyncService;

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
    // Rule_DanhGiaT24 (businessRuleTask) gọi decision ketQuaDanhGiaT24 — PHẢI deploy cùng lượt với
    // BPMN, nếu không Zeebe từ chối deploy BPMN vì calledDecision không resolve được.
    static final String RD0202_DANH_GIA_DMN_RESOURCE = "processes/rd0202-danh-gia.dmn";

    private final StartupProcessDeploymentService startupDeploymentService;
    private final BundledProcessCatalogSyncService catalogSyncService;

    public ProcessDeploymentRunner(StartupProcessDeploymentService startupDeploymentService,
            BundledProcessCatalogSyncService catalogSyncService) {
        this.startupDeploymentService = startupDeploymentService;
        this.catalogSyncService = catalogSyncService;
    }

    @Override
    public void run(ApplicationArguments args) {
        deployBundled(BUNDLED_PROCESS_ID, BUNDLED_RESOURCE);
        deployBundled(RD0202_PROCESS_ID, RD0202_RESOURCE, RD0202_DANH_GIA_DMN_RESOURCE);
        // RD01.01 trước Lát 3 chỉ được deploy lên Zeebe mà KHÔNG vào catalog, nên phần còn lại của hệ
        // thống (metadata bước, đối soát, danh sách chọn khi gửi duyệt) phải sống bằng một nhánh dự
        // phòng đọc file classpath riêng cho đúng nó — xem BpmnUserTaskMetadataCatalog. Đồng bộ ở đây
        // để RD01.01 đi cùng một đường như mọi quy trình khác.
        //
        // An toàn khi chạy lại: sync bỏ qua nếu catalog đã có dòng, và deploy lại BPMN y hệt thì Zeebe
        // trả về CÙNG processDefinitionKey (content-addressable) chứ không đẻ version mới.
        syncCatalog(BUNDLED_PROCESS_ID, BUNDLED_RESOURCE);
        syncCatalog(RD0202_PROCESS_ID, RD0202_RESOURCE);
    }

    private void deployBundled(String processId, String... classpathResources) {
        var result = startupDeploymentService.deployIfAbsent(processId, classpathResources);
        if (result.deployed()) {
            log.info("Bundled process deployed: {} v{} (key={})", result.bpmnProcessId(), result.version(),
                    result.processDefinitionKey());
        } else {
            log.info("Bundled process already exists; startup deployment skipped: {} v{} (key={})",
                    result.bpmnProcessId(), result.version(), result.processDefinitionKey());
        }
    }

    private void syncCatalog(String processId, String classpathResource) {
        var result = catalogSyncService.sync(processId, classpathResource);
        if (result.published()) {
            log.info("Bundled process published to /quy-trinh catalog: {} v{}",
                    result.bpmnProcessId(), result.version());
        } else {
            log.info("Bundled process catalog is current: {} v{}",
                    result.bpmnProcessId(), result.version());
        }
    }
}
