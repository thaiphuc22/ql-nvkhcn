package vn.vht.qtkhcn.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import vn.vht.qtkhcn.camunda.JobWorkerRegistry;
import vn.vht.qtkhcn.domain.ProcessDefinitionCatalog;
import vn.vht.qtkhcn.domain.ProcessDefinitionSource;
import vn.vht.qtkhcn.domain.ProcessDefinitionVersion;
import vn.vht.qtkhcn.repository.EformRepository;
import vn.vht.qtkhcn.repository.ProcessDefinitionCatalogRepository;
import vn.vht.qtkhcn.repository.ProcessDefinitionVersionRepository;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.ReconcileResponse;

/**
 * Ba chẩn đoán chuyển từ Lát 0 (guard deploy-time, đã huỷ theo quyết định user 2026-07-28) sang màn
 * đối soát: biểu mẫu có thật không, vai trò có trong danh mục không, service task có worker không.
 */
class ProcessReadinessServiceTest {

    private static final UUID CATALOG_ID = UUID.randomUUID();

    private ProcessDefinitionCatalogRepository catalogRepository;
    private ProcessDefinitionVersionRepository versionRepository;
    private ActionStudioService actionStudio;
    private EformRepository eforms;
    private JobWorkerRegistry jobWorkers;
    private ProcessReadinessService service;

    @BeforeEach
    void setUp() {
        catalogRepository = mock(ProcessDefinitionCatalogRepository.class);
        versionRepository = mock(ProcessDefinitionVersionRepository.class);
        actionStudio = mock(ActionStudioService.class);
        eforms = mock(EformRepository.class);
        jobWorkers = mock(JobWorkerRegistry.class);
        service = new ProcessReadinessService(catalogRepository, versionRepository, actionStudio, eforms,
                jobWorkers);
        when(actionStudio.reconcile(any())).thenReturn(List.of());
    }

    @Test
    void aWellFormedProcessWithARealFormRealRoleAndPinnedRulesIsGreen() {
        deployed(bpmn("""
                <bpmn:userTask id="Duyet" name="Duyệt hồ sơ">
                  <bpmn:extensionElements>
                    <zeebe:assignmentDefinition candidateGroups="CQ_KHCN" />
                    <zeebe:formDefinition formKey="phieu-phe-duyet" />
                  </bpmn:extensionElements>
                </bpmn:userTask>
                """));
        when(eforms.existsById("phieu-phe-duyet")).thenReturn(true);
        when(actionStudio.reconcile("quy_trinh_moi")).thenReturn(List.of(
                new ReconcileResponse("quy_trinh_moi", "Duyet", "Duyệt hồ sơ", "dong_y", "APPROVE_STEP",
                        "ok", "AP-BPMN-quy_trinh_moi-Duyet-dong_y", "Đã ghim đúng bước và đủ cấu hình.")));

        var readiness = service.readiness("quy_trinh_moi");

        assertThat(readiness.status()).isEqualTo("ok");
        assertThat(readiness.userTasks()).singleElement().satisfies(task -> {
            assertThat(task.issues()).isEmpty();
            assertThat(task.formExists()).isTrue();
            assertThat(task.boundActions()).containsExactly("APPROVE_STEP");
        });
    }

    /** Biểu mẫu khai trong BPMN nhưng không có trong thư viện ⇒ mở bước lên là trắng màn. */
    @Test
    void aFormKeyThatIsNotInTheLibraryIsAnError() {
        deployed(bpmn("""
                <bpmn:userTask id="Duyet" name="Duyệt hồ sơ">
                  <bpmn:extensionElements>
                    <zeebe:assignmentDefinition candidateGroups="CQ_KHCN" />
                    <zeebe:formDefinition formKey="phieu-khong-ton-tai" />
                  </bpmn:extensionElements>
                </bpmn:userTask>
                """));
        when(eforms.existsById("phieu-khong-ton-tai")).thenReturn(false);

        var readiness = service.readiness("quy_trinh_moi");

        assertThat(readiness.status()).isEqualTo("error");
        assertThat(readiness.userTasks().getFirst().issues())
                .anySatisfy(issue -> assertThat(issue).contains("phieu-khong-ton-tai"));
    }

    /**
     * Gõ nhầm mã vai trò là lỗi im lặng nguy hiểm nhất: Camunda vẫn tạo task, nhưng không ai có vai
     * trò đó nên không ai thấy việc — hồ sơ đứng im mà hệ thống không báo gì.
     */
    @Test
    void aCandidateGroupOutsideTheRoleCatalogIsFlagged() {
        deployed(bpmn("""
                <bpmn:userTask id="Duyet" name="Duyệt hồ sơ">
                  <bpmn:extensionElements>
                    <zeebe:assignmentDefinition candidateGroups="TD_KHCN, CQ_KHCN" />
                    <zeebe:formDefinition formKey="phieu-phe-duyet" />
                  </bpmn:extensionElements>
                </bpmn:userTask>
                """));
        when(eforms.existsById("phieu-phe-duyet")).thenReturn(true);

        var readiness = service.readiness("quy_trinh_moi");

        assertThat(readiness.status()).isEqualTo("warn");
        assertThat(readiness.userTasks().getFirst().unknownRoleCodes()).containsExactly("TD_KHCN");
    }

    /**
     * Đúng lớp bug RD02.02 {@code Check} ngày 2026-07-20, lần này do người dùng tự tạo ra vì user
     * quyết định không chặn deploy service task.
     */
    @Test
    void aServiceTaskWithoutAnyWorkerListeningIsReportedAsAHangRisk() {
        deployed(bpmn("""
                <bpmn:serviceTask id="Check" name="Kiểm tra tự động">
                  <bpmn:extensionElements>
                    <zeebe:taskDefinition type="khcn.chua-ai-lam" />
                  </bpmn:extensionElements>
                </bpmn:serviceTask>
                """));
        when(jobWorkers.hasWorker("khcn.chua-ai-lam")).thenReturn(false);

        var readiness = service.readiness("quy_trinh_moi");

        assertThat(readiness.status()).isEqualTo("error");
        assertThat(readiness.serviceTasks()).singleElement().satisfies(task -> {
            assertThat(task.workerRegistered()).isFalse();
            assertThat(task.issue()).contains("TREO");
        });
        // Không có user task nào ⇒ phải nói ra, nếu không người đọc tưởng quy trình chỉ thiếu worker.
        assertThat(readiness.notes()).anySatisfy(note -> assertThat(note).contains("không có user task"));
    }

    @Test
    void aServiceTaskWithARegisteredWorkerIsGreen() {
        deployed(bpmn("""
                <bpmn:serviceTask id="Check" name="Kiểm tra tự động">
                  <bpmn:extensionElements>
                    <zeebe:taskDefinition type="khcn.rd0101.check-default-condition" />
                  </bpmn:extensionElements>
                </bpmn:serviceTask>
                """));
        when(jobWorkers.hasWorker("khcn.rd0101.check-default-condition")).thenReturn(true);

        assertThat(service.readiness("quy_trinh_moi").serviceTasks().getFirst().status()).isEqualTo("ok");
    }

    /**
     * Marker {@code <zeebe:userTask />} của Camunda Modeler nằm trong extensionElements và KHÔNG có id
     * — đọc lẫn vào sẽ sinh ra một "bước ma" id rỗng, đúng cái bẫy đã ghi ở DeployedBpmnRoutingReader.
     */
    @Test
    void theZeebeUserTaskMarkerDoesNotBecomeAGhostStep() {
        deployed(bpmn("""
                <bpmn:userTask id="Duyet" name="Duyệt hồ sơ">
                  <bpmn:extensionElements>
                    <zeebe:userTask />
                    <zeebe:assignmentDefinition candidateGroups="CQ_KHCN" />
                    <zeebe:formDefinition formKey="phieu-phe-duyet" />
                  </bpmn:extensionElements>
                </bpmn:userTask>
                """));
        when(eforms.existsById("phieu-phe-duyet")).thenReturn(true);

        assertThat(service.readiness("quy_trinh_moi").userTasks())
                .extracting(task -> task.elementId()).containsExactly("Duyet");
    }

    /** Lỗi đối soát luật không được làm mất luôn phần chẩn đoán biểu mẫu/vai trò/worker. */
    @Test
    void aFailingActionReconcileDegradesToANoteInsteadOfBreakingTheWholeReport() {
        deployed(bpmn("""
                <bpmn:userTask id="Duyet" name="Duyệt hồ sơ">
                  <bpmn:extensionElements>
                    <zeebe:assignmentDefinition candidateGroups="CQ_KHCN" />
                    <zeebe:formDefinition formKey="phieu-phe-duyet" />
                  </bpmn:extensionElements>
                </bpmn:userTask>
                """));
        when(eforms.existsById("phieu-phe-duyet")).thenReturn(true);
        when(actionStudio.reconcile("quy_trinh_moi"))
                .thenThrow(new IllegalArgumentException("Quy trình chưa được deploy: quy_trinh_moi"));

        var readiness = service.readiness("quy_trinh_moi");

        assertThat(readiness.userTasks()).hasSize(1);
        assertThat(readiness.notes()).anySatisfy(note -> assertThat(note).contains("Không đối soát được"));
    }

    private void deployed(String xml) {
        ProcessDefinitionCatalog catalog = new ProcessDefinitionCatalog();
        catalog.setId(CATALOG_ID);
        catalog.setBpmnProcessId("quy_trinh_moi");
        catalog.setName("Quy trình mới");
        ProcessDefinitionVersion version = new ProcessDefinitionVersion();
        version.setCamundaVersion(1);
        version.setSource(ProcessDefinitionSource.APP);
        version.setBpmnXml(xml);
        when(catalogRepository.findByBpmnProcessId("quy_trinh_moi")).thenReturn(Optional.of(catalog));
        when(versionRepository.findFirstByCatalogIdOrderByCamundaVersionDesc(CATALOG_ID))
                .thenReturn(Optional.of(version));
        when(jobWorkers.registeredTypes()).thenReturn(Set.of("khcn.rd0101.check-default-condition"));
    }

    private static String bpmn(String body) {
        return """
                <?xml version="1.0" encoding="UTF-8"?>
                <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                    xmlns:zeebe="http://camunda.org/schema/zeebe/1.0">
                  <bpmn:process id="quy_trinh_moi" isExecutable="true">
                %s
                  </bpmn:process>
                </bpmn:definitions>
                """.formatted(body);
    }
}
