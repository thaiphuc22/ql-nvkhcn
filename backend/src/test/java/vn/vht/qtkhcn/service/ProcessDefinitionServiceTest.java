package vn.vht.qtkhcn.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import vn.vht.qtkhcn.camunda.CamundaDeploymentService;
import vn.vht.qtkhcn.domain.ProcessDefinitionCatalog;
import vn.vht.qtkhcn.domain.ProcessDefinitionVersion;
import vn.vht.qtkhcn.repository.ProcessDefinitionCatalogRepository;
import vn.vht.qtkhcn.repository.ProcessDefinitionVersionRepository;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.ProcessRoutingResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.ProcessStepResponse;

class ProcessDefinitionServiceTest {

    private ProcessDefinitionImportValidator validator;
    private CamundaDeploymentService deploymentService;
    private ProcessDefinitionCatalogRepository catalogRepository;
    private ProcessDefinitionVersionRepository versionRepository;
    private DeployedBpmnRoutingReader routingReader;
    private org.springframework.context.ApplicationEventPublisher events;
    private ProcessDefinitionService service;

    @BeforeEach
    void setUp() {
        validator = mock(ProcessDefinitionImportValidator.class);
        deploymentService = mock(CamundaDeploymentService.class);
        catalogRepository = mock(ProcessDefinitionCatalogRepository.class);
        versionRepository = mock(ProcessDefinitionVersionRepository.class);
        routingReader = mock(DeployedBpmnRoutingReader.class);
        events = mock(org.springframework.context.ApplicationEventPublisher.class);
        service = new ProcessDefinitionService(validator, deploymentService, catalogRepository, versionRepository,
                routingReader, events);
        when(catalogRepository.save(any(ProcessDefinitionCatalog.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(versionRepository.save(any(ProcessDefinitionVersion.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void repeatedProcessIdAddsCamundaVersionWithoutReplacingCatalog() {
        var file = file();
        var validated = validated();
        ProcessDefinitionCatalog existing = catalog("demo");
        when(validator.validate(file)).thenReturn(validated);
        when(deploymentService.deploy(validated.bytes(), validated.resourceName()))
                .thenReturn(new CamundaDeploymentService.DeploymentResult(22L, "demo", 2, 33L, "demo.bpmn"));
        when(catalogRepository.findByBpmnProcessId("demo")).thenReturn(Optional.of(existing));

        var response = service.importBpmn(file, "tester");

        assertEquals(existing.getId(), response.id());
        assertEquals(2, response.version());
        assertEquals(33L, response.camundaProcessDefinitionKey());
        assertSame(existing, catalogRepository.save(existing));
        verify(versionRepository).save(any(ProcessDefinitionVersion.class));
    }

    @Test
    void identicalContentRedeployReturningSameKeyIsRejectedNotInserted() {
        var file = file();
        var validated = validated();
        ProcessDefinitionVersion existingVersion = new ProcessDefinitionVersion();
        existingVersion.setCamundaVersion(4);
        existingVersion.setImportedAt(OffsetDateTime.now());
        when(validator.validate(file)).thenReturn(validated);
        when(deploymentService.deploy(validated.bytes(), validated.resourceName()))
                .thenReturn(new CamundaDeploymentService.DeploymentResult(22L, "demo", 4, 33L, "demo.bpmn"));
        when(versionRepository.findByCamundaProcessDefinitionKey(33L)).thenReturn(Optional.of(existingVersion));

        ProcessImportException ex = assertThrows(ProcessImportException.class,
                () -> service.importBpmn(file, "tester"));

        assertEquals(ProcessImportException.Kind.DEPLOYMENT, ex.getKind());
        verify(catalogRepository, never()).save(any());
        verify(versionRepository, never()).save(any());
    }

    @Test
    void camundaFailureCreatesNoCatalogOrVersionRecord() {
        var file = file();
        var validated = validated();
        when(validator.validate(file)).thenReturn(validated);
        when(deploymentService.deploy(validated.bytes(), validated.resourceName()))
                .thenThrow(new ProcessImportException(ProcessImportException.Kind.DEPLOYMENT,
                        "Camunda unavailable", List.of("connection refused")));

        assertThrows(ProcessImportException.class, () -> service.importBpmn(file, "tester"));

        verify(catalogRepository, never()).save(any());
        verify(versionRepository, never()).save(any());
    }

    @Test
    void lintErrorBlocksDeploymentBeforeCamunda() {
        byte[] bytes = "xml".getBytes(StandardCharsets.UTF_8);
        ValidatedBpmn invalid = new ValidatedBpmn(bytes, "xml", "demo.bpmn", "demo", "Demo",
                "a".repeat(64), List.of(), List.of(new BpmnLintIssue("START_EVENT_MISSING",
                        BpmnIssueSeverity.ERROR, "Thiếu Start Event.", "demo", "Demo")));

        ProcessImportException error = assertThrows(ProcessImportException.class,
                () -> service.publishValidated(invalid, "tester"));

        assertEquals(ProcessImportException.Kind.VALIDATION, error.getKind());
        verify(deploymentService, never()).deploy(any(), any());
    }

    @Test
    void selectableCountsUserTasksFromTheDeployedBpmnAndSkipsCatalogsWithoutAVersion() {
        ProcessDefinitionCatalog withVersion = catalog("quy_trinh_moi");
        ProcessDefinitionCatalog withoutVersion = catalog("chua_deploy");
        when(catalogRepository.findAllByOrderByBpmnProcessIdAsc())
                .thenReturn(List.of(withVersion, withoutVersion));
        when(versionRepository.findFirstByCatalogIdOrderByCamundaVersionDesc(withVersion.getId()))
                .thenReturn(Optional.of(version(7)));
        when(versionRepository.findFirstByCatalogIdOrderByCamundaVersionDesc(withoutVersion.getId()))
                .thenReturn(Optional.empty());
        when(routingReader.processes()).thenReturn(List.of(new ProcessRoutingResponse("quy_trinh_moi", "Demo",
                List.of(step("T01"), step("T02")))));

        var selectable = service.selectable();

        assertEquals(1, selectable.size());
        assertEquals("quy_trinh_moi", selectable.getFirst().bpmnProcessId());
        assertEquals(7, selectable.getFirst().latestVersion());
        assertEquals(2, selectable.getFirst().userTaskCount());
    }

    /** Quy trình không có userTask nào vẫn được liệt kê (user chọn tự do), chỉ báo count = 0. */
    @Test
    void selectableStillListsAProcessTheRoutingReaderKnowsNothingAbout() {
        ProcessDefinitionCatalog catalog = catalog("khong_co_user_task");
        when(catalogRepository.findAllByOrderByBpmnProcessIdAsc()).thenReturn(List.of(catalog));
        when(versionRepository.findFirstByCatalogIdOrderByCamundaVersionDesc(catalog.getId()))
                .thenReturn(Optional.of(version(1)));
        when(routingReader.processes()).thenReturn(List.of());

        var selectable = service.selectable();

        assertEquals(1, selectable.size());
        assertEquals(0, selectable.getFirst().userTaskCount());
    }

    /**
     * Sự kiện này là thứ khiến quy trình vừa deploy có sẵn luật hiển thị nút (xem
     * {@link DeployedProcessPolicyScaffolder}). Phát trong transaction deploy, xử lý sau khi commit.
     */
    @Test
    void deployingAProcessAnnouncesItSoActionPoliciesCanBeScaffolded() {
        var file = file();
        var validated = validated();
        when(validator.validate(file)).thenReturn(validated);
        when(deploymentService.deploy(validated.bytes(), validated.resourceName()))
                .thenReturn(new CamundaDeploymentService.DeploymentResult(22L, "demo", 1, 33L, "demo.bpmn"));

        service.importBpmn(file, "tester");

        verify(events).publishEvent(new ProcessDeployedEvent("demo", "tester"));
    }

    @Test
    void normalizeActorDecodesUtf8HeaderWithoutLosingVietnameseName() {
        assertEquals("Nguyễn Văn An",
                ProcessDefinitionService.normalizeActor("UTF-8''Nguy%E1%BB%85n%20V%C4%83n%20An"));
    }

    private static MockMultipartFile file() {
        return new MockMultipartFile("file", "demo.bpmn", "application/xml", "xml".getBytes());
    }

    private static ValidatedBpmn validated() {
        byte[] bytes = "xml".getBytes(StandardCharsets.UTF_8);
        return new ValidatedBpmn(bytes, "xml", "demo.bpmn", "demo", "Demo", "a".repeat(64), List.of());
    }

    private static ProcessDefinitionVersion version(int camundaVersion) {
        ProcessDefinitionVersion version = new ProcessDefinitionVersion();
        version.setId(UUID.randomUUID());
        version.setCamundaVersion(camundaVersion);
        return version;
    }

    private static ProcessStepResponse step(String key) {
        return new ProcessStepResponse(key, key, "PM", null, List.of());
    }

    private static ProcessDefinitionCatalog catalog(String processId) {
        ProcessDefinitionCatalog catalog = new ProcessDefinitionCatalog();
        catalog.setId(UUID.randomUUID());
        catalog.setBpmnProcessId(processId);
        catalog.setName("Demo");
        catalog.setCreatedAt(OffsetDateTime.now());
        catalog.setUpdatedAt(OffsetDateTime.now());
        return catalog;
    }
}
