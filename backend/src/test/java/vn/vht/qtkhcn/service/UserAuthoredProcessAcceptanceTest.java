package vn.vht.qtkhcn.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.ApplicationEventPublisher;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import vn.vht.qtkhcn.camunda.CamundaDeploymentService;
import vn.vht.qtkhcn.camunda.JobWorkerRegistry;
import vn.vht.qtkhcn.camunda.WorkflowTaskActionRouting;
import vn.vht.qtkhcn.repository.ActionAvailabilityPolicyRepository;
import vn.vht.qtkhcn.repository.ActionExceptionPolicyRepository;
import vn.vht.qtkhcn.repository.ActionStudioActionRepository;
import vn.vht.qtkhcn.repository.ActionStudioAuditRepository;
import vn.vht.qtkhcn.repository.EformRepository;
import vn.vht.qtkhcn.repository.ProcessDefinitionCatalogRepository;
import vn.vht.qtkhcn.repository.ProcessDefinitionVersionRepository;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.SimulationRequest;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.AvailabilityRequest;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.ScaffoldResponse;

/**
 * <b>Nghiệm thu Lát 4 — "vẽ một BPMN hoàn toàn mới, chạy hết luồng, KHÔNG sửa một dòng Java nào".</b>
 *
 * <p>BPMN trong test này ({@code quy_trinh_thu_nghiem}) chưa từng xuất hiện ở bất kỳ file Java, hằng
 * số, migration hay resource nào của repo — nó được viết ngay tại đây, đúng như một người dùng vẽ trên
 * {@code /quy-trinh/ve}. Nếu ở đâu đó còn sót một bảng {@code switch} theo mã quy trình, test này đỏ.
 *
 * <p>Chạy trên Postgres 16 thật qua Testcontainers (cùng image với {@code infra/docker-compose.override.yml})
 * để dữ liệu seed của Flyway — danh mục action, thư viện biểu mẫu, 4 luật hiển thị nút CHUNG của V10 —
 * là dữ liệu thật, không phải mock. Chính bộ seed đó là thứ từng làm quy trình mới lặng lẽ mượn biểu mẫu
 * của RD01.01.
 *
 * <p><b>Ranh giới có chủ ý:</b> Zeebe được mock (deploy trả về key giả). Test này chứng minh mọi thứ
 * PHÍA APP là process-agnostic; phần "Zeebe thật nhận BPMN và rẽ nhánh theo biến" vẫn phải nghiệm thu
 * bằng tay trên stack chạy thật.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class UserAuthoredProcessAcceptanceTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");

    private static final String PROCESS_ID = "quy_trinh_thu_nghiem";
    private static final long FAKE_PROCESS_DEFINITION_KEY = 987_654L;
    private static final long MAX_FILE_SIZE_BYTES = 5_242_880L;

    @Autowired private ProcessDefinitionCatalogRepository catalogs;
    @Autowired private ProcessDefinitionVersionRepository versions;
    @Autowired private ActionStudioActionRepository actions;
    @Autowired private ActionAvailabilityPolicyRepository availability;
    @Autowired private ActionExceptionPolicyRepository exceptions;
    @Autowired private ActionStudioAuditRepository audits;
    @Autowired private EformRepository eforms;

    private DeployedBpmnRoutingReader routingReader;
    private ActionStudioService actionStudio;
    private JobWorkerRegistry jobWorkers;

    @BeforeEach
    void deployTheBrandNewProcess() {
        var validator = new ProcessDefinitionImportValidator(MAX_FILE_SIZE_BYTES);
        ValidatedBpmn validated = validator.validate(bpmn(), PROCESS_ID + ".bpmn");
        assertThat(validated.hasErrors())
                .as("BPMN người dùng vẽ phải qua được lint chặn deploy")
                .isFalse();

        CamundaDeploymentService deployment = mock(CamundaDeploymentService.class);
        when(deployment.deploy(any(byte[].class), eq(PROCESS_ID + ".bpmn")))
                .thenReturn(new CamundaDeploymentService.DeploymentResult(FAKE_PROCESS_DEFINITION_KEY,
                        PROCESS_ID, 1, FAKE_PROCESS_DEFINITION_KEY, PROCESS_ID + ".bpmn"));

        routingReader = new DeployedBpmnRoutingReader(catalogs, versions);
        actionStudio = new ActionStudioService(actions, availability, exceptions, audits,
                new ActionStudioRoutingCatalog(routingReader), eforms);
        jobWorkers = mock(JobWorkerRegistry.class);

        new ProcessDefinitionService(validator, deployment, catalogs, versions, routingReader,
                mock(ApplicationEventPublisher.class))
                .publishValidated(validated, "nguoi-ve-bpmn");
    }

    @Test
    void theCatalogSeesTheNewProcessAndItsTwoStepsWithoutAnyJavaChange() {
        var routing = routingReader.require(PROCESS_ID);

        assertThat(routing.steps()).extracting(step -> step.key()).containsExactly("LapHoSo", "DuyetHoSo");
        var duyet = routing.steps().get(1);
        assertThat(duyet.role()).isEqualTo("CQ_KHCN");
        assertThat(duyet.formKey()).isEqualTo("phieu-phe-duyet");
        assertThat(duyet.branches()).extracting(branch -> branch.outcome())
                .containsExactlyInAnyOrder("dong_y", "hieu_chinh", "khong_dat");
    }

    /**
     * Mấu chốt của cả hướng đi này: biến điều khiển phải suy ra từ chính BPMN. Trước Lát 3,
     * {@code WorkflowTaskActionRouting} tra bảng {@code switch} cứng và quy trình mới rơi vào
     * {@code default -> Map.of()} — bấm "Đồng ý duyệt" xong gateway không có gì để rẽ.
     */
    @Test
    void approvingAndReturningSendTheControlVariableThatTheBpmnGatewayActuallyReadsOn() {
        var routing = new WorkflowTaskActionRouting(routingReader);

        assertThat(routing.variables(PROCESS_ID, "DuyetHoSo", "APPROVE_STEP", "req-1", "U-003"))
                .containsEntry("ketQuaDuyet", "dong_y");
        assertThat(routing.supports(PROCESS_ID, "DuyetHoSo", "RETURN_STEP")).isTrue();
        assertThat(routing.variables(PROCESS_ID, "DuyetHoSo", "RETURN_STEP", "req-2", "U-003"))
                .containsEntry("ketQuaDuyet", "hieu_chinh");
    }

    /**
     * Nhánh "Không đạt" là <b>default flow</b> nên không có conditionExpression — không có biến nào để
     * suy ra, và đúng là không cần: chọn default flow là việc của Zeebe khi mọi điều kiện đều trượt.
     */
    @Test
    void theDefaultFlowNeedsNoControlVariable() {
        assertThat(routingReader.actionVariables(PROCESS_ID, "DuyetHoSo"))
                .containsOnlyKeys("APPROVE_STEP", "RETURN_STEP");
    }

    /**
     * Bộ seed V10 có 4 luật hiển thị nút CHUNG gắn sẵn biểu mẫu của RD01.01. Nếu scaffold chỉ tạo cho
     * dòng {@code missing} thì quy trình mới không được ghim gì cả, và bước "Duyệt hồ sơ" sẽ mở ra
     * biểu mẫu của RD01.01 — server còn validate trường bắt buộc theo đúng biểu mẫu sai đó.
     */
    @Test
    void scaffoldPinsTheNewProcessOwnFormsInsteadOfLettingItInheritRd0101Forms() {
        var result = actionStudio.scaffold(PROCESS_ID, "nguoi-ve-bpmn");

        assertThat(result.createdPolicies())
                .filteredOn(policy -> policy.taskDefinitionKey().equals("DuyetHoSo"))
                .isNotEmpty()
                .allSatisfy(policy -> {
                    assertThat(policy.formKey()).isNull();
                    assertThat(policy.formBundle().items().getFirst().formKey()).isEqualTo("phieu-phe-duyet");
                    assertThat(policy.lifecycleStatus()).isEqualTo("DRAFT");
                    assertThat(policy.allowedRoleCodes()).containsExactly("CQ_KHCN");
                });
        assertThat(result.rows()).filteredOn(row -> row.stepKey().equals("DuyetHoSo"))
                .extracting(row -> row.status()).containsOnly("GENERIC_POLICY");
    }

    /**
     * Vế người dùng: một chuyên quản KHCN (KHÔNG phải admin) phải nhìn thấy nút duyệt kèm đúng biểu mẫu
     * của quy trình này. Đây là điều kiện đủ để bước duyệt bấm được trên UI thật.
     */
    @Test
    void aNonAdminApproverSeesTheApproveButtonBoundToThisProcessOwnForm() {
        activateScaffoldedPolicies(actionStudio.scaffold(PROCESS_ID, "nguoi-ve-bpmn"));

        var visible = actionStudio.simulate(new SimulationRequest("DOSSIER_DETAIL", PROCESS_ID,
                "DuyetHoSo", "processing", List.of("CQ_KHCN"), List.of("PROCESS_STEP"), false));

        assertThat(visible).filteredOn(action -> action.actionCode().equals("APPROVE_STEP"))
                .singleElement().satisfies(action -> {
                    assertThat(action.visible()).isTrue();
                    assertThat(action.enabled()).isTrue();
                    assertThat(action.formKey()).isEqualTo("phieu-phe-duyet");
                });
    }

    /** Đối soát phải chấm quy trình này là xanh — biểu mẫu có thật, vai trò có thật, nút đã ghim. */
    @Test
    void theReadinessReportIsGreenForThisProcess() {
        activateScaffoldedPolicies(actionStudio.scaffold(PROCESS_ID, "nguoi-ve-bpmn"));
        var readiness = new ProcessReadinessService(catalogs, versions, actionStudio, eforms, jobWorkers)
                .readiness(PROCESS_ID);

        assertThat(readiness.userTasks()).extracting(task -> task.status()).containsOnly("ok");
        assertThat(readiness.serviceTasks()).isEmpty();
        assertThat(readiness.status()).isEqualTo("ok");
    }

    private void activateScaffoldedPolicies(ScaffoldResponse scaffold) {
        scaffold.createdPolicies().forEach(policy -> {
            List<String> roles = policy.taskDefinitionKey().equals("DuyetHoSo")
                    ? List.of("CQ_KHCN") : List.of("PM");
            actionStudio.updateAvailability(policy.id(), new AvailabilityRequest(policy.id(), policy.actionCode(),
                    policy.surface(), policy.processCode(), policy.taskDefinitionKey(), policy.dossierStatus(), roles,
                    policy.formKey(), policy.conditionExpression(), policy.displayOrder(), "ACTIVE",
                    policy.processVersion(), policy.displayLabel(), policy.displayIcon(), policy.uiGroup(),
                    policy.tone(), policy.helpText(), null),
                    policy.version(), "quan-tri-quy-trinh");
        });
    }

    /**
     * BPMN người dùng vẽ: Lập hồ sơ → Duyệt hồ sơ → gateway 3 nhánh (đồng ý / yêu cầu hiệu chỉnh quay
     * lại bước đầu / không đạt là default flow). Biểu mẫu lấy từ thư viện có sẵn, vai trò lấy từ danh
     * mục vai trò — đúng như người dùng thật sẽ làm.
     */
    private static String bpmn() {
        return """
                <?xml version="1.0" encoding="UTF-8"?>
                <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                    xmlns:zeebe="http://camunda.org/schema/zeebe/1.0"
                    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="Defs_ThuNghiem">
                  <bpmn:process id="quy_trinh_thu_nghiem" name="Quy trình thử nghiệm tự vẽ" isExecutable="true">
                    <bpmn:startEvent id="BatDau" name="Bắt đầu">
                      <bpmn:outgoing>F_start</bpmn:outgoing>
                    </bpmn:startEvent>
                    <bpmn:userTask id="LapHoSo" name="Lập hồ sơ">
                      <bpmn:extensionElements>
                        <zeebe:assignmentDefinition candidateGroups="PM" />
                        <zeebe:formDefinition formKey="phieu-chu-truong" />
                      </bpmn:extensionElements>
                      <bpmn:incoming>F_start</bpmn:incoming>
                      <bpmn:incoming>F_rework</bpmn:incoming>
                      <bpmn:outgoing>F_toDuyet</bpmn:outgoing>
                    </bpmn:userTask>
                    <bpmn:userTask id="DuyetHoSo" name="Duyệt hồ sơ">
                      <bpmn:extensionElements>
                        <zeebe:assignmentDefinition candidateGroups="CQ_KHCN" />
                        <zeebe:formDefinition formKey="phieu-phe-duyet" />
                      </bpmn:extensionElements>
                      <bpmn:incoming>F_toDuyet</bpmn:incoming>
                      <bpmn:outgoing>F_toGateway</bpmn:outgoing>
                    </bpmn:userTask>
                    <bpmn:exclusiveGateway id="KetQua" name="Kết quả duyệt?" default="F_khongDat">
                      <bpmn:incoming>F_toGateway</bpmn:incoming>
                      <bpmn:outgoing>F_dongY</bpmn:outgoing>
                      <bpmn:outgoing>F_rework</bpmn:outgoing>
                      <bpmn:outgoing>F_khongDat</bpmn:outgoing>
                    </bpmn:exclusiveGateway>
                    <bpmn:endEvent id="Dat" name="Đạt">
                      <bpmn:incoming>F_dongY</bpmn:incoming>
                    </bpmn:endEvent>
                    <bpmn:endEvent id="KhongDat" name="Không đạt">
                      <bpmn:incoming>F_khongDat</bpmn:incoming>
                    </bpmn:endEvent>
                    <bpmn:sequenceFlow id="F_start" sourceRef="BatDau" targetRef="LapHoSo" />
                    <bpmn:sequenceFlow id="F_toDuyet" sourceRef="LapHoSo" targetRef="DuyetHoSo" />
                    <bpmn:sequenceFlow id="F_toGateway" sourceRef="DuyetHoSo" targetRef="KetQua" />
                    <bpmn:sequenceFlow id="F_dongY" name="Đồng ý" sourceRef="KetQua" targetRef="Dat">
                      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">= ketQuaDuyet = "dong_y"</bpmn:conditionExpression>
                    </bpmn:sequenceFlow>
                    <bpmn:sequenceFlow id="F_rework" name="Yêu cầu hiệu chỉnh" sourceRef="KetQua" targetRef="LapHoSo">
                      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">= ketQuaDuyet = "hieu_chinh"</bpmn:conditionExpression>
                    </bpmn:sequenceFlow>
                    <bpmn:sequenceFlow id="F_khongDat" name="Không đạt" sourceRef="KetQua" targetRef="KhongDat" />
                  </bpmn:process>
                </bpmn:definitions>
                """;
    }
}
