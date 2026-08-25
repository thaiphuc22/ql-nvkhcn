package vn.vht.qtkhcn.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import vn.vht.qtkhcn.domain.ProcessDefinitionCatalog;
import vn.vht.qtkhcn.domain.ProcessDefinitionVersion;
import java.util.List;
import vn.vht.qtkhcn.domain.ActionOutcomeKeyword;
import vn.vht.qtkhcn.repository.ActionOutcomeKeywordRepository;
import vn.vht.qtkhcn.repository.ProcessDefinitionCatalogRepository;
import vn.vht.qtkhcn.repository.ProcessDefinitionVersionRepository;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.ProcessRoutingResponse;

class DeployedBpmnRoutingReaderTest {
    @Test
    void parsesRealTasksRolesFormsAndGatewayOutcomes() throws Exception {
        ProcessDefinitionCatalog catalog = new ProcessDefinitionCatalog();
        catalog.setId(UUID.randomUUID());
        catalog.setBpmnProcessId("RD01_01");
        catalog.setName("Xét duyệt Chủ trương cấp Cơ sở");
        ProcessDefinitionVersion version = new ProcessDefinitionVersion();
        version.setBpmnXml(Files.readString(Path.of("src/main/resources/processes/rd0101.bpmn"), StandardCharsets.UTF_8));

        DeployedBpmnRoutingReader reader = new DeployedBpmnRoutingReader(
                mock(ProcessDefinitionCatalogRepository.class), mock(ProcessDefinitionVersionRepository.class));
        var routing = reader.parse(catalog, version);

        assertThat(routing.code()).isEqualTo("RD01_01");
        assertThat(routing.steps()).hasSize(13);
        var task6 = routing.steps().stream().filter(step -> step.key().equals("Task_6")).findFirst().orElseThrow();
        assertThat(task6.role()).isEqualTo("HDKHCN");
        assertThat(task6.formKey()).isEqualTo("phieu-nhan-xet");
        assertThat(task6.branches()).extracting(branch -> branch.outcome())
                .contains("dong_y_bo_sung", "hieu_chinh", "khong_dong_y");
    }

    @Test
    void rd0202V3ExposesApproveAndRejectActionsFromTheBundledContract() throws Exception {
        ProcessDefinitionCatalog catalog = new ProcessDefinitionCatalog();
        catalog.setId(UUID.randomUUID());
        catalog.setBpmnProcessId("RD02_02");
        catalog.setName("Xét duyệt nhiệm vụ KHCN cấp Tập đoàn");
        ProcessDefinitionVersion version = new ProcessDefinitionVersion();
        version.setBpmnXml(Files.readString(Path.of("src/main/resources/processes/rd0202.bpmn"),
                StandardCharsets.UTF_8));

        DeployedBpmnRoutingReader reader = new DeployedBpmnRoutingReader(
                mock(ProcessDefinitionCatalogRepository.class), mock(ProcessDefinitionVersionRepository.class));
        var routing = reader.parse(catalog, version);

        assertThat(routing.steps()).isNotEmpty().allSatisfy(step ->
                assertThat(step.branches()).extracting(branch -> branch.outcome())
                        .containsExactly("APPROVE", "REJECT"));
        assertThat(routing.steps().stream().filter(step -> step.key().equals("T14_GD_TTMS")).findFirst())
                .isPresent().get().extracting(step -> step.role()).isEqualTo("GD_TTMS");
    }

    /**
     * Marker {@code <zeebe:userTask />} (Camunda Modeler / bpmn-js gắn vào extensionElements) trùng
     * tên cục bộ với {@code bpmn:userTask}. Nếu đọc theo namespace wildcard, mỗi marker sinh thêm 1
     * "bước ma" key rỗng ⇒ scaffold dựng trùng id AP-BPMN-<mã>--APPROVE và vỡ cả lượt.
     */
    @Test
    void zeebeUserTaskMarkerDoesNotProduceGhostStepWithBlankKey() {
        ProcessDefinitionCatalog catalog = new ProcessDefinitionCatalog();
        catalog.setId(UUID.randomUUID());
        catalog.setBpmnProcessId("RD02_02");
        catalog.setName("Xét duyệt NV KHCN cấp Tập đoàn");
        ProcessDefinitionVersion version = new ProcessDefinitionVersion();
        version.setBpmnXml("""
                <?xml version="1.0" encoding="UTF-8"?>
                <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                    xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" id="Defs_1">
                  <bpmn:process id="RD02_02" name="Xét duyệt NV KHCN cấp Tập đoàn" isExecutable="true">
                    <bpmn:extensionElements><zeebe:properties>
                      <zeebe:property name="qtkhcn.userTaskActions" value="APPROVE_STEP,REJECT_STEP" />
                    </zeebe:properties></bpmn:extensionElements>
                    <bpmn:userTask id="T01" name="1. Khởi tạo"><bpmn:extensionElements>
                      <zeebe:userTask />
                      <zeebe:assignmentDefinition candidateGroups="PM" />
                    </bpmn:extensionElements><bpmn:outgoing>F01</bpmn:outgoing></bpmn:userTask>
                    <bpmn:userTask id="T02" name="2. Phê duyệt"><bpmn:extensionElements>
                      <zeebe:userTask />
                      <zeebe:assignmentDefinition candidateGroups="TGD_VHT" />
                    </bpmn:extensionElements><bpmn:incoming>F01</bpmn:incoming></bpmn:userTask>
                    <bpmn:sequenceFlow id="F01" sourceRef="T01" targetRef="T02" />
                  </bpmn:process>
                </bpmn:definitions>
                """);

        DeployedBpmnRoutingReader reader = new DeployedBpmnRoutingReader(
                mock(ProcessDefinitionCatalogRepository.class), mock(ProcessDefinitionVersionRepository.class));
        var routing = reader.parse(catalog, version);

        assertThat(routing.steps()).extracting(step -> step.key()).containsExactly("T01", "T02");
        assertThat(routing.steps()).extracting(step -> step.key()).doesNotContain("");
    }

    /**
     * Bước khai biểu mẫu bằng {@code formId} (khách khai eForm trên Camunda rồi gắn vào task) phải ra
     * đúng khoá biểu mẫu. Trước đây reader chỉ đọc attribute {@code formKey} nên trả null, kéo theo
     * scaffold không ghim form vào luật hành động — bấm nút xong không có gì để điền.
     */
    @Test
    void stepFormKeyDocDuocCaFormIdLanFormNhung() {
        ProcessDefinitionCatalog catalog = new ProcessDefinitionCatalog();
        catalog.setId(UUID.randomUUID());
        catalog.setBpmnProcessId("RD07");
        catalog.setName("Quy trình khách tự vẽ");
        ProcessDefinitionVersion version = new ProcessDefinitionVersion();
        version.setBpmnXml("""
                <?xml version="1.0" encoding="UTF-8"?>
                <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                    xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" id="Defs_1">
                  <bpmn:process id="RD07" name="Quy trình khách tự vẽ" isExecutable="true">
                    <bpmn:userTask id="T01" name="Thẩm định"><bpmn:extensionElements>
                      <zeebe:userTask />
                      <zeebe:formDefinition formId="approval-form" />
                    </bpmn:extensionElements><bpmn:outgoing>F01</bpmn:outgoing></bpmn:userTask>
                    <bpmn:userTask id="T02" name="Ký duyệt"><bpmn:extensionElements>
                      <zeebe:formDefinition formKey="camunda-forms:bpmn:UserTaskForm_1" />
                    </bpmn:extensionElements><bpmn:incoming>F01</bpmn:incoming></bpmn:userTask>
                    <bpmn:sequenceFlow id="F01" sourceRef="T01" targetRef="T02" />
                  </bpmn:process>
                </bpmn:definitions>
                """);

        var routing = new DeployedBpmnRoutingReader(mock(ProcessDefinitionCatalogRepository.class),
                mock(ProcessDefinitionVersionRepository.class)).parse(catalog, version);

        assertThat(routing.steps()).extracting(step -> step.formKey())
                .containsExactly("approval-form", "UserTaskForm_1");
    }

    /**
     * Tên biến điều khiển phải đọc được từ conditionExpression, không chỉ giá trị: đây là thứ
     * {@code WorkflowTaskActionRouting} cần để quy trình người dùng tự vẽ bấm nút xong rẽ đúng nhánh.
     *
     * <p>Nhánh {@code khong_dong_y} của Gateway_6 là <b>default flow</b> nên KHÔNG có
     * conditionExpression — không có gì để đọc ra tên biến, và đó là đúng: chọn default flow là việc
     * của Zeebe khi không điều kiện nào khớp, không phải việc set biến.
     */
    @Test
    void gatewayConditionsYieldBothTheVariableNameAndTheOutcomeValue() throws Exception {
        var routing = parseRd0101();

        var task6 = routing.steps().stream().filter(step -> step.key().equals("Task_6")).findFirst().orElseThrow();
        assertThat(task6.branches()).filteredOn(branch -> branch.variable() != null)
                .extracting(branch -> branch.outcome())
                .containsExactlyInAnyOrder("dong_y_bo_sung", "hieu_chinh");
        assertThat(task6.branches()).filteredOn(branch -> branch.variable() != null)
                .allSatisfy(branch -> assertThat(branch.variable()).isEqualTo("ketQuaThamDinh"));
        assertThat(task6.branches()).filteredOn(branch -> branch.outcome().equals("khong_dong_y"))
                .singleElement().satisfies(branch -> assertThat(branch.variable()).isNull());
    }

    @Test
    void actionVariablesMapsBpmnOutcomesOntoActionCodes() {
        ProcessDefinitionCatalog catalog = new ProcessDefinitionCatalog();
        catalog.setId(UUID.randomUUID());
        catalog.setBpmnProcessId("quy_trinh_moi");
        catalog.setName("Quy trình mới");
        ProcessDefinitionVersion version = new ProcessDefinitionVersion();
        version.setCamundaProcessDefinitionKey(4242L);
        version.setBpmnXml("""
                <?xml version="1.0" encoding="UTF-8"?>
                <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                    xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" id="Defs_1">
                  <bpmn:process id="quy_trinh_moi" name="Quy trình mới" isExecutable="true">
                    <bpmn:userTask id="Duyet" name="Duyệt hồ sơ"><bpmn:extensionElements>
                      <zeebe:assignmentDefinition candidateGroups="CQ_KHCN" />
                    </bpmn:extensionElements><bpmn:outgoing>F1</bpmn:outgoing></bpmn:userTask>
                    <bpmn:exclusiveGateway id="G1" name="Kết quả?" />
                    <bpmn:endEvent id="Xong" name="Hoàn tất" />
                    <bpmn:endEvent id="TuChoi" name="Kết thúc — từ chối" />
                    <bpmn:sequenceFlow id="F1" sourceRef="Duyet" targetRef="G1" />
                    <bpmn:sequenceFlow id="F2" name="Đồng ý" sourceRef="G1" targetRef="Xong">
                      <bpmn:conditionExpression>= ketQuaDuyet = "dong_y"</bpmn:conditionExpression>
                    </bpmn:sequenceFlow>
                    <bpmn:sequenceFlow id="F3" name="Từ chối" sourceRef="G1" targetRef="TuChoi">
                      <bpmn:conditionExpression>= ketQuaDuyet = "khong_dong_y"</bpmn:conditionExpression>
                    </bpmn:sequenceFlow>
                  </bpmn:process>
                </bpmn:definitions>
                """);
        var catalogs = mock(ProcessDefinitionCatalogRepository.class);
        var versions = mock(ProcessDefinitionVersionRepository.class);
        when(catalogs.findByBpmnProcessId("quy_trinh_moi")).thenReturn(java.util.Optional.of(catalog));
        when(versions.findFirstByCatalogIdOrderByCamundaVersionDesc(catalog.getId()))
                .thenReturn(java.util.Optional.of(version));

        var variables = new DeployedBpmnRoutingReader(catalogs, versions)
                .actionVariables("quy_trinh_moi", "Duyet");

        assertThat(variables).containsOnlyKeys("APPROVE_STEP", "REJECT_STEP");
        assertThat(variables.get("APPROVE_STEP")).containsEntry("ketQuaDuyet", "dong_y");
        assertThat(variables.get("REJECT_STEP")).containsEntry("ketQuaDuyet", "khong_dong_y");
    }

    /**
     * Từ khoá riêng của khách, do BA khai trong Danh mục nút (không có trong bảng cứng
     * {@link BpmnOutcomeCodes}), phải được nhận diện — VÀ giá trị gửi vào Zeebe vẫn là chữ trên BẢN VẼ
     * ({@code thong_qua}), không phải một giá trị "chuẩn" nào lấy từ từ điển. Từ điển chỉ mở cửa cho
     * gói được gửi, nó không đổi một chữ nào trong gói.
     */
    @Test
    void keywordDeclaredByBaIsRecognisedButTheValueSentStillComesFromTheDiagram() {
        ProcessDefinitionCatalog catalog = new ProcessDefinitionCatalog();
        catalog.setId(UUID.randomUUID());
        catalog.setBpmnProcessId("tu_ngu_rieng");
        catalog.setName("Quy trình dùng từ ngữ riêng");
        ProcessDefinitionVersion version = new ProcessDefinitionVersion();
        version.setCamundaProcessDefinitionKey(9911L);
        version.setBpmnXml("""
                <?xml version="1.0" encoding="UTF-8"?>
                <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                    xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" id="Defs_1">
                  <bpmn:process id="tu_ngu_rieng" name="Quy trình" isExecutable="true">
                    <bpmn:userTask id="Duyet" name="Duyệt hồ sơ"><bpmn:extensionElements>
                      <zeebe:assignmentDefinition candidateGroups="CQ_KHCN" />
                    </bpmn:extensionElements><bpmn:outgoing>F1</bpmn:outgoing></bpmn:userTask>
                    <bpmn:exclusiveGateway id="G1" name="Kết quả?" />
                    <bpmn:endEvent id="Xong" name="Hoàn tất" />
                    <bpmn:sequenceFlow id="F1" sourceRef="Duyet" targetRef="G1" />
                    <bpmn:sequenceFlow id="F2" name="Thông qua" sourceRef="G1" targetRef="Xong">
                      <bpmn:conditionExpression>= ketQua = "thong_qua"</bpmn:conditionExpression>
                    </bpmn:sequenceFlow>
                  </bpmn:process>
                </bpmn:definitions>
                """);
        var catalogs = mock(ProcessDefinitionCatalogRepository.class);
        var versions = mock(ProcessDefinitionVersionRepository.class);
        when(catalogs.findByBpmnProcessId("tu_ngu_rieng")).thenReturn(java.util.Optional.of(catalog));
        when(versions.findFirstByCatalogIdOrderByCamundaVersionDesc(catalog.getId()))
                .thenReturn(java.util.Optional.of(version));

        var withoutKeyword = new DeployedBpmnRoutingReader(catalogs, versions)
                .actionVariables("tu_ngu_rieng", "Duyet");
        assertThat(withoutKeyword).isEmpty();

        ActionOutcomeKeyword declared = new ActionOutcomeKeyword();
        declared.setKeyword("thong_qua");
        declared.setActionCode("APPROVE_STEP");
        var keywords = mock(ActionOutcomeKeywordRepository.class);
        when(keywords.findAllByOrderByActionCodeAscKeywordAsc()).thenReturn(List.of(declared));

        var withKeyword = new DeployedBpmnRoutingReader(catalogs, versions,
                new OutcomeKeywordCatalog(keywords)).actionVariables("tu_ngu_rieng", "Duyet");

        assertThat(withKeyword).containsOnlyKeys("APPROVE_STEP");
        assertThat(withKeyword.get("APPROVE_STEP")).containsEntry("ketQua", "thong_qua");
    }

    /** Quy trình chưa vào catalog thì trả rỗng, KHÔNG ném — đường gọi là thao tác duyệt của người dùng. */
    @Test
    void actionVariablesReturnsEmptyForAProcessThatIsNotInTheCatalogYet() {
        var reader = new DeployedBpmnRoutingReader(mock(ProcessDefinitionCatalogRepository.class),
                mock(ProcessDefinitionVersionRepository.class));

        assertThat(reader.actionVariables("chua_co", "Duyet")).isEmpty();
    }

    private static ProcessRoutingResponse parseRd0101() throws Exception {
        ProcessDefinitionCatalog catalog = new ProcessDefinitionCatalog();
        catalog.setId(UUID.randomUUID());
        catalog.setBpmnProcessId("RD01_01");
        catalog.setName("Xét duyệt Chủ trương cấp Cơ sở");
        ProcessDefinitionVersion version = new ProcessDefinitionVersion();
        version.setBpmnXml(Files.readString(Path.of("src/main/resources/processes/rd0101.bpmn"),
                StandardCharsets.UTF_8));
        return new DeployedBpmnRoutingReader(mock(ProcessDefinitionCatalogRepository.class),
                mock(ProcessDefinitionVersionRepository.class)).parse(catalog, version);
    }
}
